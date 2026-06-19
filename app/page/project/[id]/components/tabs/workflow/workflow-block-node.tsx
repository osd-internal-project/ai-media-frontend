"use client";

import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Button, Dropdown, Progress, Tag, Tooltip } from "antd";
import {
  GripVertical,
  X,
  Download,
  AlertTriangle,
  RotateCw,
  Plus,
} from "lucide-react";
import type {
  WorkflowBlock,
  WorkflowBlockStatus,
  WorkflowBlockType,
} from "@/app/services/workflow.service";

/** ข้อมูล + callbacks ที่ canvas ส่งให้ node ผ่าน data ของ React Flow */
export interface WorkflowNodeData {
  block: WorkflowBlock;
  progress?: number;
  selected: boolean;
  editing: boolean;
  parentThumbs: string[];
  onConfigure: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onRetry: (blockId: string) => void;
  onAddChild: (blockId: string, childType: WorkflowBlockType) => void;
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

  // เมนูเลือกชนิดบล็อกลูกตอนกด "+" — output วิดีโอใส่ได้เฉพาะบล็อกชนิดวิดีโอ
  // (รูปใส่ได้ทั้ง image และ video)
  const childTypeItems =
    block.type === "video"
      ? [{ key: "video", label: "Video block" }]
      : [
          { key: "image", label: "Image block" },
          { key: "video", label: "Video block" },
        ];

  return (
    <div
      className="workflow-node group"
      style={{
        // Auto-fit width to inner content, bounded so canvas nodes stay even.
        width: "fit-content",
        minWidth: 280,
        maxWidth: 460,
        // Height auto-fits children (no fixed height).
        borderRadius: 12,
        background: "var(--wf-card-bg, #18181b)",
        border: selected
          ? "2px solid #8b5cf6"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        color: "#e4e4e7",
        overflow: "hidden",
      }}
    >
      {/* target handle (ซ้าย) เพื่อให้ลากเส้นเข้ามาได้ */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ top: 92, width: 10, height: 10, background: "#52525b" }}
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
          cursor: "grab",
        }}
      >
        <GripVertical size={14} className="opacity-60" />
        <Button
          size="small"
          disabled={!isSuccess}
          type={selected ? "primary" : "default"}
          style={
            selected
              ? { background: "#8b5cf6", borderColor: "#8b5cf6" }
              : undefined
          }
          onClick={() => d.onToggleSelect(block.id)}
        >
          {selected ? (
            "Selected"
          ) : (
              "Select"
          )}
        </Button>
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
          <X size={14} />
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
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              {Math.round(progress * 100)}% · generating {block.type}
            </div>
          </div>
        ) : block.status === "success" ? (
          <>
            {block.outputUrl ? (
              block.type === "video" ? (
                <video
                  src={block.outputUrl}
                  controls
                  style={{ maxHeight: 320, maxWidth: "100%", borderRadius: 8 }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.outputUrl}
                  alt={block.prompt}
                  style={{ maxHeight: 320, maxWidth: "100%", borderRadius: 8 }}
                />
              )
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
              <Tooltip title="Download">
                <a
                  href={block.outputUrl}
                  download
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: 6,
                    padding: 4,
                    color: "#fff",
                  }}
                >
                  <Download size={14} />
                </a>
              </Tooltip>
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

      {/* 3. Input thumbnails strip */}
      {block.parentBlockIds.length > 0 && (
        <div style={{ display: "flex", gap: 4, padding: "0 10px 6px" }}>
          {d.parentThumbs.map((thumb, i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: thumb
                  ? `center/cover url(${thumb})`
                  : "linear-gradient(135deg,#7c3aed,#2563eb)",
              }}
            />
          ))}
        </div>
      )}

      {/* 4. Prompt excerpt (2 บรรทัด) */}
      <div
        style={{
          padding: "0 10px",
          fontSize: 12,
          opacity: 0.85,
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
          gap: 6,
          padding: "6px 10px",
          fontSize: 11,
          opacity: 0.7,
        }}
      >
        <Tag style={{ margin: 0 }}>{block.model}</Tag>
        <span>{block.resolution}</span>
        <span style={{ marginInlineStart: "auto" }}>
          {timeAgo(block.createdAt)}
        </span>
      </div>

      {/* Green connector dot + ปุ่ม "+" สำหรับเพิ่มบล็อกลูก — แสดงเฉพาะบล็อกที่สำเร็จ */}
      {isSuccess && (
        <>
          {/* source handle ไว้ให้เส้นเชื่อม anchor (อยู่ใต้ปุ่ม +) */}
          <Handle
            type="source"
            position={Position.Right}
            style={{
              top: 92,
              right: -8,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #052e16",
            }}
          />
          {/* ปุ่ม "+" ที่จุดเชื่อม → เลือกชนิดบล็อกลูกก่อนสร้าง */}
          <Dropdown
            trigger={["click"]}
            menu={{
              items: childTypeItems,
              onClick: ({ key }) =>
                d.onAddChild(block.id, key as WorkflowBlockType),
            }}
          >
            <button
              title="Add child"
              style={{
                position: "absolute",
                top: 88,
                right: -12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid #052e16",
                color: "#052e16",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                zIndex: 10,
              }}
            >
              <Plus size={14} />
            </button>
          </Dropdown>
        </>
      )}
    </div>
  );
};

export default WorkflowBlockNode;
