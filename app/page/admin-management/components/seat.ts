export type SeatLevel = "ok" | "near" | "full" | "unlimited";

/** null = ไม่จำกัด; 0 = เต็ม (ผู้ใช้เลือก 2026-11-26); ใกล้เต็มตั้งแต่ 80% — นับสมาชิก active + คำเชิญค้าง */
export function seatLevel(used: number, max: number | null | undefined): SeatLevel {
  if (max === null || max === undefined) return "unlimited";
  if (used >= max) return "full";
  return used / max >= 0.8 ? "near" : "ok";
}
