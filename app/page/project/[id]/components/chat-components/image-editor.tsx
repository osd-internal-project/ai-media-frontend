"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import * as fabric from "fabric";
import { Button, Select, Tooltip, Divider } from "antd";
import {
  Type,
  Download,
  Trash2,
  MousePointer2,
  Bold,
  Italic,
  Undo2,
  RotateCcw,
  Crop,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";

const FONTS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Sarabun",
  "Kanit",
  "Prompt",
  "Inter",
  "Roboto",
  "Nunito",
  "Oswald",
];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];

const FILTERS = [
  { value: "none", label: "Normal" },
  { value: "grayscale", label: "Grayscale" },
  { value: "sepia", label: "Sepia" },
  { value: "invert", label: "Invert" },
];

// Theme colors constants for consistency where tailwind might not reach easily
const BORDER_COLOR = "#3C444D";

interface Props {
  imageUrl: string | Blob | any;
}
type Tool = "select" | "text" | "crop";

const Btn = ({
  active,
  onClick,
  icon,
  label,
  danger,
  color,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  color?: string;
}) => (
  <Tooltip title={label}>
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-9 h-9 rounded-md border-none cursor-pointer transition-all duration-150 relative overflow-hidden
        ${active 
          ? "bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white" 
          : danger 
            ? "bg-red-500/15 text-red-500 hover:bg-red-500/25" 
            : "bg-white/5 text-slate-300 hover:bg-white/10"
        }
      `}
      style={color ? { backgroundColor: color } : {}}
    >
      {icon}
    </button>
  </Tooltip>
);

const ImageEditor = ({ imageUrl }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fc = useRef<fabric.Canvas | null>(null);
  const cropRef = useRef<fabric.Rect | null>(null);
  const historyRef = useRef<string[]>([]);
  const initialRef = useRef<string>("");
  const zoomScale = useRef<number>(1);

  const [tool, setTool] = useState<Tool>("select");
  const [isReady, setIsReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [sel, setSel] = useState<fabric.Object | null>(null);
  const [activeFilter, setActiveFilter] = useState("none");

  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [internalUrl, setInternalUrl] = useState<string>("");

  useEffect(() => {
    if (typeof imageUrl === "string") {
      setInternalUrl(imageUrl);
    } else if (imageUrl instanceof Blob) {
      const url = URL.createObjectURL(imageUrl);
      setInternalUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageUrl]);

  const saveHistory = useCallback(() => {
    if (!fc.current) return;
    const snap = JSON.stringify(fc.current.toJSON());
    historyRef.current = [...historyRef.current, snap];
    setCanUndo(historyRef.current.length > 1);
  }, []);

  useLayoutEffect(() => {
    if (!canvasRef.current || !internalUrl) return;
    let alive = true;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 100,
      height: 100,
      selection: true,
      preserveObjectStacking: true,
    });
    fc.current = canvas;

    canvas.on("selection:created", (e) => setSel(e.selected?.[0] ?? null));
    canvas.on("selection:updated", (e) => setSel(e.selected?.[0] ?? null));
    canvas.on("selection:cleared", () => setSel(null));

    const imgEl = new Image();
    const isBlob = internalUrl.startsWith("blob:");
    if (!isBlob) imgEl.crossOrigin = "anonymous";

    imgEl.onload = () => {
      if (!alive) return;
      const natW = imgEl.naturalWidth || 800;
      const natH = imgEl.naturalHeight || 600;

      const containerW =
        (areaRef.current?.clientWidth || window.innerWidth - 80) * 0.95;
      const maxH = window.innerHeight * 0.7;

      const scaleX = containerW / natW;
      const scaleY = maxH / natH;
      const scale = Math.min(scaleX, scaleY, 1);
      zoomScale.current = scale;

      const displayW = Math.round(natW * scale);
      const displayH = Math.round(natH * scale);

      canvas.setDimensions({ width: displayW, height: displayH });

      const imgObj = new fabric.Image(imgEl, {
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        hoverCursor: "default",
      });

      canvas.add(imgObj);
      canvas.sendObjectToBack(imgObj);
      canvas.renderAll();

      const snap = JSON.stringify(canvas.toJSON());
      initialRef.current = snap;
      historyRef.current = [snap];
      setCanUndo(false);
      setIsReady(true);
      setActiveFilter("none");
    };
    imgEl.onerror = (err) => {
      console.error("Error loading image natively:", err);
      setIsReady(true);
    };
    imgEl.src = internalUrl;

    return () => {
      alive = false;
      canvas.dispose();
    };
  }, [internalUrl]);

  useEffect(() => {
    const canvas = fc.current;
    if (!canvas) return;
    const h = () => saveHistory();
    canvas.on("object:added", h);
    canvas.on("object:modified", h);
    canvas.on("object:removed", h);
    return () => {
      canvas.off("object:added", h);
      canvas.off("object:modified", h);
      canvas.off("object:removed", h);
    };
  }, [saveHistory]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key === "z") rollback();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    if (sel?.type === "i-text") {
      const t = sel as fabric.IText;
      if (typeof t.fill === "string") setTextColor(t.fill);
      if (t.fontSize) setFontSize(t.fontSize);
      if (t.fontFamily) setFontFamily(t.fontFamily);
      setIsBold(t.fontWeight === "bold");
      setIsItalic(t.fontStyle === "italic");
    }
  }, [sel]);

  const applyText = useCallback((props: Record<string, unknown>) => {
    const active = fc.current?.getActiveObject();
    if (active?.type === "i-text") {
      active.set(props as any);
      fc.current!.renderAll();
    }
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active !== cropRef.current) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
      setSel(null);
    }
  }, []);

  const rollback = useCallback(() => {
    const canvas = fc.current;
    if (!canvas || historyRef.current.length < 2) return;
    historyRef.current = historyRef.current.slice(0, -1);
    const prev = historyRef.current[historyRef.current.length - 1];
    canvas.loadFromJSON(prev).then(() => {
      // Re-apply correct scaling to background
      const bg = canvas.getObjects().find((o) => o.type === "image");
      if (bg) {
        bg.set({ selectable: false, evented: false });
      }
      canvas.renderAll();
    });
    setCanUndo(historyRef.current.length > 1);
  }, []);

  const reset = useCallback(() => {
    const canvas = fc.current;
    if (!canvas || !initialRef.current) return;
    canvas.loadFromJSON(initialRef.current).then(() => {
      const imgEl = new Image();
      const isBlob = internalUrl.startsWith("blob:");
      if (!isBlob) imgEl.crossOrigin = "anonymous";

      imgEl.onload = () => {
        const scale = zoomScale.current;
        const imgObj = new fabric.Image(imgEl, {
          left: 0,
          top: 0,
          originX: "left",
          originY: "top",
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });

        canvas.getObjects().forEach((o) => canvas.remove(o));
        canvas.add(imgObj);
        canvas.sendObjectToBack(imgObj);

        canvas.discardActiveObject();
        canvas.renderAll();

        historyRef.current = [initialRef.current];
        setCanUndo(false);
        setSel(null);
        setTool("select");
        setActiveFilter("none");
      };
      imgEl.src = internalUrl;
    });
  }, [internalUrl]);

  // ── Filters ──────────────────────────────────────────────────
  const applyFilter = useCallback(
    (filter: string) => {
      const canvas = fc.current;
      if (!canvas) return;
      const bg = canvas
        .getObjects()
        .find((o) => o.type === "image") as fabric.Image;
      if (!bg) return;

      bg.filters = [];
      if (filter === "grayscale")
        bg.filters.push(new fabric.filters.Grayscale());
      if (filter === "sepia") bg.filters.push(new fabric.filters.Sepia());
      if (filter === "invert") bg.filters.push(new fabric.filters.Invert());

      bg.applyFilters();
      canvas.renderAll();
      setActiveFilter(filter);
      saveHistory();
    },
    [saveHistory],
  );

  // ── add text ───────────────────────────────────────────────
  const addText = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;

    const canvasW = canvas.width ?? 800;
    const canvasH = canvas.height ?? 600;

    const centerX = canvasW / 2;
    const centerY = canvasH / 2;

    const text = new fabric.IText("Double-click to edit", {
      left: centerX - 100,
      top: centerY - 20,
      fontFamily,
      fill: textColor,
      fontSize,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      editable: true,
      padding: 6,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTool("select");
    setSel(text);
  }, [fontFamily, textColor, fontSize, isBold, isItalic]);

  // ── Crop ───────────────────────────────────────────────────
  const startCrop = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;
    const w = canvas.width ?? 800;
    const h = canvas.height ?? 600;

    const rect = new fabric.Rect({
      left: w * 0.1,
      top: h * 0.1,
      width: w * 0.8,
      height: h * 0.8,
      fill: "rgba(0,0,0,0)",
      stroke: "#00d4ff",
      strokeWidth: 2,
      strokeDashArray: [6, 3],
      cornerColor: "#00d4ff",
      cornerSize: 12,
      transparentCorners: false,
      hasRotatingPoint: false,
      lockRotation: true,
    });
    cropRef.current = rect;
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    setTool("crop");
  }, []);

  const applyCrop = useCallback(() => {
    const canvas = fc.current,
      rect = cropRef.current;
    if (!canvas || !rect) return;

    rect.visible = false;
    canvas.discardActiveObject();
    canvas.renderAll();

    const scale = zoomScale.current;

    // Export full resolution of the cropped area
    const dataUrl = canvas.toDataURL({
      left: rect.left ?? 0,
      top: rect.top ?? 0,
      width: (rect.width ?? 0) * (rect.scaleX ?? 1),
      height: (rect.height ?? 0) * (rect.scaleY ?? 1),
      multiplier: 1 / scale,
      format: "png",
      quality: 1,
    });

    // Re-initialize with cropped and flattened image
    setInternalUrl(dataUrl);
    setTool("select");
    cropRef.current = null;
  }, []);

  const cancelCrop = useCallback(() => {
    const canvas = fc.current,
      rect = cropRef.current;
    if (canvas && rect) {
      canvas.remove(rect);
      canvas.renderAll();
    }
    cropRef.current = null;
    setTool("select");
  }, []);

  const download = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();

    const multiplier = 1 / zoomScale.current;
    const url = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: multiplier,
    });
    Object.assign(document.createElement("a"), {
      href: url,
      download: `edited-${Date.now()}.png`,
    }).click();
  }, []);

  const isText = sel?.type === "i-text";
  const showTxtCtrl = tool === "text" || isText;
  const isCropping = tool === "crop";

  return (
    <div
      ref={wrapRef}
      className="flex flex-col bg-[#21262b] rounded-xl overflow-hidden h-[80vh]"
    >
      {/* ── TOOLBAR ── */}
      <div className="flex items-center gap-1.5 py-2 px-3.5 bg-[#2a3036] border-b border-[#3c444d] flex-wrap min-h-[52px]">
        {/* Tool group */}
        <div className="flex gap-0.5 bg-[#21262b] p-1 rounded-lg border border-[#3c444d]">
          <Btn
            active={tool === "select"}
            onClick={() => {
              setTool("select");
              if (isCropping) cancelCrop();
            }}
            icon={<MousePointer2 size={15} />}
            label="Select"
          />
          <Btn
            active={tool === "text"}
            onClick={() => {
              if (!isCropping) setTool("text");
            }}
            icon={<Type size={15} />}
            label="Text"
          />
          <Btn
            active={isCropping}
            onClick={isCropping ? cancelCrop : startCrop}
            icon={<Crop size={15} />}
            label="Crop"
          />
        </div>

        <Divider
          type="vertical"
          className="border-[#3c444d] h-6.5 mx-0.5"
        />

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-slate-400 flex items-center gap-1">
            <ImageIcon size={14} /> Filter:
          </span>
          <Select
            size="small"
            value={activeFilter}
            onChange={applyFilter}
            className="w-[100px]"
            options={FILTERS}
            disabled={isCropping}
          />
        </div>

        <Divider
          type="vertical"
          className="border-[#3c444d] h-6.5 mx-0.5"
        />

        {/* History */}
        <Btn
          icon={<Undo2 size={15} />}
          label="Rollback (Ctrl+Z)"
          onClick={rollback}
          active={false}
          color={canUndo ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)"}
        />
        <Btn
          icon={<RotateCcw size={15} />}
          label="Reset to original"
          onClick={reset}
          danger
        />

        {/* Text controls */}
        {showTxtCtrl && !isCropping && (
          <>
            <Divider
              type="vertical"
              className="border-[#3c444d] h-6.5 mx-0.5"
            />
            <Select
              size="small"
              value={fontFamily}
              className="w-[148px]"
              popupMatchSelectWidth={false}
              onChange={(v) => {
                setFontFamily(v);
                applyText({ fontFamily: v });
              }}
              options={FONTS.map((f) => ({
                value: f,
                label: <span style={{ fontFamily: f }}>{f}</span>,
              }))}
            />
            <Select
              size="small"
              value={fontSize}
              className="w-[68px]"
              onChange={(v) => {
                setFontSize(v);
                applyText({ fontSize: v });
              }}
              options={FONT_SIZES.map((s) => ({ value: s, label: s }))}
            />
            {[
              {
                key: "bold",
                icon: <Bold size={13} />,
                active: isBold,
                fn: () => {
                  const n = !isBold;
                  setIsBold(n);
                  applyText({ fontWeight: n ? "bold" : "normal" });
                },
              },
              {
                key: "italic",
                icon: <Italic size={13} />,
                active: isItalic,
                fn: () => {
                  const n = !isItalic;
                  setIsItalic(n);
                  applyText({ fontStyle: n ? "italic" : "normal" });
                },
              },
            ].map((b) => (
              <button
                key={b.key}
                onClick={b.fn}
                className={`w-[30px] h-[30px] rounded border border-[#3c444d] cursor-pointer flex items-center justify-center transition-colors
                  ${b.active ? "bg-[#7c3aed] text-white" : "bg-transparent text-slate-300"}
                `}
              >
                {b.icon}
              </button>
            ))}
            <Tooltip title="Text Color">
              <label className="flex items-center gap-1 cursor-pointer text-[#94a3b8] text-xs">
                <div
                  className="w-6 h-6 rounded border-2 border-[#3c444d] relative overflow-hidden"
                  style={{ backgroundColor: textColor }}
                >
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      applyText({ fill: e.target.value });
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                Color
              </label>
            </Tooltip>
            {tool === "text" && (
              <Button
                size="small"
                type="primary"
                icon={<Type size={13} />}
                onClick={addText}
                className="bg-[#10b981] border-[#10b981]"
              >
                Add
              </Button>
            )}
          </>
        )}

        {/* Crop confirm/cancel */}
        {isCropping && (
          <>
            <Divider
              type="vertical"
              className="border-[#3c444d] h-6.5 mx-0.5"
            />
            <Button
              size="small"
              type="primary"
              icon={<Check size={13} />}
              onClick={applyCrop}
              className="bg-[#00d4ff] border-[#00d4ff] text-[#0f172a] font-semibold"
            >
              Apply Crop
            </Button>
            <Button size="small" icon={<X size={13} />} onClick={cancelCrop}>
              Cancel
            </Button>
          </>
        )}

        <div className="flex-1" />

        {isText && !isCropping && (
          <Btn
            danger
            onClick={deleteSelected}
            icon={<Trash2 size={15} />}
            label="Delete (Del)"
          />
        )}
        <Button
          type="primary"
          icon={<Download size={15} />}
          onClick={download}
          disabled={!isReady}
          className="bg-gradient-to-br from-[#7c3aed] to-[#a855f7] border-none font-semibold shadow-md"
        >
          Download
        </Button>
      </div>

      {/* ── STATUS ── */}
      <div className="py-1 px-3.5 bg-[#2a3036] border-b border-[#2a3036] text-[11px] text-slate-500">
        {isCropping && (
          <span className="text-[#00d4ff]">
            🔲 Drag handles → Apply Crop (Note: Cropping will flatten the image)
          </span>
        )}
        {tool === "text" && !isCropping && (
          <span className="text-[#a78bfa]">✏️ Configure then click Add</span>
        )}
        {tool === "select" && !isCropping && (
          <span>
            Select • Double-click text to edit • Del to delete • Ctrl+Z rollback
          </span>
        )}
      </div>

      {/* ── CANVAS AREA ── */}
      <div
        ref={areaRef}
        className="flex-1 overflow-auto flex justify-center items-center p-4 bg-[radial-gradient(ellipse_at_center,_#2a3036_0%,_#21262b_100%)]"
      >
        {!isReady && (
          <div className="flex flex-col items-center justify-center gap-3 p-15 text-slate-500">
            <div className="w-9 h-9 border-3 border-[#3c444d] border-t-[#7c3aed] rounded-full animate-spin" />
            <span className="text-[13px]">Loading image…</span>
          </div>
        )}
        <div
          className={`box-shadow-[0_20px_50px_rgba(0,0,0,0.6)] leading-none transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
