"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import type { WorkflowBlockType } from "@/app/services/workflow.service";

/** สื่อที่จะแสดงใน lightbox (รูป/วิดีโอ) */
export interface PreviewMedia {
  url: string;
  type: WorkflowBlockType;
}

interface WorkflowMediaPreviewProps {
  media: PreviewMedia | null;
  onClose: () => void;
}

/**
 * Lightbox แสดง preview รูป/วิดีโอแบบเต็มจอ
 *
 * เรนเดอร์ผ่าน createPortal ไป document.body เพื่อหนีจาก CSS transform ของ
 * `.react-flow__viewport` (มิฉะนั้น position:fixed จะเพี้ยนตามการ zoom/pan แคนวาส)
 */
const WorkflowMediaPreview: React.FC<WorkflowMediaPreviewProps> = ({
  media,
  onClose,
}) => {
  const [loaded, setLoaded] = useState(false);

  // ปิดด้วยปุ่ม Escape + รีเซ็ตสถานะโหลดเมื่อเปลี่ยนสื่อ
  useEffect(() => {
    if (!media) return;
    setLoaded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [media, onClose]);

  if (!media || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        onClick={onClose}
        aria-label="close preview"
      >
        <X size={24} />
      </button>
      {/* spinner ระหว่างรอสื่อพร้อม */}
      {!loaded && (
        <Loader2 className="absolute animate-spin text-white/80" size={36} />
      )}
      {media.type === "video" ? (
        <video
          src={media.url}
          controls
          autoPlay
          onLoadedData={() => setLoaded(true)}
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt="Preview"
          onLoad={() => setLoaded(true)}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>,
    document.body,
  );
};

export default WorkflowMediaPreview;
