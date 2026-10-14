"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, Maximize, Minimize } from "lucide-react";
import { KIOSK_STEPS, TKioskStep } from "../kiosk.types";

interface KioskChromeProps {
  step: TKioskStep;
  onBack: () => void;
}

export default function KioskChrome({ step, onBack }: KioskChromeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeIndex = KIOSK_STEPS.findIndex((s) => s.key === step);
  const active = KIOSK_STEPS[activeIndex];

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="kiosk-chrome">
      <button type="button" className="kiosk-icon-btn" onClick={onBack} aria-label="Back">
        <ChevronLeft size={22} />
      </button>
      <div className="kiosk-progress">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="kiosk-logo" src="/images/Logo.png" alt="AI CAVE" />
        <div className="kiosk-progress-bars">
          {KIOSK_STEPS.map((item, index) => (
            <span
              key={item.key}
              className={
                index === activeIndex ? "is-active" : index < activeIndex ? "is-done" : ""
              }
            />
          ))}
        </div>
        {active && (
          <div className="kiosk-progress-label">
            <b>{String(activeIndex + 1).padStart(2, "0")}</b> / 04 · {active.th} · {active.en}
          </div>
        )}
      </div>
      <button
        type="button"
        className="kiosk-icon-btn"
        onClick={toggleFullscreen}
        aria-label="Toggle fullscreen"
        style={{ justifySelf: "end" }}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  );
}
