"use client";

import React, { useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Button, Dropdown, Tooltip, type MenuProps } from "antd";
import {
  AlertTriangle,
  Check,
  Clock,
  Download,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  MoreHorizontal,
  Play,
  Plus,
  RotateCw,
  Settings2,
  Trash2,
  Video,
} from "lucide-react";
import type {
  WorkflowBlock,
  WorkflowBlockStatus,
  WorkflowBlockType,
} from "@/app/services/workflow.service";
import WorkflowMediaPreview, {
  type PreviewMedia,
} from "./workflow-media-preview";
import { MediaSkeleton, SmartImage, SmartVideo } from "../../shared/smart-media";

/** reference (input) หนึ่งรายการ = output ของ parent block */
export interface ParentRef {
  url: string;
  type: WorkflowBlockType;
}

/** ข้อมูล + callbacks ที่ canvas ส่งให้ node ผ่าน data ของ React Flow */
export interface WorkflowNodeData {
  block: WorkflowBlock;
  /** ชื่อ model ที่อ่านง่าย (จาก master model type) */
  modelName?: string;
  /** 0–1 จาก websocket; undefined = ไม่รู้ (เช่นหลัง refresh) */
  progress?: number;
  selected: boolean;
  editing: boolean;
  parentRefs: ParentRef[];
  onConfigure: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onRetry: (blockId: string) => void;
  onAddChild: (blockId: string, type: WorkflowBlockType) => void;
  onToggleSelect: (blockId: string) => void;
  renderEditForm: (block: WorkflowBlock) => React.ReactNode;
  [key: string]: unknown;
}

/** สี + ข้อความของ status pill */
const STATUS_META: Record<WorkflowBlockStatus, { label: string; color: string }> = {
  pending: { label: "Draft", color: "var(--wf-text-dim)" },
  processing: { label: "Generating", color: "var(--wf-warning)" },
  success: { label: "Done", color: "var(--wf-success)" },
  failed: { label: "Failed", color: "var(--wf-error)" },
};

