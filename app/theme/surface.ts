import { getCanvasBg } from "./themeConfig";

/** The one shadow for floating panels (dropdown, popover, modal); cards use a border instead. */
export const overlayShadow = (mode: "light" | "dark"): string =>
  `0 8px 24px rgba(0, 0, 0, ${mode === "dark" ? 0.16 : 0.08})`;

/** Workspace canvas: dark sits one step below the panel (#141619 vs #21262B) so layers read apart; light keeps the theme canvas. */
export const canvasBg = (mode: "light" | "dark"): string => (mode === "dark" ? "#141619" : getCanvasBg(mode));

/** Floating panel elevation for the workspace (one elevation: shadow, no border). */
export const panelShadow = (mode: "light" | "dark"): string =>
  mode === "dark"
    ? "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.55)"
    : "0 1px 2px rgba(30,27,58,0.06), 0 8px 24px -12px rgba(30,27,58,0.18)";

/** Workspace form panel: cool grey one clear step above the canvas, with an indigo edge (no halo). */
export const formPanel = (mode: "light" | "dark") =>
  mode === "dark"
    ? { bg: "#282C38", border: "rgba(111, 106, 222, 0.45)", field: "#323748", shadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 40px -14px rgba(0,0,0,0.65)" }
    : { bg: "#FFFFFF", border: "#E6E3F5", field: "#F3F1FD", shadow: panelShadow("light") };
