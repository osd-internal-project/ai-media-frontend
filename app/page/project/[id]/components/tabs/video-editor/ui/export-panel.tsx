"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Input, Progress, Segmented } from "antd";
import { CircleAlert, Download, LibraryBig } from "lucide-react";
import { useSession } from "next-auth/react";
import useResponsive from "@/app/hooks/useResponsive";
import { axiosWorker } from "@/app/lib/axios/axios";
import UploadsServices from "@/app/services/uploads.service";
import { useEditor } from "../editor-context";
import { useEditorColors } from "../editor-theme";
import { ExportError, exportVideo, type Resolution } from "../export/export-video";
import { EXPORT_LIMITS, estimateMegabytes } from "../export/limits";
import { projectDuration } from "../model/timeline";
import type { AspectRatio, MediaSourceRef } from "../model/types";
import { STRINGS } from "../strings";
import { formatTime } from "./item-actions";

type Phase = "idle" | "exporting" | "done" | "error";
type LibrarySave = "idle" | "saving" | "saved" | "error";

const ASPECTS: AspectRatio[] = ["9:16", "16:9", "1:1"];

function errorMessage(error: unknown): string {
  if (error instanceof ExportError) {
    if (error.reason === "video-codec") return STRINGS.exportNoCodec;
    if (error.reason === "source-missing") return STRINGS.exportSourceMissing;
    return STRINGS.emptyTimeline;
  }
  return STRINGS.exportFailed;
}

