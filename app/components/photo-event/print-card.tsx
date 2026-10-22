"use client";

import React from "react";
import { QRCode } from "antd";
import type { IPrintBox, IPrintLayout, TPrintElement } from "@/app/common/photo-event.type";

interface PrintCardProps {
  layout: IPrintLayout;
  photoUrl: string;
  shareUrl: string;
  /** storage key → URL ที่โหลดได้ (presigned) ของพื้นหลัง/icon/overlay */
  assetUrls: Record<string, string>;
}

const mm = (value: number): string => `${value}mm`;

const FILL: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

/** การ์ดขนาดจริงเป็น mm — ตัวเดียวกันใช้ทั้ง preview ใน editor และหน้าที่สั่งพิมพ์ */
export function PrintCard({ layout, photoUrl, shareUrl, assetUrls }: PrintCardProps) {
  const { paper, background } = layout;
  const bgUrl = background.imageKey ? assetUrls[background.imageKey] : undefined;

  // พิกัด element อ้างอิงขอบกระดาษจริง จึงเลื่อนเข้ามาเท่ากับ bleed
  const boxStyle = (box: IPrintBox): React.CSSProperties => ({
    position: "absolute",
    left: mm(box.xMm + paper.bleedMm),
    top: mm(box.yMm + paper.bleedMm),
    width: mm(box.wMm),
    height: mm(box.hMm),
  });

  const renderElement = (el: TPrintElement) => {
    switch (el.type) {
      case "photo":
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={el.id}
            src={photoUrl}
            alt="AI photo"
            style={{ ...boxStyle(el), objectFit: el.fit, objectPosition: `${el.focusX}% ${el.focusY}%` }}
          />
        );
      case "qr":
        return (
          <div key={el.id} className="pe-print-qr" style={boxStyle(el)}>
            <QRCode
              type="svg"
              value={shareUrl}
              bordered={false}
              bgColor={el.bgColor}
              color={el.color}
              style={{ width: "100%", height: "100%", padding: 0 }}
            />
          </div>
        );
      case "icon":
        return assetUrls[el.assetKey] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={el.id} src={assetUrls[el.assetKey]} alt="" style={{ ...boxStyle(el), objectFit: "contain" }} />
        ) : null;
      case "text":
        return (
          <div
            key={el.id}
            style={{
              ...boxStyle(el),
              fontSize: `${el.fontSizePt}pt`,
              fontWeight: el.weight,
              color: el.color,
              textAlign: el.align,
              lineHeight: 1.2,
              whiteSpace: "pre-wrap",
              overflow: "hidden",
            }}
          >
            {el.content}
          </div>
        );
      case "overlay":
        return assetUrls[el.assetKey] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={el.id} src={assetUrls[el.assetKey]} alt="" style={{ ...FILL, objectFit: "fill" }} />
        ) : null;
    }
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: mm(paper.widthMm + paper.bleedMm * 2),
        height: mm(paper.heightMm + paper.bleedMm * 2),
        background: background.color,
      }}
    >
      {bgUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bgUrl} alt="" style={{ ...FILL, objectFit: background.fit }} />
      )}
      {layout.elements.map(renderElement)}
      <style>{`.pe-print-qr svg { width: 100% !important; height: 100% !important; display: block; }`}</style>
    </div>
  );
}
