"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { createEditorState, editorReducer, type EditorAction, type EditorState } from "./model/editor-reducer";
import { DEFAULT_IMAGE_SECONDS, MAX_IMAGE_SECONDS, layerDuration, projectDuration } from "./model/timeline";
import type { EditorProject, LayerKind, MediaKind, MediaSourceRef, TimelineItem } from "./model/types";
import { mediaKindOfFile } from "./media/local-files";
import { useSession } from "next-auth/react";
import { downloadAsFile, resolveLibraryUrls, type ActivityMedia } from "./media/library";
import { probeImage, probeMedia } from "./media/probe";
import {
  deleteDraft,
  deleteUnusedFiles,
  loadDraft,
  loadProjectFiles,
  saveDraft,
  saveFile,
} from "./storage/draft-db";
import { STRINGS } from "./strings";

/** Same mapping as the worker's FILE_BY_FORMAT for Audio Gen output; mp3 is its default. */
function audioFileType(format: string | undefined): { extension: string; mime: string } {
  if (format === "wav") return { extension: "wav", mime: "audio/wav" };
  if (format === "ogg_opus") return { extension: "ogg", mime: "audio/ogg" };
  return { extension: "mp3", mime: "audio/mpeg" };
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Drafts saved before images existed have no `media`; infer it from the layer. */
function withMediaKinds(project: EditorProject): EditorProject {
  return {
    ...project,
    layers: project.layers.map((layer) => ({
      ...layer,
      items: layer.items.map((item) => ({
        ...item,
        media: item.media ?? (layer.kind === "music" ? "audio" : "video"),
      })),
    })),
  };
}

/** Every source the project references, split by where it lives. */
function sourceKeys(project: EditorProject) {
  const fileKeys = new Set<string>();
  const galleryIds = new Set<string>();
  for (const layer of project.layers) {
    for (const { source } of layer.items) {
      if (source.type === "local") fileKeys.add(source.fileKey);
      else galleryIds.add(source.galleryId);
    }
  }
  return { fileKeys, galleryIds };
}

export interface Selection {
  layerId: string;
  itemId: string;
}

interface EditorContextValue {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
  playhead: number;
  setPlayhead: (time: number) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  /** Local files never leave the device; items point at them by key. */
  getLocalFile: (fileKey: string) => File | undefined;
  /** Object URL for a local file or the presigned URL for a Library video. */
  resolveMediaUrl: (source: MediaSourceRef) => string | undefined;
  /** Resolves to an error message, or null when the item was added. */
  addLocalFile: (file: File) => Promise<string | null>;
  /** Video or image from the project's All Activity. */
  addActivityMedia: (entry: ActivityMedia) => Promise<string | null>;
  /** False until the saved draft (if any) has been restored. */
  ready: boolean;
  saveStatus: SaveStatus;
  /** Bumps when media URLs become available, so the preview can attach them. */
  mediaVersion: number;
  /** Clears the timeline and this device's saved draft. */
  resetProject: () => Promise<void>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const newId = () => crypto.randomUUID();

export function createEmptyProject(projectId: string): EditorProject {
  return {
    id: newId(),
    projectId,
    name: "Untitled",
    aspect: "9:16",
    layers: [
      { id: "video", kind: "video", items: [] },
      { id: newId(), kind: "music", items: [] },
    ],
    updatedAt: Date.now(),
  };
}

export function EditorProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, projectId, (id) =>
    createEditorState(createEmptyProject(id)),
  );
  const [selection, setSelection] = useState<Selection | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const localFiles = useRef(new Map<string, File>());
  const objectUrls = useRef(new Map<string, string>());
  const libraryUrls = useRef(new Map<string, string>());

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  const resolveMediaUrl = useCallback((source: MediaSourceRef) => {
    if (source.type === "gallery") return libraryUrls.current.get(source.galleryId);
    const cached = objectUrls.current.get(source.fileKey);
    if (cached) return cached;
    const file = localFiles.current.get(source.fileKey);
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    objectUrls.current.set(source.fileKey, url);
    return url;
  }, []);
  const projectRef = useRef(state.present);
  projectRef.current = state.present;
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [mediaVersion, setMediaVersion] = useState(0);

  // Restore this device's draft and its imported files before anything is saved over it.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const draft = await loadDraft(projectId);
        if (!draft || cancelled) return;
        const files = await loadProjectFiles(projectId);
        for (const [fileKey, file] of files) localFiles.current.set(fileKey, file);
        // Files left behind by clips deleted in an earlier session.
        await deleteUnusedFiles(projectId, sourceKeys(draft).fileKeys);
        if (!cancelled) dispatch({ type: "load", project: withMediaKinds(draft) });
      } catch (error) {
        console.error("[video-editor] draft restore failed", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Library URLs are presigned and expire, so restored clips fetch fresh ones.
  useEffect(() => {
    if (!ready || !organizationId) return;
    const missing = new Set(
      [...sourceKeys(state.present).galleryIds].filter((id) => !libraryUrls.current.has(id)),
    );
    if (missing.size === 0) return;
    resolveLibraryUrls(projectId, organizationId, missing)
      .then((urls) => {
        for (const [galleryId, url] of urls) libraryUrls.current.set(galleryId, url);
        if (urls.size > 0) setMediaVersion((version) => version + 1);
      })
      .catch((error: unknown) => console.error("[video-editor] library url refresh failed", error));
  }, [ready, organizationId, projectId, state.present]);

  useEffect(() => {
    if (!ready) return;
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      saveDraft({ ...state.present, updatedAt: Date.now() })
        .then(() => setSaveStatus("saved"))
        .catch((error: unknown) => {
          console.error("[video-editor] draft save failed", error);
          setSaveStatus("error");
        });
    }, 800);
    return () => clearTimeout(timer);
  }, [ready, state.present]);

  // Deleting or trimming the end can leave the playhead past the new end.
  useEffect(() => {
    const duration = projectDuration(state.present);
    setPlayhead((time) => (time > duration ? duration : time));
  }, [state.present]);

  const resetProject = useCallback(async () => {
    setPlaying(false);
    setSelection(null);
    setPlayhead(0);
    dispatch({ type: "load", project: createEmptyProject(projectId) });
    try {
      await deleteDraft(projectId);
    } catch (error) {
      console.error("[video-editor] draft delete failed", error);
    }
  }, [projectId]);

  const addItem = useCallback(
    (media: MediaKind, name: string, source: MediaSourceRef, sourceDuration: number) => {
      const kind: LayerKind = media === "audio" ? "music" : "video";
      const layer = projectRef.current.layers.find((entry) => entry.kind === kind);
      if (!layer) return;
      const item: TimelineItem = {
        id: newId(),
        name,
        media,
        source,
        sourceDuration,
        // New items go after the last one on their layer.
        start: layerDuration(layer),
        inPoint: 0,
        outPoint: media === "image" ? DEFAULT_IMAGE_SECONDS : sourceDuration,
        volume: 1,
        muted: false,
      };
      dispatch({ type: "add-item", layerId: layer.id, item });
      setSelection({ layerId: layer.id, itemId: item.id });
    },
    [],
  );

  /** Keeps a file on this device (memory + IndexedDB) and returns its key. */
  const storeLocalFile = useCallback(
    (file: File) => {
      const fileKey = newId();
      localFiles.current.set(fileKey, file);
      // Large videos can exceed the browser's storage quota; editing still works for this session.
      saveFile(projectId, fileKey, file).catch((error: unknown) => {
        console.error("[video-editor] file save failed", error);
        setSaveStatus("error");
      });
      return fileKey;
    },
    [projectId],
  );

  const addLocalFile = useCallback(
    async (file: File) => {
      const media = mediaKindOfFile(file);
      if (!media) return `${STRINGS.fileRejected}: ${file.name}`;
      try {
        if (media === "image") {
          await probeImage(file);
          addItem("image", file.name, { type: "local", fileKey: storeLocalFile(file) }, MAX_IMAGE_SECONDS);
          return null;
        }
        const probe = await probeMedia(file);
        if (probe.duration <= 0 || (media === "video" ? !probe.hasVideo : !probe.hasAudio)) {
          return STRINGS.probeFailed;
        }
        addItem(media, file.name, { type: "local", fileKey: storeLocalFile(file) }, probe.duration);
        return null;
      } catch (error) {
        console.error("[video-editor] probe failed", error);
        return STRINGS.probeFailed;
      }
    },
    [addItem, storeLocalFile],
  );

  const addActivityMedia = useCallback(
    async (entry: ActivityMedia) => {
      if (entry.media === "image") {
        // Images are small: download once with a plain GET and keep them like a local file.
        try {
          const extension = /\.(png|jpe?g|webp)(\?|$)/i.exec(entry.url)?.[1] ?? "png";
          const file = await downloadAsFile(entry.url, `${entry.name}.${extension}`, "image/png");
          await probeImage(file);
          addItem("image", entry.name, { type: "local", fileKey: storeLocalFile(file) }, MAX_IMAGE_SECONDS);
          return null;
        } catch (error) {
          console.error("[video-editor] activity image download failed", error);
          return STRINGS.activityImageFailed;
        }
      }
      // Generated videos and audio are small too; a local copy needs no Range/CORS support from the bucket.
      const { media } = entry;
      const { extension, mime } = media === "audio" ? audioFileType(entry.format) : { extension: "mp4", mime: "video/mp4" };
      let file: File;
      try {
        file = await downloadAsFile(entry.url, `${entry.name}.${extension}`, mime);
      } catch (error) {
        console.error(`[video-editor] activity ${media} download failed`, error);
        return media === "audio" ? STRINGS.activityAudioFailed : STRINGS.activityVideoFailed;
      }
      try {
        const probe = await probeMedia(file);
        if (probe.duration <= 0 || !(media === "audio" ? probe.hasAudio : probe.hasVideo)) return STRINGS.probeFailed;
        addItem(media, entry.name, { type: "local", fileKey: storeLocalFile(file) }, probe.duration);
        return null;
      } catch (error) {
        console.error("[video-editor] activity probe failed", error);
        return STRINGS.probeFailed;
      }
    },
    [addItem, storeLocalFile],
  );

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      selection,
      setSelection,
      playhead,
      setPlayhead,
      playing,
      setPlaying,
      getLocalFile: (fileKey) => localFiles.current.get(fileKey),
      resolveMediaUrl,
      addLocalFile,
      addActivityMedia,
      ready,
      saveStatus,
      mediaVersion,
      resetProject,
    }),
    [
      state,
      selection,
      playhead,
      playing,
      resolveMediaUrl,
      addLocalFile,
      addActivityMedia,
      ready,
      saveStatus,
      mediaVersion,
      resetProject,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const value = useContext(EditorContext);
  if (!value) throw new Error("useEditor must be used inside EditorProvider");
  return value;
}

/** The selected item and its layer, or null when nothing (or a removed item) is selected. */
export function useSelectedItem() {
  const { state, selection } = useEditor();
  return useMemo(() => {
    if (!selection) return null;
    const layer = state.present.layers.find((entry) => entry.id === selection.layerId);
    const item = layer?.items.find((entry) => entry.id === selection.itemId);
    return layer && item ? { layer, item } : null;
  }, [state.present, selection]);
}
