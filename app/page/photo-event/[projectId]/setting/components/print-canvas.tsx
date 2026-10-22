"use client";

import React, { useEffect, useRef, useState } from "react";
import type { IPrintBox, IPrintLayout, TPrintBoxElement } from "@/app/common/photo-event.type";
import { PrintCard } from "@/app/components/photo-event/print-card";
import { PRINT_MIN_ELEMENT_MM, isOutsideSafeZone } from "@/app/utils/photo-event-print";

interface PrintCanvasProps {
  layout: IPrintLayout;
  photoUrl: string;
  shareUrl: string;
  assetUrls: Record<string, string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeBox: (id: string, box: Partial<IPrintBox>) => void;
  semantic: Record<string, unknown>;
}

type THandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const HANDLES: THandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const DESK_PADDING = 32;
const SAFE_ZONE_COLOR = "rgba(59, 130, 246, 0.6)";

interface IDrag {
  id: string;
  handle: THandle | "move";
  startX: number;
  startY: number;
  start: IPrintBox;
}

const isBox = (el: IPrintLayout["elements"][number]): el is TPrintBoxElement => el.type !== "overlay";

/** ขยับ/ย่อขยายกล่องตามระยะลาก (mm) — snap 1mm และไม่ให้เล็กกว่า PRINT_MIN_ELEMENT_MM */
const applyDrag = (drag: IDrag, dxMm: number, dyMm: number): Partial<IPrintBox> => {
  const { start, handle } = drag;
  const round = (v: number) => Math.round(v);
  if (handle === "move") return { xMm: round(start.xMm + dxMm), yMm: round(start.yMm + dyMm) };

  let { xMm, yMm, wMm, hMm } = start;
  if (handle.includes("e")) wMm = start.wMm + dxMm;
  if (handle.includes("s")) hMm = start.hMm + dyMm;
  if (handle.includes("w")) {
    wMm = start.wMm - dxMm;
    xMm = start.xMm + dxMm;
  }
  if (handle.includes("n")) {
    hMm = start.hMm - dyMm;
    yMm = start.yMm + dyMm;
  }
  // ย่อจนติดขั้นต่ำแล้วต้องหยุดขอบฝั่งตรงข้ามไว้ ไม่ให้กล่องเลื่อนหนี
  if (wMm < PRINT_MIN_ELEMENT_MM) {
    if (handle.includes("w")) xMm = start.xMm + start.wMm - PRINT_MIN_ELEMENT_MM;
    wMm = PRINT_MIN_ELEMENT_MM;
  }
  if (hMm < PRINT_MIN_ELEMENT_MM) {
    if (handle.includes("n")) yMm = start.yMm + start.hMm - PRINT_MIN_ELEMENT_MM;
    hMm = PRINT_MIN_ELEMENT_MM;
  }
  return { xMm: round(xMm), yMm: round(yMm), wMm: round(wMm), hMm: round(hMm) };
};

const handleStyle = (handle: THandle, color: string): React.CSSProperties => {
  const pos: React.CSSProperties = {};
  pos.top = handle.includes("n") ? -5 : handle.includes("s") ? undefined : "calc(50% - 5px)";
  pos.bottom = handle.includes("s") ? -5 : undefined;
  pos.left = handle.includes("w") ? -5 : handle.includes("e") ? undefined : "calc(50% - 5px)";
  pos.right = handle.includes("e") ? -5 : undefined;
  return {
    ...pos,
    position: "absolute",
    width: 10,
    height: 10,
    background: "#fff",
    border: `1.5px solid ${color}`,
    borderRadius: 2,
    cursor: `${handle}-resize`,
    touchAction: "none",
  };
};

