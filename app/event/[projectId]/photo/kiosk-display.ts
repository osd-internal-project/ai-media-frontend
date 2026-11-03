"use client";

import { CSSProperties, RefObject, useCallback, useEffect, useState } from "react";

export interface ISize {
  width: number;
  height: number;
}

/** การตั้งค่าหน้าจอ kiosk ต่อเครื่อง — frame = null คือใช้เต็มจอจริง */
export interface IKioskDisplay {
  frame: ISize | null;
  scale: number;
  margin: number;
}

export const KIOSK_DISPLAY_DEFAULT: IKioskDisplay = { frame: null, scale: 1, margin: 0 };

export const KIOSK_DISPLAY_PRESETS: readonly { label: string; frame: ISize | null }[] = [
  { label: "เต็มจอ", frame: null },
  { label: "Kiosk", frame: { width: 1080, height: 1920 } },
  { label: "iPad", frame: { width: 820, height: 1180 } },
  { label: "TV", frame: { width: 1920, height: 1080 } },
  { label: "มือถือ", frame: { width: 390, height: 844 } },
];

export const KIOSK_WIDTH_RANGE = { min: 320, max: 2560, step: 10 } as const;
export const KIOSK_SCALE_RANGE = { min: 0.8, max: 1.5, step: 0.05 } as const;
export const KIOSK_MARGIN_RANGE = { min: 0, max: 80, step: 4 } as const;

const STORAGE_KEY = "kiosk-display:v1";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

function parseFrame(value: unknown): ISize | null {
  if (!value || typeof value !== "object") return null;
  const { width, height } = value as Record<string, unknown>;
  const w = toNumber(width, NaN);
  const h = toNumber(height, NaN);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { width: Math.round(w), height: Math.round(h) };
}

/** อ่านค่าจาก localStorage — ค่าเสีย/ไม่มี → ค่าเริ่มต้น */
export function parseKioskDisplay(raw: string | null): IKioskDisplay {
  if (!raw) return KIOSK_DISPLAY_DEFAULT;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return KIOSK_DISPLAY_DEFAULT;
    const record = data as Record<string, unknown>;
    return {
      frame: parseFrame(record.frame),
      scale: clamp(toNumber(record.scale, 1), KIOSK_SCALE_RANGE.min, KIOSK_SCALE_RANGE.max),
      margin: clamp(toNumber(record.margin, 0), KIOSK_MARGIN_RANGE.min, KIOSK_MARGIN_RANGE.max),
    };
  } catch (error) {
    console.warn("kiosk display settings unreadable, using defaults", error);
    return KIOSK_DISPLAY_DEFAULT;
  }
}

export interface IKioskLayout {
  /** ขนาดจอที่จำลอง (px) */
  screen: ISize;
  /** สัดส่วนที่ย่อลงเพื่อให้กรอบพอดีจอจริง (≤ 1) */
  fit: number;
  rootStyle: CSSProperties;
}

/** UI scale ทำงานแบบ browser zoom: layout เห็นจอเล็กลง scale เท่า แล้วขยายภาพกลับ */
export function computeKioskLayout(display: IKioskDisplay, viewport: ISize): IKioskLayout {
  const available = {
    width: Math.max(1, viewport.width - display.margin * 2),
    height: Math.max(1, viewport.height - display.margin * 2),
  };
  const screen = display.frame ?? available;
  const fit = Math.min(1, available.width / screen.width, available.height / screen.height);
  return {
    screen,
    fit,
    rootStyle: {
      width: screen.width / display.scale,
      height: screen.height / display.scale,
      transform: `translate(-50%, -50%) scale(${display.scale * fit})`,
    },
  };
}

export function useKioskDisplay(stageRef: RefObject<HTMLElement | null>) {
  const [display, setDisplay] = useState<IKioskDisplay>(KIOSK_DISPLAY_DEFAULT);
  const [viewport, setViewport] = useState<ISize | null>(null);

  useEffect(() => {
    setDisplay(parseKioskDisplay(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stageRef]);

  const updateDisplay = useCallback((next: IKioskDisplay) => {
    setDisplay(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("kiosk display settings not saved", error);
    }
  }, []);

  const layout = viewport ? computeKioskLayout(display, viewport) : null;
  return { display, updateDisplay, layout, viewport };
}
