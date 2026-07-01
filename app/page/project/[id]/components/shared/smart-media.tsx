"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * กล่อง skeleton แบบ shimmer วางทับเต็มพื้นที่ของ parent (parent ต้อง position:relative)
 * ใช้ระหว่างรอสื่อโหลด
 */
export const MediaSkeleton: React.FC<{ rounded?: number | string }> = ({
  rounded = "inherit",
}) => (
  <div
    className="skeleton-shimmer"
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: rounded,
      pointerEvents: "none",
    }}
  />
);

/** fallback เมื่อโหลดสื่อไม่สำเร็จ */
const MediaError: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(140,153,169,0.10)",
      color: "var(--wf-text-dim, #8C99A9)",
    }}
  >
    <ImageOff size={18} />
  </div>
);

type SmartImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** style ของกล่อง wrapper (เช่น aspectRatio, borderRadius) */
  wrapperStyle?: React.CSSProperties;
  /** className ของกล่อง wrapper */
  wrapperClassName?: string;
};

/**
 * รูปที่แสดง skeleton shimmer ระหว่างโหลด แล้ว fade-in ทั้งภาพเมื่อโหลดเสร็จ
 * (กัน progressive render ที่ "ค่อย ๆ เผยทีละนิด")
 * props อื่น ๆ ส่งผ่านไปยัง <img> ตามปกติ — โดยดีฟอลต์รูปจะ object-fit:cover เต็มกล่อง
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  wrapperStyle,
  wrapperClassName,
  style,
  onLoad,
  onError,
  ...imgProps
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={wrapperClassName}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        ...wrapperStyle,
      }}
    >
      {!loaded && !error && <MediaSkeleton />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imgProps}
        alt={imgProps.alt ?? ""}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setError(true);
          onError?.(e);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.35s ease",
          ...style,
        }}
      />
      {error && <MediaError />}
    </div>
  );
};

type SmartVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  wrapperStyle?: React.CSSProperties;
  wrapperClassName?: string;
};

/**
 * วิดีโอที่แสดง skeleton ระหว่างโหลด แล้ว fade-in เมื่อเฟรมแรกพร้อม (onLoadedData)
 * props อื่น ๆ (controls/autoPlay/muted/loop/poster ฯลฯ) ส่งผ่านไปยัง <video>
 */
export const SmartVideo: React.FC<SmartVideoProps> = ({
  wrapperStyle,
  wrapperClassName,
  style,
  onLoadedData,
  onError,
  ...videoProps
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={wrapperClassName}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        ...wrapperStyle,
      }}
    >
      {!loaded && !error && <MediaSkeleton />}
      <video
        {...videoProps}
        onLoadedData={(e) => {
          setLoaded(true);
          onLoadedData?.(e);
        }}
        onError={(e) => {
          setError(true);
          onError?.(e);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.35s ease",
          ...style,
        }}
      />
      {error && <MediaError />}
    </div>
  );
};
