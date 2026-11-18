import { aiCaveColors as c } from "./themeConfig";

type Mode = "light" | "dark";
type TypeColor = { mark: string; text: string; tint: string };

// One colour per generation type, from the existing brand tokens. `mark` paints icons and bars,
// `text` is the tone that passes 4.5:1 on that mode's panels, `tint` is a quiet badge fill.
const PALETTE: Record<string, { mark: string; dark: string; light: string }> = {
  image: { mark: c.secondary, dark: c.secondary, light: "#08705C" },
  video: { mark: c.primary, dark: "#A29EF2", light: c.lightPrimaryText },
  audio: { mark: c.accent, dark: c.accent, light: "#9A4A0B" },
  omnihuman: { mark: c.success, dark: c.success, light: "#15703A" },
  dreamactor: { mark: c.dreamActor, dark: "#7FA2FF", light: c.dreamActor },
};

const ALIASES: Record<string, string> = { omnihumen: "omnihuman", "dream-actor": "dreamactor" };

/** Colour roles for a generation type ("image", "video", "audio", "omnihumen", "dreamactor"). */
export function typeColor(type: string | undefined, mode: Mode): TypeColor {
  const key = (type || "image").toLowerCase();
  const p = PALETTE[ALIASES[key] ?? key] ?? PALETTE.image;
  return { mark: p.mark, text: mode === "dark" ? p.dark : p.light, tint: `${p.mark}1F` };
}
