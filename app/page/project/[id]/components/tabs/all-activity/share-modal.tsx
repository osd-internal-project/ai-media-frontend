"use client";

import { Divider, Modal, notification, Tooltip } from "antd";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSocialShare } from "./useSocialShare";
import type { SharePlatform, SocialShareItem } from "./useSocialShare";

interface ShareModalProps {
  open: boolean;
  item: SocialShareItem | null;
  onClose: () => void;
}

/* ─── Platform config ──────────────────────────────────────────── */

const PLATFORMS: {
  key: SharePlatform;
  label: string;
  subtitle: string;
  iconBg: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "facebook",
    label: "Facebook",
    subtitle: "Share to your timeline",
    iconBg: "#1877F2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    subtitle: "Download & post a video",
    iconBg: "#010101",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {/* TikTok "d" note icon */}
        <path
          d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.138-.966 6.108 6.108 0 0 1-1.495-3.338H16.24s.004 0 .004-.004H12.44v12.71c0 .2 0 .397-.008.592a3.268 3.268 0 0 1-.014.164c0 .007 0 .014-.002.02v.005a3.198 3.198 0 0 1-3.195 2.963 3.198 3.198 0 0 1-3.197-3.197 3.198 3.198 0 0 1 3.197-3.197c.31 0 .61.044.892.126l.004-3.861a6.998 6.998 0 0 0-.897-.058 7.002 7.002 0 0 0-7.002 7.001A7.002 7.002 0 0 0 9.22 21.5a7.002 7.002 0 0 0 7.001-7.001V9.36a9.926 9.926 0 0 0 5.82 1.87V7.44a6.168 6.168 0 0 1-2.72-1.878z"
          fill="white"
        />
        <path
          d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258A6.228 6.228 0 0 1 16.24 1h-.004"
          fill="#EE1D52"
          opacity="0.5"
        />
        <path
          d="M16.24 1h-.004s.004 0 .004.004V1zm3.077 4.562a6.168 6.168 0 0 0 2.72 1.878V3.628A6.228 6.228 0 0 1 19.32 5.562z"
          fill="#69C9D0"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    subtitle: "Download & share a photo or reel",
    iconBg: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

/* ─── Component ────────────────────────────────────────────────── */

export default function ShareModal({ open, item, onClose }: ShareModalProps) {
  const [api, contextHolder] = notification.useNotification();
  const [loadingPlatform, setLoadingPlatform] = useState<SharePlatform | null>(null);
  const [copyLoading, setCopyLoading] = useState(false);

  const { shareToFacebook, shareToTikTok, shareToInstagram, copyLink } = useSocialShare();

  const handlers: Record<SharePlatform, (i: SocialShareItem) => void | Promise<void>> = {
    facebook: shareToFacebook,
    tiktok: shareToTikTok,
    instagram: shareToInstagram,
  };

  const handlePlatform = async (platform: SharePlatform) => {
    if (!item || loadingPlatform) return;
    setLoadingPlatform(platform);
    try {
      await handlers[platform](item);
      if (platform !== "facebook") {
        api.success({
          message: "File downloaded",
          description: `Open ${platform === "tiktok" ? "TikTok" : "Instagram"} to complete your post.`,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      api.error({ message: "Share failed", description: msg });
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleCopy = async () => {
    if (!item) return;
    setCopyLoading(true);
    try {
      await copyLink(item);
      api.success({ message: "Link copied to clipboard" });
    } catch {
      api.error({ message: "Failed to copy link" });
    } finally {
      setCopyLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={400}
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>Share to Social Media</span>
        }
        styles={{
          content: { padding: "20px 24px 24px" },
          header: { marginBottom: 16 },
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PLATFORMS.map((p) => {
            const isLoading = loadingPlatform === p.key;
            const isDisabled = !!loadingPlatform && !isLoading;

            return (
              <button
                key={p.key}
                onClick={() => handlePlatform(p.key)}
                disabled={isDisabled}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #3A434F",
                  background: isDisabled ? "rgba(255,255,255,0.03)" : "#2A3038",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.5 : 1,
                  transition: "background 0.15s, opacity 0.15s",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#3A434F";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#2A3038";
                  }
                }}
              >
                {/* Platform icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: p.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={20} color="white" className="animate-spin" />
                  ) : (
                    p.icon
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#F2F4F5", fontWeight: 600, fontSize: 14 }}>
                    {p.label}
                  </div>
                  <div style={{ color: "#8C99A9", fontSize: 12, marginTop: 2 }}>
                    {p.subtitle}
                  </div>
                </div>

                {/* Arrow */}
                {!isLoading && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="#3A434F"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}

          <Divider style={{ margin: "6px 0" }} />

          {/* Copy link */}
          <Tooltip title={item?.imageUrl ?? ""} placement="top">
            <button
              onClick={handleCopy}
              disabled={copyLoading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #3A434F",
                background: "transparent",
                cursor: copyLoading ? "not-allowed" : "pointer",
                color: "#8C99A9",
                fontSize: 14,
                fontWeight: 500,
                width: "100%",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#2A3038";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {copyLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Copy size={15} />
              )}
              Copy Link
            </button>
          </Tooltip>
        </div>
      </Modal>
    </>
  );
}
