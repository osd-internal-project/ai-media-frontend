/**
 * Infer a coarse media kind from a file path/URL extension.
 * Mirrors the inline helper used in chat-generate-video so the workflow can
 * build the same `{ type, url }` file refs for multi-file video models.
 *
 * @param path File path or URL ending in an extension.
 * @returns "image" | "audio" | "video" | "unknown".
 */
export const getTypeFile = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext && ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext && ["mp3", "wav", "aac", "ogg"].includes(ext)) return "audio";
  if (ext && ["mp4", "mov", "avi", "mkv"].includes(ext)) return "video";
  return "unknown";
};

const VIDEO_METADATA_TIMEOUT_MS = 5000;

/**
 * Read a video's length in seconds from its metadata; `undefined` if it cannot be read in time.
 * Seedance bills reference-video seconds too, so the credit estimate needs this.
 */
export const getVideoDuration = (url: string): Promise<number | undefined> =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    const done = (value: number | undefined) => {
      clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      resolve(value);
    };
    const timer = setTimeout(() => done(undefined), VIDEO_METADATA_TIMEOUT_MS);
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      done(Number.isFinite(video.duration) ? video.duration : undefined);
    video.onerror = () => done(undefined);
    video.src = url;
  });
