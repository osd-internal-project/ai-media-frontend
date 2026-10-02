"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { QRCode } from "antd";
import type { IPhotoEventGeneration } from "@/app/common/photo-event.type";
import { buildPhotoShareUrl } from "@/app/utils/photo-event";

const PRINT_CSS = `
.pe-print-sheet { display: none; }
@media print {
  @page { size: A4 portrait; margin: 12mm; }
  body > *:not(.pe-print-sheet) { display: none !important; }
  html, body { background: #fff !important; height: auto !important; overflow: visible !important; }
  .pe-print-sheet {
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    width: 186mm; height: 272mm; color: #191c20; font-family: inherit;
  }
  .pe-print-photo { width: 100%; height: 212mm; object-fit: contain; }
  .pe-print-footer { display: flex; align-items: center; gap: 8mm; width: 100%; padding-top: 6mm; }
  .pe-print-footer strong { display: block; font-size: 16pt; font-weight: 500; }
  .pe-print-footer span { display: block; margin-top: 2mm; font-size: 10pt; color: #5b6573; }
}
`;

interface PrintSheetProps {
  generation: IPhotoEventGeneration;
  onDone: () => void;
  onError: () => void;
}

/** หน้า A4 ที่มองเห็นเฉพาะตอนพิมพ์ — สั่ง print หลังรูปโหลดเสร็จเท่านั้น ไม่งั้นได้หน้าว่าง */
function PrintSheet({ generation, onDone, onError }: PrintSheetProps) {
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    window.addEventListener("afterprint", finish);
    return () => window.removeEventListener("afterprint", finish);
  }, [finish]);

  const printNow = () => {
    // รอ 1 frame ให้ layout ของหน้า print พร้อมก่อนเปิด dialog
    requestAnimationFrame(() => {
      window.print();
      finish();
    });
  };

  return createPortal(
    <div className="pe-print-sheet">
      <style>{PRINT_CSS}</style>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="pe-print-photo"
        src={generation.resultUrl ?? ""}
        alt="AI photo"
        onLoad={printNow}
        onError={onError}
      />
      <div className="pe-print-footer">
        <QRCode
          type="svg"
          value={buildPhotoShareUrl(generation.id)}
          size={150}
          bordered={false}
          bgColor="#ffffff"
          color="#000000"
        />
        <div>
          <strong>สแกนเพื่อดาวน์โหลดภาพ</strong>
          <span>Scan to download your photo</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** สั่งพิมพ์รูปผลลัพธ์ + QR บน A4; `printing` เป็น true ตั้งแต่กดจนปิด dialog */
export const usePrintGeneration = (onError?: () => void) => {
  const [target, setTarget] = useState<IPhotoEventGeneration | null>(null);

  const print = useCallback((generation: IPhotoEventGeneration) => {
    if (generation.resultUrl) setTarget(generation);
  }, []);

  const clear = useCallback(() => setTarget(null), []);
  const fail = useCallback(() => {
    setTarget(null);
    onError?.();
  }, [onError]);

  const sheet = target ? (
    <PrintSheet key={target.id} generation={target} onDone={clear} onError={fail} />
  ) : null;

  return { print, printing: Boolean(target), sheet };
};
