import React from "react";
import { createRoot } from "react-dom/client";
import { QRCode } from "antd";
import type { IPrintBox, IPrintDesign, TPrintElement } from "@/app/common/photo-event.type";

const DOWNLOAD_DPI = 300;
const PX_PER_MM = DOWNLOAD_DPI / 25.4;
const PX_PER_PT = DOWNLOAD_DPI / 72;
// ตรงกับ lineHeight ของข้อความใน PrintCard
const LINE_HEIGHT = 1.2;

interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface IRenderCardInput extends IPrintDesign {
  photoUrl: string;
  shareUrl: string;
}

// fetch แบบไม่ใช้ cache: ถ้า <img> เคยโหลด URL เดียวกันแบบไม่มี CORS ไว้ canvas จะ export ไม่ได้
// object URL ต้องอยู่จนวาดเสร็จ จึงเก็บไว้ใน `objectUrls` ให้ caller revoke
const loadImage = async (url: string, objectUrls: string[]): Promise<HTMLImageElement> => {
  const res = await fetch(url, { mode: "cors", cache: "no-store" });
  if (!res.ok) throw new Error(`Image request failed (${res.status})`);
  const objectUrl = URL.createObjectURL(await res.blob());
  objectUrls.push(objectUrl);
  const img = new Image();
  img.src = objectUrl;
  await img.decode();
  return img;
};

/** QR ตัวเดียวกับใน PrintCard (antd) — render เป็น SVG แล้วแปลงเป็นรูปขนาด `sizePx` */
const loadQrImage = async (
  value: string,
  color: string,
  bgColor: string,
  sizePx: number,
): Promise<HTMLImageElement> => {
  const root = createRoot(document.createElement("div"));
  // flushSync ไม่ flush เมื่อถูกเรียกระหว่าง effect — รอ ref ของ wrapper ซึ่งผูกหลังลูก commit แล้ว
  const markup = await new Promise<string>((resolve, reject) => {
    const capture = (node: HTMLDivElement | null) => {
      if (!node) return;
      const svg = node.querySelector("svg");
      if (!svg) return reject(new Error("QR code did not render"));
      svg.setAttribute("width", String(sizePx));
      svg.setAttribute("height", String(sizePx));
      resolve(new XMLSerializer().serializeToString(svg));
    };
    root.render(
      <div ref={capture}>
        <QRCode type="svg" value={value} bordered={false} color={color} bgColor={bgColor} />
      </div>,
    );
  }).finally(() => setTimeout(() => root.unmount(), 0));
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await img.decode();
  return img;
};

/** วางรูปแบบ CSS object-fit + object-position ภายในกรอบ */
const drawFitted = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: IRect,
  fit: "cover" | "contain" | "fill",
  focusX = 50,
  focusY = 50,
) => {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  if (fit === "fill") {
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
  } else {
    const ratio = fit === "cover"
      ? Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight)
      : Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight);
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    ctx.drawImage(img, box.x + ((box.w - w) * focusX) / 100, box.y + ((box.h - h) * focusY) / 100, w, h);
  }
  ctx.restore();
};

/** ตัดบรรทัดแบบ `white-space: pre-wrap` — แยกคำไทยด้วย Intl.Segmenter */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  return text.split("\n").flatMap((paragraph) => {
    const lines: string[] = [];
    let line = "";
    for (const { segment } of segmenter.segment(paragraph)) {
      const next = line + segment;
      if (line && ctx.measureText(next.trimEnd()).width > maxWidth) {
        lines.push(line.trimEnd());
        line = segment.trimStart();
      } else {
        line = next;
      }
    }
    lines.push(line.trimEnd());
    return lines;
  });
};

const textFont = (el: Extract<TPrintElement, { type: "text" }>, fontFamily: string) =>
  `${el.weight} ${el.fontSizePt * PX_PER_PT}px ${fontFamily}`;

const drawText = (
  ctx: CanvasRenderingContext2D,
  el: Extract<TPrintElement, { type: "text" }>,
  box: IRect,
  fontFamily: string,
) => {
  const fontPx = el.fontSizePt * PX_PER_PT;
  const lineHeight = fontPx * LINE_HEIGHT;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.font = textFont(el, fontFamily);
  ctx.fillStyle = el.color;
  ctx.textAlign = el.align;
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText("กAg");
  const ascent = metrics.fontBoundingBoxAscent ?? fontPx * 0.8;
  const descent = metrics.fontBoundingBoxDescent ?? fontPx * 0.2;
  // baseline ตาม CSS: half-leading + ascent ภายใน line box
  const baselineOffset = (lineHeight - (ascent + descent)) / 2 + ascent;
  const x = el.align === "left" ? box.x : el.align === "right" ? box.x + box.w : box.x + box.w / 2;
  wrapText(ctx, el.content, box.w).forEach((line, i) => {
    ctx.fillText(line, x, box.y + i * lineHeight + baselineOffset);
  });
  ctx.restore();
};


