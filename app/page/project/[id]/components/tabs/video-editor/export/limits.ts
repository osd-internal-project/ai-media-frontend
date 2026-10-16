import type { AspectRatio } from "../model/types";

export type Resolution = "720p" | "1080p";

/**
 * Conservative defaults until measured on real devices (plan Phase 4):
 * phones run out of memory first, so they get shorter edits and 720p only.
 */
export const EXPORT_LIMITS: Record<"mobile" | "desktop", { maxSeconds: number; resolutions: Resolution[] }> = {
  mobile: { maxSeconds: 3 * 60, resolutions: ["720p"] },
  desktop: { maxSeconds: 10 * 60, resolutions: ["720p", "1080p"] },
};

/** Rough size for the summary row; MediaBunny's QUALITY_MEDIUM lands near these bitrates. */
const VIDEO_BITS_PER_SECOND: Record<Resolution, number> = { "720p": 2_500_000, "1080p": 5_000_000 };
const AUDIO_BITS_PER_SECOND = 128_000;

export function estimateMegabytes(seconds: number, resolution: Resolution): number {
  return Math.max(1, Math.round(((VIDEO_BITS_PER_SECOND[resolution] + AUDIO_BITS_PER_SECOND) * seconds) / 8 / 1024 / 1024));
}

/** Output pixel size; dimensions stay even as H.264 requires. */
export function outputSize(aspect: AspectRatio, resolution: Resolution): { width: number; height: number } {
  const short = resolution === "1080p" ? 1080 : 720;
  const long = Math.round((short * 16) / 9 / 2) * 2;
  if (aspect === "9:16") return { width: short, height: long };
  if (aspect === "16:9") return { width: long, height: short };
  return { width: short, height: short };
}
