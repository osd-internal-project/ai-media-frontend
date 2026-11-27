"use client";

import { Tag, Tooltip, theme } from "antd";
import type { FC, ReactNode } from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { seatLevel, type SeatLevel } from "./seat";

export { seatLevel };

export type StatusTone = "success" | "warning" | "error" | "primary" | "accent" | "neutral";

/** cyan ของ brand — ไม่มี token ของ antd ตรง ๆ (colorInfo ของ dark ถูกปรับเข้ม) */
const BRAND_CYAN = "#0FEAB6";

/**
 * สี tag ของหน้า admin — ทุกคู่วัดแล้ว ≥4.5:1 ทั้ง dark / light (2026-11-26)
 * dark ต้องต่างจาก light: colorPrimaryText บน colorPrimaryBg ของ dark ได้แค่ 1.39:1
 */
const useToneColors = (tone: StatusTone) => {
  const { token } = theme.useToken();
  const isDark = useThemeMode().mode === "dark";
  switch (tone) {
    case "success":
      return { color: token.colorSuccessText, background: token.colorSuccessBg, border: token.colorSuccessBorder };
    case "warning":
      return { color: token.colorWarningText, background: token.colorWarningBg, border: token.colorWarningBorder };
    case "error":
      return {
        color: isDark ? token.colorErrorTextHover : token.colorErrorText,
        background: token.colorErrorBg,
        border: token.colorErrorBorder,
      };
    case "primary":
      // indigo ทึบ + ตัวขาว: dark 5.48:1, light 4.63:1
      return { color: "#FFFFFF", background: token.colorPrimary, border: token.colorPrimary };
    case "accent":
      return isDark
        ? { color: BRAND_CYAN, background: "rgba(15, 234, 182, 0.14)", border: "rgba(15, 234, 182, 0.4)" }
        : { color: token.colorInfoText, background: "rgba(15, 234, 182, 0.12)", border: "rgba(8, 112, 92, 0.35)" };
    default:
      return {
        color: isDark ? token.colorText : token.colorTextSecondary,
        background: token.colorFillTertiary,
        border: token.colorBorderSecondary,
      };
  }
};

export const StatusTag: FC<{ tone: StatusTone; children: ReactNode }> = ({ tone, children }) => {
  const { color, background, border } = useToneColors(tone);
  return (
    <Tag bordered className="!m-0 rounded-full px-2.5" style={{ color, background, borderColor: border }}>
      {children}
    </Tag>
  );
};

/** org ที่ค่า Access / model ต่างจาก plan ปัจจุบัน — เส้นขอบ indigo ไม่ทึบ */
export const CustomizedBadge: FC = () => {
  const { token } = theme.useToken();
  // colorPrimaryText ของ dark บนพื้น card ได้ 2.79:1 → ใช้ TextHover (4.88:1)
  const color = useThemeMode().mode === "dark" ? token.colorPrimaryTextHover : token.colorPrimaryText;
  return (
    <Tooltip title="Access หรือ model ของ org นี้ต่างจาก plan ปัจจุบัน">
      <Tag
        bordered
        className="!m-0 rounded-full px-2"
        style={{ color, background: "transparent", borderColor: token.colorPrimary }}
      >
        กำหนดเอง
      </Tag>
    </Tooltip>
  );
};

const LEVEL_TONE: Record<SeatLevel, StatusTone> = {
  ok: "success",
  near: "warning",
  full: "error",
  unlimited: "neutral",
};

/** สมาชิก active + คำเชิญค้าง เทียบกับ limit — ส่วนคำเชิญแสดงจางกว่า */
export const SeatBar: FC<{ active: number; pending: number; max: number | null | undefined }> = ({
  active,
  pending,
  max,
}) => {
  const { token } = theme.useToken();
  const level = seatLevel(active + pending, max);
  const { color } = useToneColors(LEVEL_TONE[level]);
  const limit = level === "unlimited" ? 0 : max ?? 0;
  const activePct = limit > 0 ? Math.min(100, (active / limit) * 100) : 100;
  const pendingPct = limit > 0 ? Math.min(100 - activePct, (pending / limit) * 100) : 0;
  const invited = pending ? ` + ${pending} invited` : "";
  const summary =
    level === "unlimited"
      ? `${active} members${invited}, no seat limit`
      : `${active} members${invited} of ${max} seats`;

  return (
    <div className="flex min-w-[140px] flex-col gap-1" aria-label={summary} role="img">
      <div className="tabular-nums text-xs" style={{ color: token.colorTextBase }}>
        {active}
        {pending > 0 && <span style={{ color: token.colorTextSecondary }}> + {pending} เชิญ</span>}
        <span style={{ color: token.colorTextSecondary }}> / {level === "unlimited" ? "ไม่จำกัด" : max}</span>
      </div>
      {level !== "unlimited" && (
        <div className="flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: token.colorFillSecondary }}>
          <div style={{ width: `${activePct}%`, background: color }} />
          <div style={{ width: `${pendingPct}%`, background: color, opacity: 0.4 }} />
        </div>
      )}
    </div>
  );
};