type TCardImages = {
  background: HTMLImageElement | null;
  /** index เดียวกับ `layout.elements` — text ได้ null */
  elements: (HTMLImageElement | null)[];
};

/** โหลดรูปทุกชิ้น + font ของข้อความให้ครบก่อนวาด */
const loadCardImages = async (
  { layout, assetUrls, photoUrl, shareUrl }: IRenderCardInput,
  fontFamily: string,
  objectUrls: string[],
): Promise<TCardImages> => {
  const loadAsset = (key: string | undefined) =>
    key && assetUrls[key] ? loadImage(assetUrls[key], objectUrls) : Promise.resolve(null);
  const loadElement = (el: TPrintElement) => {
    switch (el.type) {
      case "photo":
        return loadImage(photoUrl, objectUrls);
      case "qr":
        return loadQrImage(shareUrl, el.color, el.bgColor, Math.round(el.wMm * PX_PER_MM));
      case "icon":
      case "overlay":
        return loadAsset(el.assetKey);
      case "text":
        return document.fonts.load(textFont(el, fontFamily)).then(() => null);
    }
  };
  const [background, elements] = await Promise.all([
    loadAsset(layout.background.imageKey),
    Promise.all(layout.elements.map(loadElement)),
  ]);
  return { background, elements };
};

const paintCard = (
  ctx: CanvasRenderingContext2D,
  { paper, background, elements }: IPrintDesign["layout"],
  images: TCardImages,
  fontFamily: string,
) => {
  const px = (mm: number) => mm * PX_PER_MM;
  const card: IRect = { x: 0, y: 0, w: px(paper.widthMm + paper.bleedMm * 2), h: px(paper.heightMm + paper.bleedMm * 2) };
  // พิกัด element อ้างอิงขอบกระดาษจริง จึงเลื่อนเข้ามาเท่ากับ bleed (เหมือน PrintCard)
  const toRect = (box: IPrintBox): IRect => ({
    x: px(box.xMm + paper.bleedMm),
    y: px(box.yMm + paper.bleedMm),
    w: px(box.wMm),
    h: px(box.hMm),
  });

  // วาดทั้งการ์ดรวม bleed แล้วเลื่อนออก เหมือน print-sheet ที่ตัดขอบ bleed ทิ้ง
  ctx.translate(-px(paper.bleedMm), -px(paper.bleedMm));
  ctx.fillStyle = background.color;
  ctx.fillRect(card.x, card.y, card.w, card.h);
  if (images.background) drawFitted(ctx, images.background, card, background.fit);

  elements.forEach((el, i) => {
    const img = images.elements[i];
    if (el.type === "text") drawText(ctx, el, toRect(el), fontFamily);
    else if (!img) return;
    else if (el.type === "photo") drawFitted(ctx, img, toRect(el), el.fit, el.focusX, el.focusY);
    else if (el.type === "qr") drawFitted(ctx, img, toRect(el), "fill");
    else if (el.type === "icon") drawFitted(ctx, img, toRect(el), "contain");
    else drawFitted(ctx, img, card, "fill");
  });
};

/**
 * วาดการ์ดตาม layout เป็น PNG ขนาดกระดาษ (ตัด bleed) ที่ 300 dpi — หน้าตาเดียวกับ PrintCard ที่สั่งพิมพ์
 * รูปไหนโหลดไม่ได้ → throw (ไม่ส่งการ์ดที่ขาดชิ้นส่วน)
 */
export const renderPrintCardPng = async (input: IRenderCardInput): Promise<Blob> => {
  const { paper } = input.layout;
  // ข้อความใน PrintCard ใช้ font ที่ globals.css บังคับกับทุก element
  const fontFamily = getComputedStyle(document.body).fontFamily;
  const objectUrls: string[] = [];
  try {
    const images = await loadCardImages(input, fontFamily, objectUrls);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(paper.widthMm * PX_PER_MM);
    canvas.height = Math.round(paper.heightMm * PX_PER_MM);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported");
    paintCard(ctx, input.layout, images, fontFamily);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Cannot export the card"))),
        "image/png",
      ),
    );
  } finally {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }
};

/** บันทึก blob เป็นไฟล์ผ่าน <a download> */
export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Safari เริ่มอ่าน blob หลัง click คืน — revoke ทันทีจะได้ไฟล์ว่าง
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const cardFilename = (generationId: string) => `photo-${generationId.slice(0, 8)}.png`;
