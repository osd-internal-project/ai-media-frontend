import type { TBrandKit } from "@/app/common/brand-kit";

/** Most important first: the palette strip gives a role this much room, and the backend trims in reverse. */
export const COLOR_ROLES = [
  { value: "primary", label: "Primary", weight: 3 },
  { value: "secondary", label: "Secondary", weight: 2 },
  { value: "accent", label: "Accent", weight: 1.5 },
  { value: "neutral", label: "Neutral", weight: 1 },
  { value: "background", label: "Background", weight: 1 },
] as const;

export type ColorRole = (typeof COLOR_ROLES)[number]["value"];
export const FONT_ROLES = ["Heading", "Body", "Caption"] as const;
export type FontRole = (typeof FONT_ROLES)[number];

export interface BoardColor {
  id: string;
  name: string;
  hex: string;
  role: ColorRole;
}

export interface BoardFont {
  id: string;
  name: string;
  role: FontRole;
  weight: string;
  includeInPrompt: boolean;
}

/** A kit's colours in saved order. A role the app does not know (older rows) is shown under Accent, as the backend does. */
export const colorsOf = (kit?: TBrandKit | null): BoardColor[] =>
  (kit?.brandKitDetails ?? []).flatMap((d) => {
    const detail = d.detail;
    if (d.type !== "colors" || !detail || !("hex" in detail) || !detail.hex) {
      return [];
    }
    const role =
      COLOR_ROLES.find((r) => r.value === detail.type)?.value ?? "accent";
    return [{ id: d.id, name: d.name, hex: detail.hex, role }];
  });

/** A kit's fonts. Rows saved as heading1…heading6 read as Heading. */
export const fontsOf = (kit?: TBrandKit | null): BoardFont[] =>
  (kit?.brandKitDetails ?? []).flatMap((d) => {
    const detail = d.detail;
    if (d.type !== "typography") return [];
    const rawRole = detail && "weight" in detail ? String(detail.type) : "";
    const role: FontRole = /^heading/i.test(rawRole)
      ? "Heading"
      : /^caption/i.test(rawRole)
        ? "Caption"
        : "Body";
    return [
      {
        id: d.id,
        name: d.name,
        role,
        weight: detail && "weight" in detail ? String(detail.weight) : "400",
        includeInPrompt: d.includeInPrompt !== false,
      },
    ];
  });

export type BoardImageKind = "style_ref" | "logo";

export interface BoardImage {
  id: string;
  name: string;
  kind: BoardImageKind;
  /** stored file; absent on a logo saved before files existed (it carries a data URL instead) */
  key?: string;
  /** display URL; null when the stored file can no longer be found */
  url: string | null;
}

/** A kit's logos and style images in saved order. */
export const imagesOf = (kit?: TBrandKit | null): BoardImage[] =>
  (kit?.brandKitDetails ?? []).flatMap((d) => {
    if (d.type !== "logo" && d.type !== "style_ref") return [];
    const detail = d.detail;
    const key = detail && "key" in detail ? detail.key : undefined;
    const url = detail && "url" in detail ? (detail.url ?? null) : null;
    return [{ id: d.id, name: d.name, kind: d.type, key, url }];
  });

