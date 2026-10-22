import type { IPrintBox, IPrintLayout } from "@/app/common/photo-event.type";

/** การ์ด 4×6 นิ้ว จัดแบบเดียวกับใบพิมพ์เดิม — ใช้เมื่อ event ยังไม่มี template ที่ active */
export const DEFAULT_PRINT_LAYOUT: IPrintLayout = {
  version: 1,
  paper: { widthMm: 102, heightMm: 152, bleedMm: 0, marginMm: 5 },
  background: { color: "#ffffff", fit: "cover" },
  elements: [
    { id: "photo", type: "photo", xMm: 5, yMm: 5, wMm: 92, hMm: 112, fit: "cover", focusX: 50, focusY: 50 },
    { id: "qr", type: "qr", xMm: 5, yMm: 121, wMm: 26, hMm: 26, color: "#000000", bgColor: "#ffffff" },
    {
      id: "qr-title",
      type: "text",
      xMm: 35,
      yMm: 126,
      wMm: 62,
      hMm: 8,
      content: "สแกนเพื่อดาวน์โหลดภาพ",
      fontSizePt: 12,
      color: "#191c20",
      weight: 500,
      align: "left",
    },
    {
      id: "qr-subtitle",
      type: "text",
      xMm: 35,
      yMm: 135,
      wMm: 62,
      hMm: 6,
      content: "Scan to download your photo",
      fontSizePt: 8,
      color: "#5b6573",
      weight: 400,
      align: "left",
    },
  ],
};

export interface IPaperPreset {
  key: string;
  label: string;
  widthMm: number;
  heightMm: number;
}

/** ขนาดแนวตั้ง — แนวนอนได้จากการสลับกว้าง/สูง */
export const PAPER_PRESETS: IPaperPreset[] = [
  { key: "4x6", label: "4×6 in (102×152 mm)", widthMm: 102, heightMm: 152 },
  { key: "5x7", label: "5×7 in (127×178 mm)", widthMm: 127, heightMm: 178 },
  { key: "a6", label: "A6 (105×148 mm)", widthMm: 105, heightMm: 148 },
  { key: "a5", label: "A5 (148×210 mm)", widthMm: 148, heightMm: 210 },
  { key: "a4", label: "A4 (210×297 mm)", widthMm: 210, heightMm: 297 },
];

/** key ของ preset ที่ตรงกับกระดาษ (ทั้งสองแนว) หรือ "custom" */
export const findPaperPresetKey = (widthMm: number, heightMm: number): string => {
  const short = Math.min(widthMm, heightMm);
  const long = Math.max(widthMm, heightMm);
  return PAPER_PRESETS.find((p) => p.widthMm === short && p.heightMm === long)?.key ?? "custom";
};

export const PRINT_PAPER_LIMIT_MM = { min: 20, max: 500 } as const;
export const PRINT_MIN_ELEMENT_MM = 2;

export const newPrintElementId = (): string => crypto.randomUUID().slice(0, 8);

/** element หลุดพื้นที่ปลอดภัย (ขอบกระดาษลบ margin) — เสี่ยงโดนตัดตอนพิมพ์ */
export const isOutsideSafeZone = (box: IPrintBox, layout: IPrintLayout): boolean => {
  const { widthMm, heightMm, marginMm } = layout.paper;
  return (
    box.xMm < marginMm ||
    box.yMm < marginMm ||
    box.xMm + box.wMm > widthMm - marginMm ||
    box.yMm + box.hMm > heightMm - marginMm
  );
};