/** Export settings, progress and result. `onBusyChange` lets the container block closing mid-export. */
export default function ExportPanel({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) {
  const { state, dispatch, getLocalFile, resolveMediaUrl, setPlaying } = useEditor();
  const { isDesktop } = useResponsive();
  const colors = useEditorColors();
  const limits = isDesktop ? EXPORT_LIMITS.desktop : EXPORT_LIMITS.mobile;
  const project = state.present;
  const duration = projectDuration(project);
  const [resolution, setResolution] = useState<Resolution>("720p");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; blob: Blob; sizeMb: number } | null>(null);
  const [librarySave, setLibrarySave] = useState<LibrarySave>("idle");
  const [librarySaveError, setLibrarySaveError] = useState<string | null>(null);
  const { data: session } = useSession();
  const abortRef = useRef<AbortController | null>(null);

  const hasLibraryClips = project.layers.some((layer) => layer.items.some((item) => item.source.type === "gallery"));
  const tooLong = duration > limits.maxSeconds;

  useEffect(() => {
    onBusyChange(phase === "exporting");
  }, [phase, onBusyChange]);

  const [name, setName] = useState(project.name);
  const commitName = () => {
    const next = name.trim() || "Untitled";
    setName(next);
    dispatch({ type: "rename", name: next });
  };

  // A new edit invalidates the finished file; renaming does not.
  useEffect(() => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
    setPhase((previous) => (previous === "done" ? "idle" : previous));
    setLibrarySave("idle");
  }, [project.layers, project.aspect]);

  const resultUrlRef = useRef<string | null>(null);
  resultUrlRef.current = result?.url ?? null;
  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    },
    [],
  );

  const resolveForExport = (source: MediaSourceRef) =>
    source.type === "local" ? getLocalFile(source.fileKey) : resolveMediaUrl(source);

  const start = async () => {
    setPlaying(false);
    setError(null);
    setProgress(0);
    setPhase("exporting");
    const controller = new AbortController();
    abortRef.current = controller;
    let wakeLock: WakeLockSentinel | null = null;
    try {
      wakeLock = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch (wakeError) {
      // Not fatal: the export still runs, the screen may just dim.
      console.warn("[video-editor] wake lock unavailable", wakeError);
    }
    try {
      const blob = await exportVideo(project, resolveForExport, {
        resolution,
        signal: controller.signal,
        onProgress: setProgress,
      });
      setResult({ url: URL.createObjectURL(blob), blob, sizeMb: Math.max(1, Math.round(blob.size / 1024 / 1024)) });
      setLibrarySave("idle");
      setPhase("done");
    } catch (exportError) {
      if (exportError instanceof DOMException && exportError.name === "AbortError") {
        setPhase("idle");
      } else {
        console.error("[video-editor] export failed", exportError);
        setError(errorMessage(exportError));
        setPhase("error");
      }
    } finally {
      abortRef.current = null;
      await wakeLock
        ?.release()
        .catch((releaseError: unknown) => console.warn("[video-editor] wake lock release failed", releaseError));
    }
  };

  // Characters that are invalid in file names on Windows/macOS.
  const fileName = `${(name.trim() || "video").replace(/[\\/:*?"<>|]+/g, "-")}.mp4`;

  /** Uploads the finished MP4 into this project's Library (worker kind `editor-export`). */
  const saveToLibrary = async () => {
    const organizationId = session?.user?.organizationId;
    if (!result || !organizationId) return;
    setLibrarySave("saving");
    setLibrarySaveError(null);
    const formData = new FormData();
    formData.append("file", new File([result.blob], fileName, { type: "video/mp4" }));
    formData.append("uid", crypto.randomUUID());
    formData.append("userId", session?.user?.userId ?? "");
    formData.append("organizationId", organizationId);
    formData.append("projectId", project.projectId);
    formData.append("generateType", "video");
    formData.append("index", "0");
    try {
      await UploadsServices(axiosWorker).saveEditorExport(formData);
      setLibrarySave("saved");
    } catch (saveError) {
      console.error("[video-editor] save to library failed", saveError);
      setLibrarySaveError(saveError instanceof Error ? saveError.message : STRINGS.librarySaveFailed);
      setLibrarySave("error");
    }
  };
  const exporting = phase === "exporting";

  return (
    <div className="flex flex-col gap-5" style={{ color: colors.text }}>
      <label className="flex flex-col gap-2">
        <span className="text-sm" style={{ color: colors.textSecondary }}>{STRINGS.videoName}</span>
        <Input
          size="large"
          value={name}
          maxLength={100}
          disabled={exporting}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
          onPressEnter={commitName}
          suffix=".mp4"
        />
      </label>
      <section className="flex flex-col gap-2">
        <span className="text-sm" style={{ color: colors.textSecondary }}>{STRINGS.resolution}</span>
        <Segmented<Resolution>
          block
          disabled={exporting}
          value={resolution}
          onChange={setResolution}
          options={(["720p", "1080p"] as Resolution[]).map((value) => ({
            value,
            label: value,
            disabled: !limits.resolutions.includes(value),
          }))}
        />
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-sm" style={{ color: colors.textSecondary }}>{STRINGS.aspectRatio}</span>
        <Segmented<AspectRatio>
          block
          disabled={exporting}
          value={project.aspect}
          onChange={(aspect) => dispatch({ type: "set-aspect", aspect })}
          options={ASPECTS}
        />
      </section>
      <section
        className="grid grid-cols-3 gap-2 py-3 text-sm"
        style={{ borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}
      >
        <div>
          <div style={{ color: colors.textSecondary }}>{STRINGS.length}</div>
          <div className="text-base font-semibold tabular-nums">{formatTime(duration)}</div>
        </div>
        <div>
          <div style={{ color: colors.textSecondary }}>{STRINGS.fileSize}</div>
          <div className="text-base font-semibold">~ {result?.sizeMb ?? estimateMegabytes(duration, resolution)} MB</div>
        </div>
        <div>
          <div style={{ color: colors.textSecondary }}>{STRINGS.format}</div>
          <div className="text-base font-semibold">MP4</div>
        </div>
      </section>

      {tooLong && <Alert type="warning" showIcon message={STRINGS.exportTooLong(formatTime(limits.maxSeconds))} />}
      {hasLibraryClips && <Alert type="warning" showIcon message={STRINGS.exportLibraryWarning} />}
      {error && <Alert type="error" showIcon message={error} />}
      {librarySave === "saved" && <Alert type="success" showIcon message={STRINGS.librarySaved} />}
      {librarySave === "error" && (
        <Alert type="error" showIcon message={librarySaveError ?? STRINGS.librarySaveFailed} />
      )}

      {exporting && (
        <section className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>{STRINGS.exporting}</span>
            <span className="font-semibold tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
          <Progress percent={Math.round(progress * 100)} showInfo={false} strokeColor={colors.primary} />
          <p className="m-0 flex gap-2 text-sm" style={{ color: colors.textSecondary }}>
            <CircleAlert size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            {STRINGS.exportKeepOpen}
          </p>
        </section>
      )}

      {exporting ? (
        <Button size="large" block onClick={() => abortRef.current?.abort()}>
          {STRINGS.cancelExport}
        </Button>
      ) : result ? (
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            size="large"
            block
            href={result.url}
            download={fileName}
            icon={<Download size={16} aria-hidden="true" />}
          >
            {STRINGS.download}
          </Button>
          <Button
            size="large"
            block
            loading={librarySave === "saving"}
            disabled={librarySave === "saved"}
            onClick={() => void saveToLibrary()}
            icon={<LibraryBig size={16} aria-hidden="true" />}
          >
            {librarySave === "saved" ? STRINGS.librarySaved : STRINGS.saveToLibrary}
          </Button>
        </div>
      ) : (
        <Button type="primary" size="large" block disabled={duration === 0 || tooLong} onClick={() => void start()}>
          {STRINGS.startExport}
        </Button>
      )}
    </div>
  );
}
