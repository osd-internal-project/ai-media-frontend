"use client";

import React from "react";
import { QRCode } from "antd";
import { RotateCcw } from "lucide-react";
import type { IPhotoEventGeneration } from "@/app/common/photo-event.type";
import { buildPhotoShareUrl } from "@/app/utils/photo-event";
import LoadingImage from "@/app/components/photo-event/loading-image";

interface ResultStepProps {
  generation: IPhotoEventGeneration;
  idleSecondsLeft: number;
  onRestart: () => void;
}

export default function ResultStep({
  generation,
  idleSecondsLeft,
  onRestart,
}: ResultStepProps) {
  return (
    <div className="kiosk-content">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">Step 04 · Your photo is ready</span>
        <h1>ภาพของคุณพร้อมแล้ว</h1>
        <span className="kiosk-sub kiosk-serif">Scan the code to keep it</span>
      </div>
      <div className="kiosk-result">
        <div className="kiosk-hero">
          {generation.resultUrl && (
            <LoadingImage className="kiosk-img" src={generation.resultUrl} alt="Your AI photo" />
          )}
        </div>
        <div className="kiosk-result-side">
          <div className="kiosk-qr-card">
            <QRCode
              value={buildPhotoShareUrl(generation.id)}
              size={196}
              bordered={false}
              bgColor="#ffffff"
              color="#191c20"
            />
            <div>
              <strong>สแกนเพื่อดาวน์โหลด</strong>
              <span>Scan to download · เปิดกล้องมือถือแล้วส่องที่โค้ด</span>
            </div>
          </div>
          <button type="button" className="kiosk-btn" onClick={onRestart}>
            <RotateCcw size={22} />
            เริ่มใหม่ <small>Start over · {idleSecondsLeft}s</small>
          </button>
        </div>
      </div>
    </div>
  );
}
