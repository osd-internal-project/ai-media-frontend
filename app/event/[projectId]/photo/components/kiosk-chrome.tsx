"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronLeft, Maximize, Minimize } from "lucide-react";
import { KIOSK_STEPS, TKioskStep } from "../kiosk.types";

interface KioskChromeProps {
  step: TKioskStep;
  onBack: () => void;
}

export default function KioskChrome({ step, onBack }: KioskChromeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeIndex = KIOSK_STEPS.findIndex((s) => s.key === step);

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
      <div className="kiosk-steps">
        {KIOSK_STEPS.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && <div className="kiosk-step-line" />}
            <div
              className={`kiosk-step-dot ${index === activeIndex ? "is-active" : ""} ${
                index < activeIndex ? "is-done" : ""
              }`}
            >
              <span>{index < activeIndex ? <Check size={14} /> : index + 1}</span>
              <em style={{ fontStyle: "normal" }}>{item.label}</em>
            </div>
          </React.Fragment>
        ))}
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
