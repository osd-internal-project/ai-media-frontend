"use client";

import React, { useEffect } from "react";
import { RectangleHorizontal, RectangleVertical, X } from "lucide-react";
import {
  IKioskDisplay,
  IKioskLayout,
  ISize,
  KIOSK_DISPLAY_DEFAULT,
  KIOSK_DISPLAY_PRESETS,
  KIOSK_MARGIN_RANGE,
  KIOSK_SCALE_RANGE,
  KIOSK_TEMPLATE_COLUMNS,
  KIOSK_WIDTH_RANGE,
} from "../kiosk-display";

interface DisplaySettingsProps {
  display: IKioskDisplay;
  layout: IKioskLayout;
  onChange: (next: IKioskDisplay) => void;
  onClose: () => void;
}

const sameFrame = (a: ISize | null, b: ISize | null) =>
  a === b || (!!a && !!b && a.width === b.width && a.height === b.height);

export default function DisplaySettings({ display, layout, onChange, onClose }: DisplaySettingsProps) {
  const { screen } = layout;
  const isPortrait = layout.portraitLayout || screen.height >= screen.width;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // แนวจอเป็นตัวตัดสิน layout (ปุ่มข้าง/ปุ่มล่าง) — เต็มจอยังเต็มจอ ไม่ย่อเป็นกรอบ
  const setOrientation = (portrait: boolean) => {
    if (portrait === isPortrait) return;
    const frame = display.frame && { width: display.frame.height, height: display.frame.width };
    onChange({ ...display, frame, orientation: portrait ? "portrait" : "landscape" });
  };

  const setPreset = (frame: ISize | null) => {
    const orientation = frame ? (frame.height >= frame.width ? "portrait" : "landscape") : display.orientation;
    onChange({ ...display, frame, orientation });
  };

  const setWidth = (width: number) => {
    const height = Math.round((width * screen.height) / screen.width);
    onChange({ ...display, frame: { width, height } });
  };

  return (
    <div className="kiosk-settings-scrim" onClick={onClose}>
      <section
        className="kiosk-settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kiosk-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h2 id="kiosk-settings-title">ตั้งค่าหน้าจอ</h2>
          <button type="button" className="kiosk-icon-btn" onClick={onClose} aria-label="ปิด">
            <X size={20} />
          </button>
        </header>

        <div className="kiosk-settings-row">
          <span>แนวจอ</span>
          <div className="kiosk-segment">
            <button type="button" aria-pressed={isPortrait} onClick={() => setOrientation(true)}>
              <RectangleVertical size={18} /> แนวตั้ง
            </button>
            <button type="button" aria-pressed={!isPortrait} onClick={() => setOrientation(false)}>
              <RectangleHorizontal size={18} /> แนวนอน
            </button>
          </div>
        </div>

        <div className="kiosk-settings-row">
          <span>ขนาดจอ</span>
          <div className="kiosk-segment">
            {KIOSK_DISPLAY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                aria-pressed={sameFrame(display.frame, preset.frame)}
                onClick={() => setPreset(preset.frame)}
              >
                {preset.label}
                {preset.frame && (
                  <small>
                    {preset.frame.width}×{preset.frame.height}
                  </small>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="kiosk-settings-row">
          <span>คอลัมน์สไตล์</span>
          <div className="kiosk-segment">
            {KIOSK_TEMPLATE_COLUMNS.map((columns) => (
              <button
                key={columns ?? "auto"}
                type="button"
                aria-pressed={display.templateColumns === columns}
                onClick={() => onChange({ ...display, templateColumns: columns })}
              >
                {columns ?? "อัตโนมัติ"}
              </button>
            ))}
          </div>
        </div>

        <div className="kiosk-settings-row">
          <label htmlFor="kiosk-width">
            ความกว้าง <output htmlFor="kiosk-width">{Math.round(screen.width)} px</output>
          </label>
          <input
            id="kiosk-width"
            type="range"
            {...KIOSK_WIDTH_RANGE}
            value={Math.round(screen.width)}
            onChange={(event) => setWidth(Number(event.target.value))}
          />
        </div>

        <div className="kiosk-settings-row">
          <label htmlFor="kiosk-scale">
            ขนาด UI <output htmlFor="kiosk-scale">{Math.round(display.scale * 100)} %</output>
          </label>
          <input
            id="kiosk-scale"
            type="range"
            {...KIOSK_SCALE_RANGE}
            value={display.scale}
            onChange={(event) => onChange({ ...display, scale: Number(event.target.value) })}
          />
        </div>

        <div className="kiosk-settings-row">
          <label htmlFor="kiosk-margin">
            ขอบปลอดภัย <output htmlFor="kiosk-margin">{display.margin} px</output>
          </label>
          <input
            id="kiosk-margin"
            type="range"
            {...KIOSK_MARGIN_RANGE}
            value={display.margin}
            onChange={(event) => onChange({ ...display, margin: Number(event.target.value) })}
          />
        </div>

        <p className="kiosk-settings-summary">
          จอ {Math.round(screen.width)}×{Math.round(screen.height)} px
          {layout.portraitLayout && " ใช้ layout แนวตั้ง"}
          {layout.fit < 1 && ` ย่อแสดงที่ ${Math.round(layout.fit * 100)}% ให้พอดีจอนี้`}
          {layout.fit > 1 && ` ขยายแสดงที่ ${Math.round(layout.fit * 100)}% ให้พอดีจอนี้`}
        </p>

        <footer>
          <button type="button" className="kiosk-btn" onClick={() => onChange(KIOSK_DISPLAY_DEFAULT)}>
            คืนค่าเริ่มต้น
          </button>
          <button type="button" className="kiosk-btn is-primary" onClick={onClose}>
            เสร็จ
          </button>
        </footer>
      </section>
    </div>
  );
}
