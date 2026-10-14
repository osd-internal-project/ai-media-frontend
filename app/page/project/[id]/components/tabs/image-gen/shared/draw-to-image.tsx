"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button, Flex, Modal, Slider, Tooltip } from "antd";
import { Check, Eraser, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { UploadFile } from "antd";
import type { RcFile, UploadChangeParam } from "antd/es/upload";

const CANVAS_W = 512;
const CANVAS_H = 512;
const MAX_HISTORY = 50;

type DrawTool = "pen" | "eraser";

interface Props {
  files: UploadFile[];
  handleUploadChange: (info: UploadChangeParam) => void;
  semantic: Record<string, unknown>;
  disabled?: boolean;
}

export default function DrawToImage({
  files,
  handleUploadChange,
  semantic,
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  // --- canvas helpers ---

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  /** Fill canvas white and reset history. */
  const initCanvas = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    historyRef.current = [ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)];
  }, []);

  /** Push current pixel state onto the undo stack before each stroke. */
  const pushHistory = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const next = [...historyRef.current, snap];
    historyRef.current = next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
  }, []);

  /** Convert mouse/touch event coordinates to canvas pixel coordinates. */
  const getCanvasPos = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      if ("touches" in e) {
        const t = e.touches[0];
        return {
          x: (t.clientX - rect.left) * scaleX,
          y: (t.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  /** Apply current tool style to context. */
  const applyStyle = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
      if (tool === "eraser") {
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = brushSize * 4;
      } else {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = brushSize;
      }
    },
    [tool, color, brushSize],
  );

  // --- event handlers ---

  const onPointerDown = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      e.preventDefault();
      pushHistory();
      isDrawingRef.current = true;
      const pos = getCanvasPos(e);
      lastPosRef.current = pos;

      // Draw an initial dot so a single click leaves a mark.
      const ctx = getCtx();
      if (!ctx) return;
      applyStyle(ctx);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [pushHistory, getCanvasPos, applyStyle],
  );

  const onPointerMove = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      e.preventDefault();
      if (!isDrawingRef.current || !lastPosRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      const pos = getCanvasPos(e);
      applyStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPosRef.current = pos;
    },
    [getCanvasPos, applyStyle],
  );

  const onPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  // --- action handlers ---

  const handleUndo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || historyRef.current.length <= 1) return;
    historyRef.current.pop();
    ctx.putImageData(
      historyRef.current[historyRef.current.length - 1],
      0,
      0,
    );
  }, []);

  const handleClear = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    pushHistory();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, [pushHistory]);

  /** Export canvas as PNG, create a synthetic UploadFile, and call handleUploadChange. */
  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const uid = `sketch-${Date.now()}`;
      const rcFile = Object.assign(
        new File([blob], `sketch-${uid}.png`, { type: "image/png" }),
        { uid },
      ) as RcFile;
      const uploadFile: UploadFile = {
        uid,
        name: rcFile.name,
        status: "uploading",
        originFileObj: rcFile,
        type: "image/png",
      };
      handleUploadChange({ file: uploadFile, fileList: [...files, uploadFile] });
      setIsOpen(false);
    }, "image/png");
  }, [files, handleUploadChange]);

  // Init canvas whenever modal opens (canvas remounts due to destroyOnClose).
  useEffect(() => {
    if (isOpen) {
      // Allow one render cycle for the canvas element to mount.
      const id = setTimeout(initCanvas, 50);
      return () => clearTimeout(id);
    }
  }, [isOpen, initCanvas]);

  // --- styles ---

  const toolBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 8,
    cursor: "pointer",
    border: active
      ? `2px solid ${semantic.colorPrimary as string}`
      : `1px solid ${semantic.colorBorder as string}`,
    background: active
      ? `${semantic.colorPrimary as string}22`
      : (semantic.colorBgElevated as string),
    color: active
      ? (semantic.colorPrimary as string)
      : (semantic.colorTextSecondary as string),
    transition: "all 0.15s",
  });

  const triggerStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: 8,
    border: `2px dashed ${semantic.colorBorder as string}`,
    background: semantic.colorBgBase as string,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "border-color 0.2s, opacity 0.2s",
    flexShrink: 0,
  };

  return (
    <>
      <Tooltip title="Draw to image" placement="top">
        <Flex
          align="center"
          justify="center"
          style={triggerStyle}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <Pencil size={18} color={semantic.colorTextSecondary as string} />
        </Flex>
      </Tooltip>

      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        title="Draw to Image"
        width={580}
        destroyOnClose
        footer={
          <Flex justify="space-between" align="center">
            <Flex gap={8}>
              <Tooltip title="Undo (last stroke)">
                <Button
                  icon={<RotateCcw size={14} />}
                  onClick={handleUndo}
                />
              </Tooltip>
              <Button
                danger
                icon={<Trash2 size={14} />}
                onClick={handleClear}
              >
                Clear
              </Button>
            </Flex>
            <Flex gap={8}>
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                icon={<Check size={14} />}
                onClick={handleSubmit}
              >
                Add as Reference
              </Button>
            </Flex>
          </Flex>
        }
      >
        {/* Toolbar */}
        <Flex gap={12} align="center" style={{ marginBottom: 12 }}>
          {/* Tool buttons */}
          <Flex gap={6} align="center">
            <Tooltip title="Pen">
              <button
                style={toolBtnStyle(tool === "pen")}
                onClick={() => setTool("pen")}
              >
                <Pencil size={16} />
              </button>
            </Tooltip>
            <Tooltip title="Eraser">
              <button
                style={toolBtnStyle(tool === "eraser")}
                onClick={() => setTool("eraser")}
              >
                <Eraser size={16} />
              </button>
            </Tooltip>
          </Flex>

          {/* Color picker — hidden when eraser is active */}
          {tool === "pen" && (
            <Tooltip title="Pen color">
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: `2px solid ${semantic.colorBorder as string}`,
                    backgroundColor: color,
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </label>
            </Tooltip>
          )}

          {/* Brush size slider */}
          <Flex align="center" gap={8} style={{ flex: 1 }}>
            <span
              style={{
                fontSize: 12,
                color: semantic.colorTextSecondary as string,
                whiteSpace: "nowrap",
              }}
            >
              Size: {brushSize}
            </span>
            <Slider
              min={1}
              max={40}
              value={brushSize}
              onChange={(v) => setBrushSize(v)}
              style={{ flex: 1, minWidth: 80 }}
            />
          </Flex>
        </Flex>

        {/* Canvas area */}
        <div
          style={{
            border: `1px solid ${semantic.colorBorder as string}`,
            borderRadius: 8,
            overflow: "hidden",
            background: "#ffffff",
            lineHeight: 0,
            cursor: tool === "eraser" ? "cell" : "crosshair",
            userSelect: "none",
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ display: "block", width: "100%", touchAction: "none" }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          />
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: semantic.colorTextSecondary as string,
            textAlign: "center",
          }}
        >
          {tool === "pen"
            ? "Draw with pen · Switch to eraser to correct mistakes"
            : "Eraser active · Switch to pen to draw"}
        </div>
      </Modal>
    </>
  );
}
