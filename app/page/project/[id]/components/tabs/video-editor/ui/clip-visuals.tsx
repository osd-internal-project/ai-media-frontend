"use client";

import { memo, useEffect, useState } from "react";
import { useEditor } from "../editor-context";
import type { TimelineItem } from "../model/types";
import { loadFilmstrip, type FilmstripFrame } from "../media/thumbnails";
import { PEAKS_PER_SECOND, loadPeaks } from "../media/waveform";

export const TILE_WIDTH = 40;
const BAR_WIDTH = 3;
const BAR_STEP = 5;

/** Local files only: videos from All Activity can't be decoded until the bucket allows Range. */
function useLocalFile(item: TimelineItem) {
  const { getLocalFile } = useEditor();
  return item.source.type === "local"
    ? { key: item.source.fileKey, file: getLocalFile(item.source.fileKey) }
    : null;
}

function useFilmstrip(item: TimelineItem): FilmstripFrame[] {
  const local = useLocalFile(item);
  const [frames, setFrames] = useState<FilmstripFrame[]>([]);
  const key = local?.key;
  const file = local?.file;
  const isVideo = item.media === "video";

  useEffect(() => {
    if (!key || !file || !isVideo) return;
    let cancelled = false;
    void loadFilmstrip(key, file, item.sourceDuration).then((result) => {
      if (!cancelled) setFrames(result);
    });
    return () => {
      cancelled = true;
    };
  }, [key, file, isVideo, item.sourceDuration]);

  return frames;
}

/** Thumbnail tiles separated by thin lines, like the mockup; images repeat themselves. */
export const Filmstrip = memo(function Filmstrip({
  item,
  pxPerSecond,
  width,
  separator,
}: {
  item: TimelineItem;
  pxPerSecond: number;
  /** Rendered clip width; tiles beyond it are clipped by the wrapper. */
  width: number;
  separator: string;
}) {
  const { resolveMediaUrl } = useEditor();
  const frames = useFilmstrip(item);
  const imageUrl = item.media === "image" ? resolveMediaUrl(item.source) : undefined;
  if (frames.length === 0 && !imageUrl) return null;

  const tiles = Math.max(1, Math.ceil(width / (TILE_WIDTH + 1)));
  // A plain div clips reliably; <button> does not clip absolutely positioned children everywhere.
  return (
    <div
      className="absolute inset-0 overflow-hidden flex gap-px pointer-events-none"
      style={{ background: separator, borderRadius: 6 }}
      aria-hidden="true"
    >
      {Array.from({ length: tiles }, (_, index) => {
        let src = imageUrl;
        if (!src) {
          const time = item.inPoint + ((index + 0.5) * TILE_WIDTH) / pxPerSecond;
          src = frames.reduce((best, candidate) =>
            Math.abs(candidate.time - time) < Math.abs(best.time - time) ? candidate : best,
          ).url;
        }
        return (
          // eslint-disable-next-line @next/next/no-img-element -- object URLs of local files and generated frames
          <img key={index} src={src} alt="" draggable={false} className="h-full object-cover shrink-0" style={{ width: TILE_WIDTH }} />
        );
      })}
    </div>
  );
});

export const Waveform = memo(function Waveform({
  item,
  pxPerSecond,
  width,
  color,
  height,
}: {
  item: TimelineItem;
  pxPerSecond: number;
  width: number;
  color: string;
  height: number;
}) {
  const local = useLocalFile(item);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  const key = local?.key;
  const file = local?.file;

  useEffect(() => {
    if (!key || !file) return;
    let cancelled = false;
    void loadPeaks(key, file, item.sourceDuration).then((result) => {
      if (!cancelled) setPeaks(result);
    });
    return () => {
      cancelled = true;
    };
  }, [key, file, item.sourceDuration]);

  if (!peaks || peaks.length === 0) return null;
  const bars = Math.max(0, Math.floor((width - 8) / BAR_STEP));
  const maxBar = height - 12;
  return (
    <svg className="absolute inset-0 overflow-hidden pointer-events-none" width={width} height={height} aria-hidden="true">
      {Array.from({ length: bars }, (_, index) => {
        const time = item.inPoint + (index * BAR_STEP + 4) / pxPerSecond;
        const peak = peaks[Math.floor(time * PEAKS_PER_SECOND)] ?? 0;
        const barHeight = Math.max(4, Math.min(1, peak * 1.4) * maxBar);
        return (
          <rect
            key={index}
            x={index * BAR_STEP + 4}
            y={(height - barHeight) / 2}
            width={BAR_WIDTH}
            height={barHeight}
            rx={1.5}
            fill={color}
          />
        );
      })}
    </svg>
  );
});
