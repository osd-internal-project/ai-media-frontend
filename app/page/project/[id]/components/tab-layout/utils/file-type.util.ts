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
