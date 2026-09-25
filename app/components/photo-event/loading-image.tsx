"use client";

import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import { ImageOff } from "lucide-react";

type TLoadState = "loading" | "loaded" | "error";

interface LoadingImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

/** ซ่อนรูปจนโหลดครบแล้วค่อย fade-in — ไม่ให้เห็นรูปค่อยๆ render ทีละส่วน; ต้องวางใน parent ที่ position: relative */
export default function LoadingImage({ src, alt, className, style }: LoadingImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<TLoadState>("loading");

  useEffect(() => {
    // รูปที่อยู่ใน cache อาจโหลดเสร็จก่อน onLoad ถูกผูก
    const img = imgRef.current;
    setState(img?.complete && img.naturalWidth > 0 ? "loaded" : "loading");
  }, [src]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        style={{
          ...style,
          opacity: state === "loaded" ? 1 : 0,
          transition: "opacity 240ms ease",
        }}
      />
      {state !== "loaded" && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "rgba(255, 255, 255, 0.06)",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          {state === "loading" ? (
            <Spin />
          ) : (
            <>
              <ImageOff size={24} />
              Image unavailable
            </>
          )}
        </div>
      )}
    </>
  );
}
