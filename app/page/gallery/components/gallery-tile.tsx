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
  onToggle: (item: OrgGalleryItem) => void;
};

const GalleryTile: React.FC<Props> = ({ item, selected, onToggle }) => {
  const typeLabel = (item.type && TYPE_LABEL[item.type]) ?? "ผลงาน";
  const duration = item.type !== "image" ? item.durationSec : null;
  const pill = item.publication && STATUS_PILL[item.publication.status];
  const pillLabel =
    item.publication?.status === "PUBLISHED" && item.publication.visibility === "PRIVATE"
      ? "เผยแพร่แบบส่วนตัว"
      : pill?.label;
  const poster = item.thumbnailUrl ?? (item.type === "image" ? item.mediaUrl : null);

  const toggle = () => onToggle(item);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      aria-label={`${typeLabel} โดย ${item.creator.fullname}`}
      tabIndex={0}
      className={`og-tile${selected ? " is-selected" : ""}`}
      onClick={toggle}
      onKeyDown={onKeyDown}
      title={item.prompt ?? undefined}
    >
      {poster ? (
        <SmartImage src={poster} alt="" draggable={false} wrapperStyle={{ position: "absolute", inset: 0 }} />
      ) : (
        <div className="og-tile-placeholder">
          {item.type === "audio" ? <AudioLines size={32} /> : <Play size={32} />}
        </div>
      )}

      <span className="og-tile-check">
        <Checkbox checked={selected} tabIndex={-1} />
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
