import type { GlobalToken } from "antd";
import { aiCaveColors } from "@/app/theme/themeConfig";

/**
 * Single source of truth for generation-type keys, labels and colours on the client.
 *
 * Mirrors `libs/share/src/constants/generation-type.ts` in the backend. The API only ever
 * emits these canonical keys — the misspelled `omnihumen` literal stored in the database is
 * normalised server-side and must never reach the UI.
 */
export const GENERATION_TYPE_KEYS = [
  "image",
  "video",
  "omnihuman",
  "dreamactor",
] as const;

export type GenerationTypeKey = (typeof GENERATION_TYPE_KEYS)[number];

export const GENERATION_TYPE_LABEL: Readonly<
  Record<GenerationTypeKey, string>
> = {
  image: "Image",
  video: "Video",
  omnihuman: "OmniHuman",
  dreamactor: "DreamActor",
};

/** Options for antd Select / Segmented controls, in display order. */
export const GENERATION_TYPE_OPTIONS: ReadonlyArray<{
  value: GenerationTypeKey;
  label: string;
}> = GENERATION_TYPE_KEYS.map((key) => ({
  value: key,
  label: GENERATION_TYPE_LABEL[key],
}));

/**
 * Colour per generation type, resolved from the active theme.
 *
 * Charts and their legends must both call this so a series line can never disagree with its
 * legend swatch.
 *
 * @param token The antd theme token from `theme.useToken()`.
 * @returns A colour for every generation type key.
 */
export const generationTypeColors = (
  token: GlobalToken,
): Record<GenerationTypeKey, string> => ({
  image: token.colorPrimary,
  video: token.colorInfo,
  omnihuman: token.colorWarning,
  dreamactor: aiCaveColors.dreamActor,
});

/**
 * Narrows an unknown string to a generation type key.
 *
 * @param value Candidate value, typically straight from an API response or URL param.
 * @returns True when the value is one of the canonical keys.
 */
export const isGenerationTypeKey = (
  value: unknown,
): value is GenerationTypeKey =>
  typeof value === "string" &&
  (GENERATION_TYPE_KEYS as readonly string[]).includes(value);

/**
 * Human-readable label for a possibly-unknown type value.
 *
 * @param value Raw type value from an API response.
 * @returns The display label, or "Unknown" for legacy/unrecognised values.
 */
export const generationTypeLabel = (value: unknown): string =>
  isGenerationTypeKey(value) ? GENERATION_TYPE_LABEL[value] : "Unknown";
