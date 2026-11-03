"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { IPhotoEventGeneration, IPrintDesign, IPrintLayout } from "@/app/common/photo-event.type";
import { buildPhotoShareUrl } from "@/app/utils/photo-event";
import { PrintCard } from "./print-card";

// margin 0 = ไม่มีที่ให้ Chrome วาง header/footer (วันที่, title, URL, เลขหน้า)
const buildPrintCss = ({ paper }: IPrintLayout): string => `
.pe-print-sheet { display: none; }
@media print {
  @page { size: ${paper.widthMm}mm ${paper.heightMm}mm; margin: 0; }
  body > *:not(.pe-print-sheet) { display: none !important; }
  html, body { background: #fff !important; height: auto !important; overflow: visible !important; margin: 0 !important; }
  .pe-print-sheet {
    display: block; position: relative; overflow: hidden;
    width: ${paper.widthMm}mm; height: ${paper.heightMm}mm;
  }
  .pe-print-sheet > div { position: absolute; left: -${paper.bleedMm}mm; top: -${paper.bleedMm}mm; }
}
`;

interface PrintSheetProps {
  generation: IPhotoEventGeneration;
  layout: IPrintLayout;
  assetUrls: Record<string, string>;
  onDone: () => void;
  onError: () => void;
}

/** หน้าที่มองเห็นเฉพาะตอนพิมพ์ — สั่ง print หลังรูปทุกรูปโหลดเสร็จเท่านั้น ไม่งั้นได้หน้าว่าง */
function PrintSheet({ generation, layout, assetUrls, onDone, onError }: PrintSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  // caller ส่ง callback แบบ inline — เก็บใน ref ไม่งั้น effect ด้านล่างรันซ้ำแล้วสั่งพิมพ์ 2 ครั้ง
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    window.addEventListener("afterprint", finish);
    return () => window.removeEventListener("afterprint", finish);
  }, [finish]);

  useEffect(() => {
    const images = Array.from(sheetRef.current?.querySelectorAll("img") ?? []);
    let cancelled = false;
    Promise.all(images.map((img) => img.decode()))
      .then(() => {
        // รอ 1 frame ให้ layout ของหน้า print พร้อมก่อนเปิด dialog
        requestAnimationFrame(() => {
          if (cancelled) return;
          window.print();
          finish();
        });
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current();
      });
    return () => {
      cancelled = true;
    };
    // พิมพ์ครั้งเดียวต่อ sheet (sheet ถูก key ด้วย generation id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="pe-print-sheet" ref={sheetRef}>
      <style>{buildPrintCss(layout)}</style>
      <PrintCard
        layout={layout}
        photoUrl={generation.resultUrl ?? ""}
        shareUrl={buildPhotoShareUrl(generation.id)}
        assetUrls={assetUrls}
      />
    </div>,
    document.body,
  );
}

/**
 * สั่งพิมพ์รูปผลลัพธ์ตาม design (ส่ง Promise ได้ — เช่นโหลด template ที่ active ตอนกด)
 * `printing` เป็น true ตั้งแต่กดจนปิด dialog; โหลด design หรือรูปไม่ได้ → `onError`
 */
export const usePrintGeneration = (onError?: () => void) => {
  const [target, setTarget] = useState<{
    generation: IPhotoEventGeneration;
    design: IPrintDesign;
  } | null>(null);
  const [loadingDesign, setLoadingDesign] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const print = useCallback(
    async (generation: IPhotoEventGeneration, design: IPrintDesign | Promise<IPrintDesign>) => {
      if (!generation.resultUrl) return;
      setLoadingDesign(true);
      try {
        setTarget({ generation, design: await design });
      } catch (error) {
        console.error("Failed to load print design", error);
        onErrorRef.current?.();
      } finally {
        setLoadingDesign(false);
      }
    },
    [],
  );

  const clear = useCallback(() => setTarget(null), []);
  const fail = useCallback(() => {
    setTarget(null);
    onErrorRef.current?.();
  }, []);

  const sheet = target ? (
    <PrintSheet
      key={target.generation.id}
      generation={target.generation}
      layout={target.design.layout}
      assetUrls={target.design.assetUrls}
      onDone={clear}
      onError={fail}
    />
  ) : null;

  return { print, printing: loadingDesign || Boolean(target), sheet };
};
