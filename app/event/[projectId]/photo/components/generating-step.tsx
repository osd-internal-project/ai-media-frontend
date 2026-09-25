"use client";

import React, { useEffect, useState } from "react";
import { RotateCcw, Home } from "lucide-react";
import type { IPhotoEventPhoto } from "@/app/common/photo-event.type";
import LoadingImage from "@/app/components/photo-event/loading-image";

const LOADING_MESSAGES = [
  "Warming up the AI studio…",
  "Applying your style…",
  "Adding the finishing touches…",
  "Almost there…",
] as const;

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
        <div className="kiosk-frame">
          {photo?.url && (
            <LoadingImage className="kiosk-img" src={photo.url} alt={photo.imageName} />
          )}
          {!errorMessage && <div className="kiosk-shimmer" />}
          {!errorMessage && (
            <div className="kiosk-progress-ring">{progress ? `${progress}%` : "✨"}</div>
          )}
        </div>
        {errorMessage ? (
          <>
            <h2>Something went wrong</h2>
            <p>{errorMessage}</p>
            <div className="kiosk-actions">
              <button type="button" className="kiosk-btn" onClick={onRestart}>
                <Home size={22} />
                Start over
              </button>
              <button type="button" className="kiosk-btn is-primary" onClick={onRetry}>
                <RotateCcw size={22} />
                Try again
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Creating your photo</h2>
            <p>{LOADING_MESSAGES[messageIndex]}</p>
          </>
        )}
      </div>
    </div>
  );
}
