"use client";

import { useCallback } from "react";

export interface SocialShareItem {
  imageUrl: string;
  typeGenerate: "image" | "video" | "dreamactor" | "omnihumen" | "omnihuman" | string;
  prompt?: string;
}

export type SharePlatform = "facebook" | "tiktok" | "instagram";

/** Opens a popup share dialog (600×550) and returns immediately. */
function openPopup(url: string) {
  window.open(url, "_blank", "width=600,height=550,noopener,noreferrer");
}

/**
 * Fetches the media as a Blob so it can be offered for download or Web Share.
 * Returns null if the fetch fails.
 */
async function fetchBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

/** Triggers a browser download from a Blob. */
function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export function useSocialShare() {
  /**
   * Facebook — opens the Facebook share dialog with the media URL.
   * Facebook requires the URL to be publicly accessible for og:image preview.
   */
  const shareToFacebook = useCallback((item: SocialShareItem) => {
    const shareUrl = encodeURIComponent(item.imageUrl);
    openPopup(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
  }, []);

  /**
   * TikTok — TikTok does not support share-by-URL from external sites.
   * Strategy:
   *   1. Try Web Share API with the file (works on Android/iOS Chrome).
   *   2. Fall back: download the file + open TikTok upload page so the user can upload manually.
   */
  const shareToTikTok = useCallback(async (item: SocialShareItem) => {
    const isVideo =
      item.typeGenerate === "video" ||
      item.typeGenerate === "dreamactor" ||
      item.typeGenerate === "omnihumen" ||
      item.typeGenerate === "omnihuman";

    const ext = isVideo ? ".mp4" : ".jpg";
    const filename = `aicave-share${ext}`;
    const mimeType = isVideo ? "video/mp4" : "image/jpeg";

    // Attempt Web Share API (mobile-first)
    if (typeof navigator !== "undefined" && navigator.share) {
      const blob = await fetchBlob(item.imageUrl);
      if (blob) {
        const file = new File([blob], filename, { type: mimeType });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: item.prompt ?? "AI CAVE" });
          return;
        }
      }
    }

    // Desktop fallback: download file + open TikTok upload
    const blob = await fetchBlob(item.imageUrl);
    if (blob) downloadBlob(blob, filename);
    window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
  }, []);

  /**
   * Instagram — Instagram does not support share-by-URL from external sites.
   * Strategy:
   *   1. Try Web Share API with the file (works on Android/iOS Chrome/Safari).
   *   2. Fall back: download the file + open instagram.com/create/select.
   */
  const shareToInstagram = useCallback(async (item: SocialShareItem) => {
    const isVideo =
      item.typeGenerate === "video" ||
      item.typeGenerate === "dreamactor" ||
      item.typeGenerate === "omnihumen" ||
      item.typeGenerate === "omnihuman";

    const ext = isVideo ? ".mp4" : ".jpg";
    const filename = `aicave-share${ext}`;
    const mimeType = isVideo ? "video/mp4" : "image/jpeg";

    // Attempt Web Share API (mobile-first)
    if (typeof navigator !== "undefined" && navigator.share) {
      const blob = await fetchBlob(item.imageUrl);
      if (blob) {
        const file = new File([blob], filename, { type: mimeType });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: item.prompt ?? "AI CAVE" });
          return;
        }
      }
    }

    // Desktop fallback: download file + open Instagram create page
    const blob = await fetchBlob(item.imageUrl);
    if (blob) downloadBlob(blob, filename);
    window.open("https://www.instagram.com/create/select/", "_blank", "noopener,noreferrer");
  }, []);

  /** Copy the raw media URL to the clipboard. */
  const copyLink = useCallback(async (item: SocialShareItem): Promise<void> => {
    await navigator.clipboard.writeText(item.imageUrl);
  }, []);

  return { shareToFacebook, shareToTikTok, shareToInstagram, copyLink };
}
