"use client";

import React, { useEffect, useRef, useState } from "react";
import { Progress, Typography, theme } from "antd";
import useResponsive from "@/app/hooks/useResponsive";

export type GenerationStage = "queued" | "preparing" | "generating" | "saving";

/** ความสูงแถวผลลัพธ์ — คงที่ทุกขนาดจอ/zoom, กว้างตามสัดส่วนของสื่อ */
export const useTileHeight = () => {
  const { isMobile, isTablet } = useResponsive();
  return isMobile ? 160 : isTablet ? 200 : 240;
};

export const mediaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
};

/** กล่อง tile สูงคงที่ กว้างจาก aspect-ratio (ไม่ล้นจอแคบ) */
export const tileStyle = (
  height: number,
  ratio: number,
): React.CSSProperties => ({
  position: "relative",
  flex: "0 0 auto",
  height,
  aspectRatio: String(ratio),
  maxWidth: "100%",
  overflow: "hidden",
  borderRadius: 8,
});

/** "16:9" → 1.78; ค่าอื่น (adaptive, ว่าง) → undefined */
export const parseRatio = (ratio?: string): number | undefined => {
  const [w, h] = (ratio ?? "").split(":").map(Number);
  return w > 0 && h > 0 ? w / h : undefined;
};

const STAGE_LABEL: Record<GenerationStage, string> = {
  queued: "In queue",
  preparing: "Preparing reference images",
  generating: "Generating",
  saving: "Saving results",
};

const deriveStage = (status: string, stage?: GenerationStage) =>
  stage ?? (status === "PROCESSING" ? "generating" : "queued");

const formatElapsed = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

interface Props {
  status: string;
  stage?: GenerationStage;
  current?: number;
  total?: number;
  percentage?: number;
  createdAt?: string;
  /** placeholder ตามจำนวน/สัดส่วนผลลัพธ์ที่รอ — ไม่ส่ง = แบบ compact (audio) */
  tiles?: { count: number; ratio: number };
}

const GenerationProgress: React.FC<Props> = ({
  status,
  stage,
  current,
  total,
  percentage,
  createdAt,
  tiles,
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  const tileHeight = useTileHeight();
  const active = deriveStage(status, stage);
  // ขั้น preparing มีเฉพาะงานที่มีรูปอ้างอิง (seedance2) — จำไว้หลังผ่านไปแล้ว
  const sawPreparing = useRef(false);
  if (active === "preparing") sawPreparing.current = true;
  const steps: GenerationStage[] = sawPreparing.current
    ? ["queued", "preparing", "generating", "saving"]
    : ["queued", "generating", "saving"];
  const activeIndex = steps.indexOf(active);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const startedAt = createdAt ? new Date(createdAt).getTime() : NaN;
  const elapsed = Number.isNaN(startedAt)
    ? null
    : Math.max(0, Math.floor((now - startedAt) / 1000));

  const counter = current !== undefined && total ? ` ${current}/${total}` : "";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        marginTop: 8,
        padding: isMobile ? 10 : 12,
        borderRadius: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgElevated,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Typography.Text strong style={{ fontSize: isMobile ? 13 : 14 }}>
          {STAGE_LABEL[active]}
          {counter}
        </Typography.Text>
        <Typography.Text
          type="secondary"
          style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}
        >
          {isMobile ? `${activeIndex + 1}/${steps.length}` : null}
          {isMobile && elapsed !== null ? " · " : null}
          {elapsed !== null ? formatElapsed(elapsed) : null}
        </Typography.Text>
      </div>

      {!isMobile && (
        <ol
          style={{
            display: "flex",
            gap: 16,
            listStyle: "none",
            padding: 0,
            margin: "8px 0 0",
          }}
        >
          {steps.map((s, i) => (
            <li
              key={s}
              aria-current={i === activeIndex ? "step" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color:
                  i === activeIndex
                    ? token.colorPrimary
                    : i < activeIndex
                      ? token.colorText
                      : token.colorTextQuaternary,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "currentColor",
                }}
              />
              {STAGE_LABEL[s]}
            </li>
          ))}
        </ol>
      )}

      {percentage !== undefined ? (
        <Progress
          percent={percentage}
          size="small"
          status="active"
          showInfo={false}
          strokeColor={token.colorPrimary}
          style={{ margin: "8px 0 0" }}
        />
      ) : (
        // ไม่มีตัวเลขจริง — แถบวิ่งแทนการแต่งเปอร์เซ็นต์
        <div
          className="skeleton-shimmer"
          style={{ height: 6, borderRadius: 3, marginTop: 10 }}
        />
      )}

      {tiles && tiles.count > 0 && (
        <div style={mediaRowStyle}>
          {Array.from({ length: tiles.count }, (_, i) => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={tileStyle(tileHeight, tiles.ratio)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;
