"use client";

import React, { useEffect, useState } from "react";
import { Home, RotateCcw } from "lucide-react";
import type { IPhotoEventPhoto } from "@/app/common/photo-event.type";
import LoadingImage from "@/app/components/photo-event/loading-image";

const LOADING_MESSAGES = [
  { th: "กำลังเตรียมสตูดิโอ AI…", en: "Warming up the AI studio" },
  { th: "กำลังใส่สไตล์ให้คุณ…", en: "Applying your style" },
  { th: "เก็บรายละเอียดขั้นสุดท้าย…", en: "Adding the finishing touches" },
  { th: "ใกล้เสร็จแล้ว…", en: "Almost there" },
] as const;

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface GeneratingStepProps {
  photo: IPhotoEventPhoto | null;
  progress: number | null;
  errorMessage: string | null;
  onRetry: () => void;
  onRestart: () => void;
}

export default function GeneratingStep({
  photo,
  progress,
  errorMessage,
  onRetry,
  onRestart,
}: GeneratingStepProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const message = LOADING_MESSAGES[messageIndex];
  const hasProgress = typeof progress === "number" && progress > 0;

  useEffect(() => {
    if (errorMessage) return;
    const timer = setInterval(
      () => setMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1)),
      6000,
    );
    return () => clearInterval(timer);
  }, [errorMessage]);

  return (
    <div className="kiosk-content">
      <div className="kiosk-generating">
        <div className="kiosk-hero">
          {photo?.url && (
            <LoadingImage className="kiosk-img" src={photo.url} alt={photo.imageName} />
          )}
          {!errorMessage && <div className="kiosk-scan" />}
          {!errorMessage && (
            <div className="kiosk-ring">
              <svg viewBox="0 0 120 120" aria-hidden>
                <defs>
                  <linearGradient id="kiosk-accent" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7b78f2" />
                    <stop offset="100%" stopColor="#5ecfd8" />
                  </linearGradient>
                </defs>
                <circle className="kiosk-ring-track" cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="3" />
                <circle
                  className={`kiosk-ring-value ${hasProgress ? "" : "kiosk-ring-spin"}`}
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={
                    hasProgress
                      ? RING_CIRCUMFERENCE * (1 - Math.min(progress, 100) / 100)
                      : RING_CIRCUMFERENCE * 0.72
                  }
                  transform="rotate(-90 60 60)"
                />
              </svg>
              {hasProgress && <span className="kiosk-ring-text">{progress}%</span>}
            </div>
          )}
        </div>
        {errorMessage ? (
          <>
            <h2>เกิดข้อผิดพลาด</h2>
            <p>{errorMessage}</p>
            <div className="kiosk-actions">
              <button type="button" className="kiosk-btn" onClick={onRestart}>
                <Home size={22} />
                เริ่มใหม่ <small>Start over</small>
              </button>
              <button type="button" className="kiosk-btn is-primary" onClick={onRetry}>
                <RotateCcw size={22} />
                ลองอีกครั้ง <small>Try again</small>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>กำลังสร้างภาพของคุณ</h2>
            <p>
              {message.th} <span className="kiosk-serif">{message.en}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
