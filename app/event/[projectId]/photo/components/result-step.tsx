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
        <h1>Your photo is ready!</h1>
      </div>
      <div className="kiosk-result">
        <div className="kiosk-frame">
          {generation.resultUrl && (
            <LoadingImage className="kiosk-img" src={generation.resultUrl} alt="Your AI photo" />
          )}
        </div>
        <div className="kiosk-result-side">
          <div className="kiosk-qr-card">
            <QRCode
              value={buildPhotoShareUrl(generation.id)}
              size={200}
              bordered={false}
              bgColor="#ffffff"
              color="#000000"
            />
            <div>
              <strong>Scan to download</strong>
              <span>Open your camera and point it at the code</span>
            </div>
          </div>
          <button type="button" className="kiosk-btn" onClick={onRestart}>
            <RotateCcw size={22} />
            Start over ({idleSecondsLeft}s)
          </button>
        </div>
      </div>
    </div>
  );
}
