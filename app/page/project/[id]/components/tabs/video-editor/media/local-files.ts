import type { MediaKind } from "../model/types";

const MB = 1024 * 1024;

/** Mirrors the backend upload whitelist (worker-service upload-rules.ts) so both accept the same files. */
const EXTENSIONS_BY_MIME: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg", ".jfif"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "video/mp4": [".mp4", ".m4v"],
  "video/quicktime": [".mov", ".qt"],
  "video/webm": [".webm"],
  "audio/mpeg": [".mp3", ".mpga"],
  "audio/wav": [".wav"],
  "audio/x-wav": [".wav"],
  "audio/mp4": [".m4a", ".mp4"],
  "audio/aac": [".aac"],
  "audio/ogg": [".ogg", ".oga"],
};

const MAX_BYTES: Record<MediaKind, number> = { video: 500 * MB, audio: 50 * MB, image: 20 * MB };

export const LOCAL_FILE_ACCEPT = Object.keys(EXTENSIONS_BY_MIME).join(",");

/** What a local file is, or null when its type, extension or size is not accepted. */
export function mediaKindOfFile(file: File): MediaKind | null {
  const mime = file.type.split(";")[0].trim().toLowerCase();
  const extensions = EXTENSIONS_BY_MIME[mime];
  if (!extensions) return null;

  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (extension && !extensions.includes(extension)) return null;

  const kind: MediaKind = mime.startsWith("video/") ? "video" : mime.startsWith("image/") ? "image" : "audio";
  return file.size > 0 && file.size <= MAX_BYTES[kind] ? kind : null;
}
