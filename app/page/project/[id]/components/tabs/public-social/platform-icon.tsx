"use client";

import React from "react";
import type { SocialPlatform } from "@/app/common/activity-share.type";

/** สีแบรนด์ของแต่ละ platform — ใช้เป็นพื้นหลังของไอคอน */
export const PLATFORM_BRAND_COLORS: Readonly<Record<SocialPlatform, string>> = {
  FACEBOOK: "#1877F2",
  INSTAGRAM: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)",
  TIKTOK: "#010101",
  YOUTUBE: "#FF0000",
};

const ICON_PATHS: Readonly<Record<SocialPlatform, React.ReactNode>> = {
  FACEBOOK: (
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  ),
  INSTAGRAM: (
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  ),
  TIKTOK: (
    <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.138-.966 6.108 6.108 0 0 1-1.495-3.338h.001V1h-3.8v12.71c0 .2 0 .397-.008.592a3.268 3.268 0 0 1-.014.164v.025a3.198 3.198 0 0 1-3.195 2.963 3.198 3.198 0 0 1-3.197-3.197 3.198 3.198 0 0 1 3.197-3.197c.31 0 .61.044.892.126l.004-3.861a6.998 6.998 0 0 0-.897-.058 7.002 7.002 0 0 0-7.002 7.001A7.002 7.002 0 0 0 9.22 21.5a7.002 7.002 0 0 0 7.001-7.001V9.36a9.926 9.926 0 0 0 5.82 1.87V7.44a6.168 6.168 0 0 1-2.72-1.878z" />
  ),
  YOUTUBE: (
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  ),
};

interface PlatformIconProps {
  platform: SocialPlatform;
  /** ขนาดกล่องไอคอน (px) */
  size?: number;
  /** true = แสดงเฉพาะ glyph ไม่มีพื้นหลังสีแบรนด์ */
  bare?: boolean;
}

/**
 * ไอคอนแบรนด์ของ social platform
 *
 * ใช้ inline SVG แทน icon library เพราะโลโก้แบรนด์ไม่มีใน @ant-design/icons
 * และ lucide-react เลิก ship โลโก้แบรนด์แล้ว
 *
 * @param platform platform ที่จะแสดง
 * @param size ขนาดกล่อง (default 32)
 * @param bare ซ่อนพื้นหลังสีแบรนด์
 */
const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  size = 32,
  bare = false,
}) => {
  const glyph = (
    <svg
      width={bare ? size : Math.round(size * 0.62)}
      height={bare ? size : Math.round(size * 0.62)}
      viewBox="0 0 24 24"
      fill={bare ? "currentColor" : "white"}
      aria-hidden="true"
    >
      {ICON_PATHS[platform]}
    </svg>
  );

  if (bare) return glyph;

  return (
    <span
      role="img"
      aria-label={platform}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 8,
        background: PLATFORM_BRAND_COLORS[platform],
        flexShrink: 0,
      }}
    >
      {glyph}
    </span>
  );
};

export default PlatformIcon;
