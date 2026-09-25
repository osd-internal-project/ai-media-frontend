export type TKioskStep = "template" | "photo" | "generating" | "result";

export const KIOSK_STEPS: readonly { key: TKioskStep; label: string }[] = [
  { key: "template", label: "Style" },
  { key: "photo", label: "Photo" },
  { key: "generating", label: "Create" },
  { key: "result", label: "Download" },
] as const;

/** ไม่มีการแตะหน้าจอนานเท่านี้ → กลับไปหน้าเลือก template */
export const KIOSK_IDLE_SECONDS = 90;
export const KIOSK_POLL_MS = 5000;
export const KIOSK_GENERATE_TIMEOUT_MS = 3 * 60 * 1000;
/** รูปที่นำเข้าภายในช่วงนี้จะมีป้าย NEW */
export const KIOSK_NEW_PHOTO_MS = 2 * 60 * 1000;
