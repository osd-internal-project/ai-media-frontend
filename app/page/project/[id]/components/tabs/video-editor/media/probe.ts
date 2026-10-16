import { ALL_FORMATS, BlobSource, Input, UrlSource } from "mediabunny";

export interface ProbeResult {
  duration: number;
  hasVideo: boolean;
  hasAudio: boolean;
}

/** Reads container metadata only; no frames are decoded. */
export async function probeMedia(media: File | string): Promise<ProbeResult> {
  const source = typeof media === "string" ? new UrlSource(media) : new BlobSource(media);
  const input = new Input({ source, formats: ALL_FORMATS });
  try {
    const [duration, video, audio] = await Promise.all([
      input.computeDuration(),
      input.getPrimaryVideoTrack(),
      input.getPrimaryAudioTrack(),
    ]);
    return { duration, hasVideo: video !== null, hasAudio: audio !== null };
  } finally {
    input.dispose();
  }
}

/** Decodes an image once to make sure the browser can draw it. */
export async function probeImage(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}
