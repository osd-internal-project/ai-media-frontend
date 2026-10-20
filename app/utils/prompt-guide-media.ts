export type MediaKind = "image" | "video" | "audio";

export function isAudio(url: string): boolean {
  return /\.(mp3|wav|ogg|aac|flac|m4a)(\?|$)/i.test(url);
}

export function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|qt)(\?|$)/i.test(url);
}

/** ชนิดไฟล์จาก MIME (ไฟล์ที่เพิ่งเลือก) หรือนามสกุลใน url/name (ไฟล์ที่โหลดจาก server) */
export function mediaKindOf(file: {
  type?: string;
  url?: string;
  name?: string;
}): MediaKind {
  if (file.type?.startsWith("video/")) return "video";
  if (file.type?.startsWith("audio/")) return "audio";
  if (file.type) return "image";
  const source = file.url || file.name || "";
  if (isVideo(source)) return "video";
  if (isAudio(source)) return "audio";
  return "image";
}

/**
 * ชื่อ mention ตามลำดับ เช่น ["image1", "video1", "image2"] — นับแยกตามชนิด
 * ให้ตรงกับชื่อที่ video tab ตั้งให้ไฟล์ reference ตอนกด Use Template
 */
export function mentionLabels(
  files: { type?: string; url?: string; name?: string }[],
): string[] {
  const counts: Record<MediaKind, number> = { image: 0, video: 0, audio: 0 };
  return files.map((file) => {
    const kind = mediaKindOf(file);
    counts[kind] += 1;
    return `${kind}${counts[kind]}`;
  });
}
