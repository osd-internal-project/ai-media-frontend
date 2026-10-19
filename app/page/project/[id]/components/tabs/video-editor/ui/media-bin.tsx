"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Empty, Segmented, Spin, message } from "antd";
import { AudioLines, Film, ImageIcon, Music, Plus, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEditor } from "../editor-context";
import { useEditorColors } from "../editor-theme";
import { fetchActivityMedia, type ActivityMedia } from "../media/library";
import { LOCAL_FILE_ACCEPT } from "../media/local-files";
import { STRINGS } from "../strings";

const PAGE_SIZE = 24;

type BinTab = "activity" | "device";
type MediaFilter = "all" | ActivityMedia["media"];

const FILTERS: { label: string; value: MediaFilter }[] = [
  { label: STRINGS.filterAll, value: "all" },
  { label: STRINGS.filterVideo, value: "video" },
  { label: STRINGS.filterImage, value: "image" },
  { label: STRINGS.filterAudio, value: "audio" },
];

const BADGE_ICON = { video: Film, image: ImageIcon, audio: Music } as const;

/** All Activity (videos, images, audio) and device imports; `onAdded` lets the mobile drawer close itself. */
export default function MediaBin({ projectId, onAdded }: { projectId: string; onAdded?: () => void }) {
  const [tab, setTab] = useState<BinTab>("activity");
  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <Segmented<BinTab>
        block
        value={tab}
        onChange={setTab}
        options={[
          { label: STRINGS.library, value: "activity" },
          { label: STRINGS.device, value: "device" },
        ]}
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === "activity" ? (
          <ActivityList projectId={projectId} onAdded={onAdded} />
        ) : (
          <DeviceImport onAdded={onAdded} />
        )}
      </div>
    </div>
  );
}

function ActivityList({ projectId, onAdded }: { projectId: string; onAdded?: () => void }) {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const { addActivityMedia } = useEditor();
  const colors = useEditorColors();
  const [messageApi, contextHolder] = message.useMessage();
  const [items, setItems] = useState<ActivityMedia[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  // The gallery endpoint has no type filter, so this narrows the pages loaded so far.
  const [filter, setFilter] = useState<MediaFilter>("all");
  const visible = filter === "all" ? items : items.filter((entry) => entry.media === filter);

  const load = useCallback(
    async (nextPage: number) => {
      if (!organizationId) return;
      setLoading(true);
      setFailed(false);
      try {
        const result = await fetchActivityMedia(projectId, organizationId, nextPage, PAGE_SIZE);
        setItems((prev) => (nextPage === 1 ? result.items : [...prev, ...result.items]));
        setPage(nextPage);
        setHasMore(nextPage * PAGE_SIZE < result.total);
      } catch (error) {
        console.error("[video-editor] activity load failed", error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [projectId, organizationId],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  const add = async (entry: ActivityMedia) => {
    setAddingId(entry.galleryId);
    const error = await addActivityMedia(entry);
    setAddingId(null);
    if (error) messageApi.error(error);
    else onAdded?.();
  };

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-sm" style={{ color: colors.textSecondary }}>
        {STRINGS.libraryLoadFailed}
        <Button onClick={() => void load(page)}>{STRINGS.retry}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {contextHolder}
      {items.length > 0 && (
        <Segmented<MediaFilter> size="small" block value={filter} onChange={setFilter} options={FILTERS} />
      )}
      {visible.length === 0 && !loading && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={items.length === 0 ? STRINGS.noLibraryVideos : STRINGS.noFilteredMedia}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        {visible.map((entry) => {
          const BadgeIcon = BADGE_ICON[entry.media];
          return (

          <button
            key={entry.galleryId}
            type="button"
            disabled={addingId !== null}
            onClick={() => void add(entry)}
            aria-label={`${STRINGS.addToTimeline} ${entry.name}`}
            title={entry.name}
            className="relative aspect-video rounded-[10px] overflow-hidden border-0 p-0 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: colors.elevated }}
          >
            {entry.media === "video" ? (
              // Same as the Library tab: most videos have no thumbnail object, so show the first frame.
              <video
                src={`${entry.url}#t=0.1`}
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : entry.media === "audio" ? (
              <span
                className="w-full h-full flex flex-col items-center justify-center gap-1 px-2 pt-5 pb-2"
                style={{ color: colors.textSecondary }}
              >
                <AudioLines size={22} aria-hidden="true" style={{ color: colors.primary }} />
                <span className="text-[11px] leading-tight text-center line-clamp-2 pr-6">{entry.name}</span>
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- presigned URLs, no next/image domain config
              <img src={entry.url} alt="" loading="lazy" className="w-full h-full object-cover" />
            )}
            <span
              className="absolute left-1.5 top-1.5 w-5 h-5 rounded grid place-items-center"
              style={{ background: `${colors.bg}cc`, color: colors.text }}
            >
              <BadgeIcon size={12} aria-hidden="true" />
            </span>
            <span
              className="absolute right-1.5 bottom-1.5 w-7 h-7 rounded-full grid place-items-center"
              style={{ background: colors.primary, color: "#fff" }}
            >
              {addingId === entry.galleryId ? <Spin size="small" /> : <Plus size={16} aria-hidden="true" />}
            </span>
          </button>
          );
        })}
      </div>
      {loading && <Spin className="self-center" />}
      {hasMore && !loading && <Button onClick={() => void load(page + 1)}>{STRINGS.loadMore}</Button>}
    </div>
  );
}

/** Opens the device file picker; shared by the media bin and the timeline's + buttons. */
export function useDeviceImport(onAdded?: () => void) {
  const { addLocalFile } = useEditor();
  const [messageApi, contextHolder] = message.useMessage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const importFiles = async (files: File[]) => {
    setBusy(true);
    let added = 0;
    // Sequential so clips land on the timeline in the order they were picked.
    for (const file of files) {
      const error = await addLocalFile(file);
      if (error) messageApi.error(error);
      else added++;
    }
    setBusy(false);
    if (added > 0) onAdded?.();
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept={LOCAL_FILE_ACCEPT}
      className="hidden"
      onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (files.length > 0) void importFiles(files);
      }}
    />
  );

  /** `accept` narrows the picker (e.g. "audio/*" from the music row). */
  const open = (accept?: string) => {
    if (!inputRef.current) return;
    inputRef.current.accept = accept ?? LOCAL_FILE_ACCEPT;
    inputRef.current.click();
  };

  const elements = (
    <>
      {contextHolder}
      {input}
    </>
  );
  return { open, busy, elements };
}

function DeviceImport({ onAdded }: { onAdded?: () => void }) {
  const colors = useEditorColors();
  const { open, busy, elements } = useDeviceImport(onAdded);

  return (
    <div className="flex flex-col gap-3 items-stretch">
      {elements}
      <Button
        type="primary"
        size="large"
        loading={busy}
        icon={<Upload size={16} aria-hidden="true" />}
        onClick={() => open()}
      >
        {STRINGS.importFiles}
      </Button>
      <p className="m-0 text-xs text-center" style={{ color: colors.textSecondary }}>
        {STRINGS.importHint}
      </p>
    </div>
  );
}
