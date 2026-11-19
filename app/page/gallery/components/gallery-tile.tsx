"use client";

import React from "react";
import { Checkbox } from "antd";
import { AudioLines, Play } from "lucide-react";
import { SmartImage } from "@/app/page/project/[id]/components/shared/smart-media";
import type { OrgGalleryItem, PublicationStatus } from "@/app/common/org-gallery.type";

const TYPE_LABEL: Record<string, string> = {
  image: "ภาพ",
  video: "วิดีโอ",
  omnihuman: "OmniHuman",
  dreamactor: "DreamActor",
  audio: "เสียง",
};

type Tone = "success" | "warning" | "error" | "muted";
const STATUS_PILL: Record<PublicationStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "รอตรวจ", tone: "warning" },
  PUBLISHED: { label: "เผยแพร่แล้ว", tone: "success" },
  REJECTED: { label: "ไม่ผ่านการตรวจ", tone: "error" },
  REMOVED: { label: "ถอดแล้ว", tone: "muted" },
  FAILED: { label: "ส่งไม่สำเร็จ", tone: "error" },
};

export const formatDuration = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;

type Props = {
  item: OrgGalleryItem;
  selected: boolean;
  /** In select mode a tap selects instead of opening the preview (touch screens have no hover checkbox). */
  selectMode: boolean;
  onToggle: (item: OrgGalleryItem) => void;
  onOpen: (item: OrgGalleryItem) => void;
};

const GalleryTile: React.FC<Props> = ({ item, selected, selectMode, onToggle, onOpen }) => {
  const typeLabel = (item.type && TYPE_LABEL[item.type]) ?? "ผลงาน";
  const duration = item.type !== "image" ? item.durationSec : null;
  const pill = item.publication && STATUS_PILL[item.publication.status];
  const pillLabel =
    item.publication?.status === "PUBLISHED" && item.publication.visibility === "PRIVATE"
      ? "เผยแพร่แบบส่วนตัว"
      : pill?.label;
  const poster = item.thumbnailUrl ?? (item.type === "image" ? item.mediaUrl : null);

  const label = `${typeLabel} โดย ${item.creator.fullname}`;

  // Opening and selecting are separate controls, so neither is nested inside the other.
  return (
    <div className={`og-tile${selected ? " is-selected" : ""}`}>
      <button
        type="button"
        className="og-tile-open"
        aria-label={selectMode ? `เลือก ${label}` : `ดู ${label}`}
        aria-pressed={selectMode ? selected : undefined}
        onClick={() => (selectMode ? onToggle(item) : onOpen(item))}
        title={item.prompt ?? undefined}
      >
        {poster ? (
          <SmartImage
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            wrapperStyle={{ position: "absolute", inset: 0 }}
          />
        ) : (
          <span className="og-tile-placeholder">
            {item.type === "audio" ? <AudioLines size={32} /> : <Play size={32} />}
          </span>
        )}
      </button>

      <span className="og-tile-check">
        <Checkbox
          checked={selected}
          aria-label={`เลือก ${label}`}
          onChange={() => onToggle(item)}
        />
      </span>
      <span className="og-chip og-tile-type">
        {duration ? `${typeLabel} ${formatDuration(duration)}` : typeLabel}
      </span>
      {pill && <span className={`og-chip og-tile-status tone-${pill.tone}`}>{pillLabel}</span>}
      <span className="og-tile-creator">{item.creator.fullname}</span>
    </div>
  );
};

export default GalleryTile;
