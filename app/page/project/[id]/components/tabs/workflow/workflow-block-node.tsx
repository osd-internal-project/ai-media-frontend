"use client";

import React, { useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Button, Progress, Tag, Tooltip } from "antd";
import {
  GripVertical,
  X,
  Download,
  AlertTriangle,
  RotateCw,
  Plus,
  Maximize2,
  Play,
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
  progress?: number;
  selected: boolean;
  editing: boolean;
  parentRefs: ParentRef[];
  onConfigure: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onRetry: (blockId: string) => void;
  onAddChild: (blockId: string) => void;
  onToggleSelect: (blockId: string) => void;
  renderEditForm: (block: WorkflowBlock) => React.ReactNode;
  [key: string]: unknown;
}

/** สีของ status badge ตามสถานะ */
const STATUS_COLOR: Record<WorkflowBlockStatus, string> = {
  pending: "default",
  processing: "gold",
  success: "green",
  failed: "red",
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

/**
 * การ์ดบล็อกหนึ่งใบบนแคนวาส (กว้าง 280px) ตาม UI spec
 * แสดงผลตามสถานะ pending/processing/success/failed
 */
const WorkflowBlockNode: React.FC<NodeProps> = ({ data }) => {
  const d = data as WorkflowNodeData;
  const { block, progress = 0, selected, editing } = d;
  const isSuccess = block.status === "success";
  const isImage = block.type === "image";

  // สื่อที่กำลังเปิดดูแบบเต็มจอ (null = ปิด)
  const [preview, setPreview] = useState<PreviewMedia | null>(null);
  // result โหลดเสร็จหรือยัง (ใช้ทำ skeleton + fade-in); รีเซ็ตเมื่อ output เปลี่ยน
  const [resultLoaded, setResultLoaded] = useState(false);
  useEffect(() => setResultLoaded(false), [block.outputUrl]);

  return (
    <div
      className="workflow-node group"
      style={{
        // Auto-fit width to inner content, bounded so canvas nodes stay even.
        width: "fit-content",
        minWidth: 280,
        maxWidth: 460,
        // Height auto-fits children (no fixed height).
        borderRadius: 14,
        background: "var(--wf-card-bg, #21262B)",
        border: selected
          ? "2px solid var(--wf-primary, #6F6ADE)"
          : "1px solid var(--wf-border, #3A434F)",
        boxShadow: selected
          ? "0 6px 20px rgba(111,106,222,0.28)"
          : "0 4px 16px rgba(0,0,0,0.28)",
        color: "var(--wf-text, #F2F4F5)",
        overflow: "hidden",
        transition: "border-color .15s ease, box-shadow .15s ease",
      }}
    >
      {/* target handle (ซ้าย) กึ่งกลางแนวตั้ง เพื่อให้ลากเส้นเข้ามาได้สมูท */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: "var(--wf-border, #52525b)",
        }}
      />
      {/* 1. Header / drag handle */}
      <div
        className="workflow-node__header drag-handle"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid var(--wf-hairline, rgba(255,255,255,0.06))",
          cursor: "grab",
        }}
      >
        <GripVertical size={14} className="opacity-50" />
        {/* Combine รองรับเฉพาะบล็อกรูปภาพที่สำเร็จแล้ว */}
        <Tooltip
          title={
            isSuccess && !isImage
              ? "Combine รองรับเฉพาะบล็อกรูปภาพ"
              : undefined
          }
        >
          <Button
            size="small"
            disabled={!isSuccess || !isImage}
            type={selected ? "primary" : "default"}
            style={
              selected
                ? {
                    background: "var(--wf-primary, #6F6ADE)",
                    borderColor: "var(--wf-primary, #6F6ADE)",
                  }
                : undefined
            }
            onClick={() => d.onToggleSelect(block.id)}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </Tooltip>
        {/* <span style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.7 }}>
          {block.id.slice(0, 8)}
        </span> */}
        <Tag
          color={STATUS_COLOR[block.status]}
          style={{ marginInlineStart: "auto", marginInlineEnd: 0 }}
        >
          {block.status}
        </Tag>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#a1a1aa",
          }}
          onClick={() => d.onDelete(block.id)}
          aria-label="delete block"
        >
          <X size={14} color="var(--wf-text-dim, #a1a1aa)" />
        </button>
      </div>

      {/* 2. Preview area — minHeight 176px, grows to fit inner content */}
      <div
        style={{
          minHeight: 176,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: 10,
        }}
      >
        {editing ? (
          // Let the form expand the node; cap height so very long forms scroll.
          <div className="w-full" style={{ maxHeight: 480, overflowY: "auto" }}>
            {d.renderEditForm(block)}
          </div>
        ) : block.status === "pending" ? (
          <div
            className="w-full flex items-center justify-center"
            style={{
              minHeight: 156,
              border: "1px dashed rgba(255,255,255,0.2)",
              borderRadius: 8,
            }}
          >
            <Button size="small" onClick={() => d.onConfigure(block.id)}>
              Configure block
            </Button>
          </div>
        ) : block.status === "processing" ? (
          <div className="w-full text-center px-2">
            <Progress
              percent={Math.round(progress * 100)}
              size="small"
              status="active"
            />
            <div
              style={{
                fontSize: 12,
                color: "var(--wf-text-dim, #8C99A9)",
                marginTop: 6,
              }}
            >
              {Math.round(progress * 100)}% · generating {block.type}
            </div>
          </div>
        ) : block.status === "success" ? (
          <>
            {block.outputUrl ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: 176,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!resultLoaded && <MediaSkeleton rounded={8} />}
                {block.type === "video" ? (
                  <video
                    src={block.outputUrl}
                    controls
                    onLoadedData={() => setResultLoaded(true)}
                    style={{
                      maxHeight: 320,
                      maxWidth: "100%",
                      borderRadius: 8,
                      opacity: resultLoaded ? 1 : 0,
                      transition: "opacity 0.35s ease",
                    }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.outputUrl}
                    alt={block.prompt}
                    onLoad={() => setResultLoaded(true)}
                    style={{
                      maxHeight: 320,
                      maxWidth: "100%",
                      borderRadius: 8,
                      opacity: resultLoaded ? 1 : 0,
                      transition: "opacity 0.35s ease",
                    }}
                  />
                )}
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 176,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                }}
              />
            )}
            {block.outputUrl && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  display: "flex",
                  gap: 6,
                }}
              >
                <Tooltip title="ดูแบบเต็มจอ">
                  <button
                    onClick={() =>
                      setPreview({ url: block.outputUrl!, type: block.type })
                    }
                    aria-label="expand preview"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(4px)",
                      borderRadius: 8,
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <Maximize2 size={14} />
                  </button>
                </Tooltip>
                <Tooltip title="Download">
                  <a
                    href={block.outputUrl}
                    download
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(4px)",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  >
                    <Download size={14} />
                  </a>
                </Tooltip>
              </div>
            )}
            {typeof block.duration === "number" && (
              <span
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 16,
                  fontSize: 11,
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                {block.duration.toFixed(1)}s
              </span>
            )}
          </>
        ) : (
          // failed
          <div className="text-center px-2">
            <AlertTriangle size={20} color="#f87171" className="mx-auto" />
            <div style={{ fontSize: 12, color: "#fca5a5", margin: "6px 0" }}>
              {block.errorMessage || "Generation failed"}
            </div>
            <Button
              size="small"
              icon={<RotateCw size={12} />}
              onClick={() => d.onRetry(block.id)}
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* 3. Reference (input) thumbnails — รูป/วิดีโอ คลิกเพื่อดูเต็มจอ */}
      {d.parentRefs.length > 0 && (
        <div style={{ display: "flex", gap: 6, padding: "0 12px 8px", flexWrap: "wrap" }}>
          {d.parentRefs.map((ref, i) => {
            const base: React.CSSProperties = {
              position: "relative",
              width: 44,
              height: 44,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--wf-border, #3A434F)",
              flexShrink: 0,
            };
            if (!ref.url) {
              return (
                <div
                  key={i}
                  style={{
                    ...base,
                    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                  }}
                />
              );
            }
            return (
              <button
                key={i}
                title="ดู reference แบบเต็มจอ"
                onClick={() => setPreview({ url: ref.url, type: ref.type })}
                className="transition-transform duration-150 hover:scale-105"
                style={{ ...base, cursor: "pointer", padding: 0 }}
              >
                {ref.type === "video" ? (
                  <>
                    <SmartVideo src={ref.url} muted preload="metadata" />
                    {/* ป้าย play บอกว่าเป็นวิดีโอ */}
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.25)",
                        color: "#fff",
                      }}
                    >
                      <Play size={14} fill="#fff" />
                    </span>
                  </>
                ) : (
                  <SmartImage src={ref.url} alt={`reference ${i + 1}`} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Prompt excerpt (2 บรรทัด) */}
      <div
        style={{
          padding: "2px 12px",
          fontSize: 12,
          lineHeight: 1.45,
          color: "var(--wf-text, #F2F4F5)",
          opacity: 0.9,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {block.prompt || "—"}
      </div>

      {/* 5. Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          fontSize: 11,
          color: "var(--wf-text-dim, #8C99A9)",
        }}
      >
        {block.model && (
          <Tag style={{ margin: 0 }}>{block.model}</Tag>
        )}
        {block.resolution && <span>{block.resolution}</span>}
        <span style={{ marginInlineStart: "auto" }}>
          {timeAgo(block.createdAt)}
        </span>
      </div>

      {/* Green connector dot + ปุ่ม "+" สำหรับเพิ่มบล็อกลูก — แสดงเฉพาะบล็อกที่สำเร็จ */}
      {isSuccess && (
        <>
          {/* source handle: anchor เส้นที่กึ่งกลางแนวตั้งขอบขวา (อยู่ใต้ปุ่ม +) */}
          {/* source handle = anchor เส้น (โปร่งใส) กึ่งกลางขอบขวา ให้เส้นเริ่มตรงปุ่ม + */}
          <Handle
            type="source"
            position={Position.Right}
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
          {/* ปุ่ม "+" คลิกครั้งเดียวสร้างบล็อกลูก (เลือก/สลับชนิดในฟอร์ม)
              วงกลมสะอาด วางใจกลางตรงกับ handle เพื่อให้เส้นเริ่มจากปุ่มพอดี */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: -13,
              transform: "translateY(-50%)",
              zIndex: 10,
            }}
          >
            <button
              title="Add child"
              onClick={() => d.onAddChild(block.id)}
              className="flex items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--wf-success, #22C55E)",
                // ring สีพื้นการ์ด ตัดปุ่มออกจากเส้นอย่างสะอาด
                border: "2px solid var(--wf-card-bg, #21262B)",
                color: "#fff",
                cursor: "pointer",
                padding: 0,
                boxShadow: "0 2px 8px rgba(34,197,94,0.35)",
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}

      {/* Lightbox เต็มจอ (เรนเดอร์ผ่าน portal ไป body กัน transform ของแคนวาส) */}
      <WorkflowMediaPreview media={preview} onClose={() => setPreview(null)} />
    </div>
  );
};

export default WorkflowBlockNode;
