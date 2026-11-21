/** Output width × height per resolution and ratio, sent for the credit estimate. */
export const RATIO_SIZE_MAP: Record<
  string,
  Record<string, { width: number; height: number }>
> = {
  "480p": {
    "1:1": { width: 640, height: 640 },
    "4:3": { width: 752, height: 564 },
    "3:4": { width: 564, height: 752 },
    "16:9": { width: 864, height: 496 },
    "9:16": { width: 496, height: 864 },
    "21:9": { width: 992, height: 432 },
    "9:21": { width: 432, height: 992 },
  },
  "720p": {
    "1:1": { width: 960, height: 960 },
    "4:3": { width: 1112, height: 834 },
    "3:4": { width: 834, height: 1112 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
    "21:9": { width: 1470, height: 630 },
    "9:21": { width: 630, height: 1470 },
  },
  "1080p": {
    "1:1": { width: 1440, height: 1440 },
    "4:3": { width: 1664, height: 1248 },
    "3:4": { width: 1248, height: 1664 },
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "21:9": { width: 2205, height: 945 },
    "9:21": { width: 945, height: 2205 },
  },
};

/**
 * Size of a final rendered from a draft.
 * shortcut: 4k = 1080p × 2 and an unknown ratio (adaptive) scales the draft's own size;
 * only the credit hold reads it — the charge uses real tokens. Use provider sizes once the form offers 4k.
 */
export const finalSize = (
  resolution: "1080p" | "4k",
  ratio: string,
  draft: { width: number; height: number },
): { width: number; height: number } => {
  const base =
    RATIO_SIZE_MAP["1080p"][ratio] ??
    {
      width: Math.round((draft.width * 1080) / Math.min(draft.width, draft.height)),
      height: Math.round((draft.height * 1080) / Math.min(draft.width, draft.height)),
    };
  const scale = resolution === "4k" ? 2 : 1;
  return { width: base.width * scale, height: base.height * scale };
};