/** กระดาษขนาดจริงย่อให้พอดีพื้นที่ + กล่องเลือก/ลาก/ย่อขยายวางทับเป็น px */
export default function PrintCanvas({
  layout,
  photoUrl,
  shareUrl,
  assetUrls,
  selectedId,
  onSelect,
  onChangeBox,
  semantic,
}: PrintCanvasProps) {
  const deskRef = useRef<HTMLDivElement>(null);
  const [deskSize, setDeskSize] = useState({ width: 0, height: 0 });
  const [drag, setDrag] = useState<IDrag | null>(null);
  // ขนาด 1mm ในหน่วย px ของเบราว์เซอร์ (CSS กำหนด 96px = 25.4mm)
  const pxPerMmNative = 96 / 25.4;

  useEffect(() => {
    const node = deskRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setDeskSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { paper } = layout;
  const cardWmm = paper.widthMm + paper.bleedMm * 2;
  const cardHmm = paper.heightMm + paper.bleedMm * 2;
  const pxPerMm = Math.max(
    0.5,
    Math.min(
      (deskSize.width - DESK_PADDING * 2) / cardWmm,
      (deskSize.height - DESK_PADDING * 2) / cardHmm,
    ),
  );
  const scale = pxPerMm / pxPerMmNative;
  const px = (mm: number) => mm * pxPerMm;
  // พิกัด element อ้างอิงขอบกระดาษ — บน desk ต้องบวก bleed
  const toPx = (mm: number) => px(mm + paper.bleedMm);

  const primary = semantic.colorPrimary as string;
  const warning = (semantic.colorWarning as string) ?? "#fa8c16";

  const startDrag = (event: React.PointerEvent, el: TPrintBoxElement, handle: IDrag["handle"]) => {
    event.stopPropagation();
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    onSelect(el.id);
    setDrag({
      id: el.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      start: { id: el.id, xMm: el.xMm, yMm: el.yMm, wMm: el.wMm, hMm: el.hMm },
    });
  };

  const moveDrag = (event: React.PointerEvent) => {
    if (!drag) return;
    const dxMm = (event.clientX - drag.startX) / pxPerMm;
    const dyMm = (event.clientY - drag.startY) / pxPerMm;
    onChangeBox(drag.id, applyDrag(drag, dxMm, dyMm));
  };

  const nudge = (event: React.KeyboardEvent, el: TPrintBoxElement) => {
    const step = event.shiftKey ? 5 : 1;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    onChangeBox(el.id, { xMm: el.xMm + move[0], yMm: el.yMm + move[1] });
  };

  return (
    <div
      ref={deskRef}
      onPointerDown={() => onSelect(null)}
      style={{
        position: "relative",
        height: "100%",
        minHeight: 420,
        background: semantic.colorFillTertiary as string,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: px(cardWmm),
          height: px(cardHmm),
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.12)",
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
          <PrintCard layout={layout} photoUrl={photoUrl} shareUrl={shareUrl} assetUrls={assetUrls} />
        </div>

        {paper.bleedMm > 0 && (
          // เส้นตัดกระดาษจริง — พื้นที่นอกเส้นคือ bleed ที่อาจถูกตัดทิ้ง
          <div
            style={{
              position: "absolute",
              left: px(paper.bleedMm),
              top: px(paper.bleedMm),
              width: px(paper.widthMm),
              height: px(paper.heightMm),
              outline: "1px solid rgba(0, 0, 0, 0.35)",
              pointerEvents: "none",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: toPx(paper.marginMm),
            top: toPx(paper.marginMm),
            width: px(paper.widthMm - paper.marginMm * 2),
            height: px(paper.heightMm - paper.marginMm * 2),
            border: `1px dashed ${SAFE_ZONE_COLOR}`,
            pointerEvents: "none",
          }}
        />

        {layout.elements.filter(isBox).map((el) => {
          const selected = el.id === selectedId;
          const outside = isOutsideSafeZone(el, layout);
          const color = outside ? warning : primary;
          return (
            <div
              key={el.id}
              role="button"
              tabIndex={0}
              aria-label={`${el.type} ${el.xMm}, ${el.yMm} mm`}
              onPointerDown={(event) => startDrag(event, el, "move")}
              onPointerMove={moveDrag}
              onPointerUp={() => setDrag(null)}
              onFocus={() => onSelect(el.id)}
              onKeyDown={(event) => nudge(event, el)}
              style={{
                position: "absolute",
                left: toPx(el.xMm),
                top: toPx(el.yMm),
                width: px(el.wMm),
                height: px(el.hMm),
                cursor: drag ? "grabbing" : "grab",
                outline: selected
                  ? `2px solid ${color}`
                  : outside
                    ? `1px dashed ${warning}`
                    : undefined,
                outlineOffset: 0,
                touchAction: "none",
              }}
            >
              {selected &&
                HANDLES.map((handle) => (
                  <span
                    key={handle}
                    onPointerDown={(event) => startDrag(event, el, handle)}
                    onPointerMove={moveDrag}
                    onPointerUp={() => setDrag(null)}
                    style={handleStyle(handle, color)}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