/** เวลาผ่านมาแล้วแบบย่อ */
function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** เวลาที่ใช้ไปตั้งแต่เริ่มงาน เช่น "42s", "3m 05s" */
function elapsed(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

/** "16:9" → 16/9; ค่าที่อ่านไม่ได้ถือเป็น 1:1 */
function parseRatio(value: unknown): number {
  if (typeof value !== "string") return 1;
  const [w, h] = value.split(":").map(Number);
  return w > 0 && h > 0 ? w / h : 1;
}

/** ความกว้างการ์ดตามทิศของภาพ ให้แนวตั้งไม่สูงเกินและแนวนอนไม่เล็กเกิน */
function cardWidth(ratio: number): number {
  if (ratio > 1.2) return 360;
  if (ratio < 0.85) return 260;
  return 300;
}

/** re-render ทุกวินาทีระหว่างที่ active (ใช้กับเวลาที่ผ่านไป) */
function useTicker(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
}

/**
 * การ์ดบล็อกหนึ่งใบบนแคนวาส — media เต็มการ์ดตามสัดส่วนจริง, status pill,
 * toolbar ตอน hover และปุ่ม "+" สร้างบล็อกต่อจากผลลัพธ์
 */
const WorkflowBlockNode: React.FC<NodeProps> = ({ data }) => {
  const d = data as WorkflowNodeData;
  const { block, progress, selected, editing } = d;
  const isSuccess = block.status === "success";
  const isProcessing = block.status === "processing";
  const isImage = block.type === "image";
  const config = (block.generateConfig ?? {}) as Record<string, unknown>;
  const ratio = parseRatio(config.ratio);
  const status = STATUS_META[block.status];

  // สื่อที่กำลังเปิดดูแบบเต็มจอ (null = ปิด)
  const [preview, setPreview] = useState<PreviewMedia | null>(null);
  // result โหลดเสร็จหรือยัง (ใช้ทำ skeleton + fade-in); รีเซ็ตเมื่อ output เปลี่ยน
  const [resultLoaded, setResultLoaded] = useState(false);
  useEffect(() => setResultLoaded(false), [block.outputUrl]);
  useTicker(isProcessing && progress === undefined);

  const isLocal = block.id.startsWith("local-");
  const menuItems: MenuProps["items"] = [
    ...(!isLocal && (isSuccess || block.status === "failed")
      ? [{ key: "retry", label: "Run again", icon: <RotateCw size={14} /> }]
      : []),
    { key: "delete", label: "Delete", icon: <Trash2 size={14} />, danger: true },
  ];
  const onMenu: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    if (key === "retry") d.onRetry(block.id);
    if (key === "delete") d.onDelete(block.id);
  };

  // บล็อกรูปรับ parent วิดีโอไม่ได้ — ซ่อนตัวเลือก image เมื่อผลลัพธ์นี้เป็นวิดีโอ
  const addItems: MenuProps["items"] = [
    ...(isImage
      ? [{ key: "image", label: "Image from this", icon: <ImageIcon size={14} /> }]
      : []),
    { key: "video", label: "Video from this", icon: <Video size={14} /> },
  ];

  const mediaBox: React.CSSProperties = { aspectRatio: String(ratio) };

  const renderMedia = () => {
    if (block.status === "pending") {
      return (
        <div className="wf-media wf-media--pending" style={mediaBox}>
          <div className="wf-media__center">
            <Button
              size="small"
              icon={<Settings2 size={13} />}
              onClick={() => d.onConfigure(block.id)}
            >
              Configure
            </Button>
          </div>
        </div>
      );
    }

    if (isProcessing) {
      return (
        <div className="wf-media" style={mediaBox}>
          <MediaSkeleton />
          <div className="wf-media__center">
            <Loader2 size={20} className="animate-spin" />
            <span>
              Generating {block.type}
              {/* progress อยู่แค่ฝั่ง client — หลัง refresh ไม่รู้ค่า จึงแสดงเวลาที่ผ่านไปแทน 0% */}
              {progress === undefined
                ? ` · ${elapsed(block.createdAt)}`
                : ` · ${Math.round(progress * 100)}%`}
            </span>
          </div>
          {progress !== undefined && (
            <div className="wf-media__bar">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}
        </div>
      );
    }

    if (block.status === "failed") {
      return (
        <div className="wf-media wf-media--failed" style={mediaBox}>
          <div className="wf-media__center">
            <AlertTriangle size={20} color="var(--wf-error)" />
            <span
              style={{
                color: "var(--wf-text)",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {block.errorMessage || "Generation failed"}
            </span>
            <Button
              size="small"
              icon={<RotateCw size={12} />}
              onClick={() => d.onRetry(block.id)}
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    // success
    return (
      <div className="wf-media" style={mediaBox}>
        {block.outputUrl ? (
          <>
            {!resultLoaded && <MediaSkeleton />}
            {block.type === "video" ? (
              <video
                src={block.outputUrl}
                controls
                playsInline
                className="nodrag"
                onLoadedData={() => setResultLoaded(true)}
                style={{ opacity: resultLoaded ? 1 : 0, transition: "opacity .35s ease" }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.outputUrl}
                alt={block.prompt}
                onLoad={() => setResultLoaded(true)}
                style={{ opacity: resultLoaded ? 1 : 0, transition: "opacity .35s ease" }}
              />
            )}
            <div className="wf-media__toolbar nodrag">
              <Tooltip title="View full screen">
                <button
                  className="wf-icon-btn wf-icon-btn--overlay"
                  aria-label="expand preview"
                  onClick={() => setPreview({ url: block.outputUrl!, type: block.type })}
                >
                  <Maximize2 size={14} />
                </button>
              </Tooltip>
              <Tooltip title="Download">
                <a
                  className="wf-icon-btn wf-icon-btn--overlay"
                  href={block.outputUrl}
                  download
                  aria-label="download"
                >
                  <Download size={14} />
                </a>
              </Tooltip>
            </div>
          </>
        ) : (
          <div className="wf-media__center">
            <AlertTriangle size={18} />
            <span>Output not found</span>
          </div>
        )}
        {typeof block.duration === "number" && block.type === "image" && (
          <span className="wf-media__badge">
            <Clock size={11} />
            {block.duration.toFixed(1)}s
          </span>
        )}
        {/* Combine รองรับเฉพาะบล็อกรูปภาพที่สำเร็จแล้ว */}
        {isImage && (
          <Tooltip title={selected ? "Unselect" : "Select to combine"}>
            <button
              className={`wf-check nodrag ${selected ? "wf-check--on" : ""}`}
              aria-label="select for combine"
              onClick={() => d.onToggleSelect(block.id)}
            >
              {selected && <Check size={14} strokeWidth={3} />}
            </button>
          </Tooltip>
        )}
      </div>
    );
  };

  const metaChips = [
    typeof config.ratio === "string" ? config.ratio : null,
    block.resolution ? block.resolution.toUpperCase() : null,
    block.type === "video" && typeof config.duration === "number"
      ? `${config.duration}s`
      : null,
  ].filter((v): v is string => Boolean(v));

  return (
    <div
      className={[
        "wf-node",
        selected ? "wf-node--selected" : "",
        editing ? "wf-node--editing" : "",
      ].join(" ")}
      style={{ width: editing ? 380 : cardWidth(ratio) }}
    >
      {/* target handle (ซ้าย) กึ่งกลางแนวตั้ง */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: "var(--wf-card-bg)",
          border: "2px solid var(--wf-border)",
        }}
      />

      {/* header / drag handle */}
      <div className="wf-node__header drag-handle">
        <span className="wf-type-icon">
          {isImage ? <ImageIcon size={13} /> : <Video size={13} />}
        </span>
        <span className="wf-node__title" title={block.model || undefined}>
          {d.modelName || block.model || (isImage ? "Image" : "Video")}
        </span>
        <span
          className={`wf-status wf-status--${block.status}`}
          style={{ marginInlineStart: "auto", ["--wf-status" as string]: status.color }}
        >
          <span className="wf-status__dot" />
          {status.label}
        </span>
        <Dropdown menu={{ items: menuItems, onClick: onMenu }} trigger={["click"]}>
          <button className="wf-icon-btn nodrag" aria-label="block menu">
            <MoreHorizontal size={16} />
          </button>
        </Dropdown>
      </div>

      {editing ? (
        <div className="nodrag nowheel" style={{ maxHeight: 560, overflowY: "auto" }}>
          {d.renderEditForm(block)}
        </div>
      ) : (
        <>
          {renderMedia()}

          {/* prompt */}
          {block.prompt && (
            <div className="wf-node__prompt" title={block.prompt}>
              {block.prompt}
            </div>
          )}

          {/* inputs + meta */}
          <div className="wf-node__meta">
            {d.parentRefs.length > 0 && (
              <div className="wf-inputs" style={{ marginInlineEnd: 4 }}>
                {d.parentRefs.map((ref, i) =>
                  ref.url ? (
                    <Tooltip key={i} title="Input from previous block">
                      <button
                        className="wf-input-tile nodrag"
                        style={{ width: 28, height: 28, borderRadius: 7 }}
                        onClick={() => setPreview({ url: ref.url, type: ref.type })}
                      >
                        {ref.type === "video" ? (
                          <>
                            <SmartVideo src={ref.url} muted preload="metadata" />
                            <span className="wf-media__center" style={{ padding: 0, color: "#fff" }}>
                              <Play size={10} fill="#fff" />
                            </span>
                          </>
                        ) : (
                          <SmartImage src={ref.url} alt={`input ${i + 1}`} />
                        )}
                      </button>
                    </Tooltip>
                  ) : (
                    <span
                      key={i}
                      className="wf-input-tile"
                      style={{ width: 28, height: 28, borderRadius: 7 }}
                    />
                  ),
                )}
              </div>
            )}
            {metaChips.map((chip) => (
              <span key={chip} className="wf-chip">
                {chip}
              </span>
            ))}
            {block.type === "video" && typeof block.duration === "number" && (
              <Tooltip title="Generation time">
                <span className="wf-chip">
                  <Clock size={10} />
                  {block.duration.toFixed(0)}s
                </span>
              </Tooltip>
            )}
            <span style={{ marginInlineStart: "auto" }}>{timeAgo(block.createdAt)}</span>
          </div>
        </>
      )}

      {/* source handle ต้อง render เสมอ — ไม่งั้น React Flow ลากเส้นจากบล็อกที่ยังไม่ success ไม่ได้ (เส้นหาย) */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isSuccess}
        style={{
          right: -8,
          width: 16,
          height: 16,
          minWidth: 0,
          minHeight: 0,
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      />
      {/* ปุ่ม "+" สร้างบล็อกต่อจากผลลัพธ์ — แสดงเฉพาะบล็อกที่สำเร็จ */}
      {isSuccess && (
        <div
          className="nodrag"
          style={{
            position: "absolute",
            top: "50%",
            right: -14,
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        >
          <Dropdown
            trigger={["click"]}
            menu={{
              items: addItems,
              onClick: ({ key }) => d.onAddChild(block.id, key as WorkflowBlockType),
            }}
          >
            <Tooltip title="Create next block" placement="right">
              <button className="wf-add-btn" aria-label="add next block">
                <Plus size={15} strokeWidth={2.5} />
              </button>
            </Tooltip>
          </Dropdown>
        </div>
      )}

      {/* Lightbox เต็มจอ (เรนเดอร์ผ่าน portal ไป body กัน transform ของแคนวาส) */}
      <WorkflowMediaPreview media={preview} onClose={() => setPreview(null)} />
    </div>
  );
};

export default WorkflowBlockNode;
