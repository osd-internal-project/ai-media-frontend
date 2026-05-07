"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import * as fabric from "fabric";
import { Button, Select, Tooltip, Divider, Upload as AntdUpload } from "antd";
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
  Upload,
  Eye,
  EyeOff,
  Paintbrush,
  FlipHorizontal,
  FlipVertical,
  ArrowUp,
  ArrowDown,
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

const CANVAS_PRESETS = [
  { label: "Responsive (Fit)", value: "fit" },
  { label: "1:1 (2048x2048)", value: "1:1" },
  { label: "4:3 (2304x1728)", value: "4:3" },
  { label: "3:4 (1728x2304)", value: "3:4" },
  { label: "16:9 (2560x1440)", value: "16:9" },
  { label: "9:16 (1440x2560)", value: "9:16" },
  { label: "3:2 (2496x1664)", value: "3:2" },
  { label: "2:3 (1664x2496)", value: "2:3" },
  { label: "21:9 (3024x1296)", value: "21:9" },
];

type Tool = "select" | "text" | "crop" | "draw";

interface ImportedImage {
  id: string;
  name: string;
  url: string;
  fabricObj?: fabric.Image;
}

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
        ${
          active
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

const EditorSpace = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fc = useRef<fabric.Canvas | null>(null);
  const cropRef = useRef<fabric.Rect | null>(null);
  const cropTargetRef = useRef<fabric.Object | null>(null);
  const historyRef = useRef<string[]>([]);
  const initialRef = useRef<string>("");

  const [tool, setTool] = useState<Tool>("select");
  const [isReady, setIsReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [sel, setSel] = useState<fabric.Object | null>(null);
  const [activeFilter, setActiveFilter] = useState("none");
  const [canvasPreset, setCanvasPreset] = useState("fit");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isTransparentBg, setIsTransparentBg] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const [images, setImages] = useState<ImportedImage[]>([]);
  const [showImageList, setShowImageList] = useState(true);

  const saveHistory = useCallback(() => {
    if (!fc.current) return;
    const snap = JSON.stringify((fc.current as any).toJSON(["customId"]));
    historyRef.current = [...historyRef.current, snap];
    setCanUndo(historyRef.current.length > 1);
  }, []);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });
    fc.current = canvas;

    canvas.on("selection:created", (e) => setSel(e.selected?.[0] ?? null));
    canvas.on("selection:updated", (e) => setSel(e.selected?.[0] ?? null));
    canvas.on("selection:cleared", () => setSel(null));

    const snap = JSON.stringify((canvas as any).toJSON(["customId"]));
    initialRef.current = snap;
    historyRef.current = [snap];
    setCanUndo(false);
    setIsReady(true);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const applyCanvasSize = () => {
      if (!fc.current || !areaRef.current) return;
      const canvas = fc.current;
      const containerW = areaRef.current.clientWidth * 0.95;
      const containerH = areaRef.current.clientHeight * 0.9;
      
      let logicalW = containerW;
      let logicalH = containerH;
      let scale = 1;

      if (canvasPreset === "1:1") { logicalW = 2048; logicalH = 2048; }
      else if (canvasPreset === "4:3") { logicalW = 2304; logicalH = 1728; }
      else if (canvasPreset === "3:4") { logicalW = 1728; logicalH = 2304; }
      else if (canvasPreset === "16:9") { logicalW = 2560; logicalH = 1440; }
      else if (canvasPreset === "9:16") { logicalW = 1440; logicalH = 2560; }
      else if (canvasPreset === "3:2") { logicalW = 2496; logicalH = 1664; }
      else if (canvasPreset === "2:3") { logicalW = 1664; logicalH = 2496; }
      else if (canvasPreset === "21:9") { logicalW = 3024; logicalH = 1296; }

      if (canvasPreset !== "fit") {
         const scaleX = containerW / logicalW;
         const scaleY = containerH / logicalH;
         scale = Math.min(scaleX, scaleY);
      }

      canvas.setDimensions({ width: logicalW * scale, height: logicalH * scale });
      canvas.setZoom(scale);
      canvas.renderAll();
    };
    
    applyCanvasSize();
    window.addEventListener("resize", applyCanvasSize);
    return () => window.removeEventListener("resize", applyCanvasSize);
  }, [canvasPreset, isReady]);

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

  const setToolMode = useCallback((newTool: Tool) => {
    setTool(newTool);
    if (tool === "crop" && newTool !== "crop") cancelCrop();
    
    if (fc.current) {
      if (newTool === "draw") {
        fc.current.isDrawingMode = true;
        if (!fc.current.freeDrawingBrush) {
          fc.current.freeDrawingBrush = new fabric.PencilBrush(fc.current);
        }
        fc.current.freeDrawingBrush.color = textColor;
        fc.current.freeDrawingBrush.width = fontSize / 4 || 5;
      } else {
        fc.current.isDrawingMode = false;
      }
    }
  }, [tool, textColor, fontSize]);

  useEffect(() => {
    if (fc.current && fc.current.isDrawingMode && fc.current.freeDrawingBrush) {
      fc.current.freeDrawingBrush.color = textColor;
      fc.current.freeDrawingBrush.width = fontSize / 4 || 5;
    }
  }, [textColor, fontSize]);

  const handleBgColor = (c: string) => {
    setBgColor(c);
    setIsTransparentBg(false);
    if (fc.current) {
      fc.current.backgroundColor = c;
      fc.current.renderAll();
      saveHistory();
    }
  };

  const handleToggleTransparent = () => {
    const val = !isTransparentBg;
    setIsTransparentBg(val);
    if (fc.current) {
      fc.current.backgroundColor = val ? "transparent" : bgColor;
      fc.current.renderAll();
      saveHistory();
    }
  };

  const handleImport = (file: File) => {
    if (!fc.current) return false;

    const url = URL.createObjectURL(file);
    const customId = Math.random().toString(36).substr(2, 9);
    const newImage: ImportedImage = {
      id: customId,
      name: file.name,
      url,
    };

    setImages((prev) => [...prev, newImage]);

    const imgEl = new Image();
    imgEl.onload = () => {
      const canvas = fc.current!;
      const logicalW = canvas.width! / canvas.getZoom();
      const logicalH = canvas.height! / canvas.getZoom();

      const scale = Math.min(
        1,
        (logicalW * 0.8) / imgEl.width,
        (logicalH * 0.8) / imgEl.height,
      );

      const imgObj = new fabric.Image(imgEl, {
        left: logicalW / 2,
        top: logicalH / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
      });
      (imgObj as any).set("customId", customId);

      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
      canvas.renderAll();

      setImages((prev) =>
        prev.map((img) =>
          img.id === customId ? { ...img, fabricObj: imgObj } : img,
        ),
      );
    };
    imgEl.src = url;

    return false;
  };

  const deleteImageFromList = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img && fc.current) {
      const obj = fc.current
        .getObjects()
        .find((o) => (o as any).customId === id);
      if (obj) {
        fc.current.remove(obj);
        fc.current.renderAll();
      }
    }
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const deleteSelected = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active !== cropRef.current) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
      setSel(null);

      if ((active as any).customId) {
        setImages((prev) =>
          prev.filter((i) => i.id !== (active as any).customId),
        );
      }
    }
  }, []);

  const bringForward = useCallback(() => {
    if (fc.current && sel) {
      fc.current.bringObjectForward(sel);
      fc.current.renderAll();
      saveHistory();
    }
  }, [sel, saveHistory]);

  const sendBackward = useCallback(() => {
    if (fc.current && sel) {
      fc.current.sendObjectBackwards(sel);
      fc.current.renderAll();
      saveHistory();
    }
  }, [sel, saveHistory]);

  const flip = useCallback((dir: 'x' | 'y') => {
    if (fc.current && sel) {
      if (dir === 'x') sel.set('flipX', !sel.flipX);
      else sel.set('flipY', !sel.flipY);
      fc.current.renderAll();
      saveHistory();
    }
  }, [sel, saveHistory]);

  const changeOpacity = useCallback((val: number) => {
    setOpacity(val);
    if (fc.current && sel) {
      sel.set('opacity', val);
      fc.current.renderAll();
    }
  }, [sel]);

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
    if (sel) {
      setOpacity(sel.opacity ?? 1);
    }
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

  const rollback = useCallback(() => {
    const canvas = fc.current;
    if (!canvas || historyRef.current.length < 2) return;
    historyRef.current = historyRef.current.slice(0, -1);
    const prev = historyRef.current[historyRef.current.length - 1];
    canvas.loadFromJSON(prev).then(() => {
      canvas.renderAll();
    });
    setCanUndo(historyRef.current.length > 1);
  }, []);

  const reset = useCallback(() => {
    const canvas = fc.current;
    if (!canvas || !initialRef.current) return;
    canvas.loadFromJSON(initialRef.current).then(() => {
      canvas.renderAll();
      historyRef.current = [initialRef.current];
      setCanUndo(false);
      setSel(null);
      setToolMode("select");
      setActiveFilter("none");
      setImages([]);
    });
  }, [setToolMode]);

  const applyFilter = useCallback(
    (filter: string) => {
      const canvas = fc.current;
      if (!canvas) return;

      const activeObj = canvas.getActiveObject();
      if (!activeObj || activeObj.type !== "image") {
        alert("Please select an image to apply a filter.");
        return;
      }

      const imgObj = activeObj as fabric.Image;
      imgObj.filters = [];
      if (filter === "grayscale")
        imgObj.filters.push(new fabric.filters.Grayscale());
      if (filter === "sepia") imgObj.filters.push(new fabric.filters.Sepia());
      if (filter === "invert") imgObj.filters.push(new fabric.filters.Invert());

      imgObj.applyFilters();
      canvas.renderAll();
      setActiveFilter(filter);
      saveHistory();
    },
    [saveHistory],
  );

  const addText = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;

    const logicalW = canvas.width! / canvas.getZoom();
    const logicalH = canvas.height! / canvas.getZoom();

    const centerX = logicalW / 2;
    const centerY = logicalH / 2;

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
    setToolMode("select");
    setSel(text);
  }, [fontFamily, textColor, fontSize, isBold, isItalic, setToolMode]);

  const startCrop = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== "image") {
      alert("Please select an image to crop.");
      return;
    }

    const bound = activeObj.getBoundingRect();

    const rect = new fabric.Rect({
      left: bound.left / canvas.getZoom(),
      top: bound.top / canvas.getZoom(),
      width: bound.width / canvas.getZoom(),
      height: bound.height / canvas.getZoom(),
      originX: "left",
      originY: "top",
      fill: "rgba(0,0,0,0.1)",
      stroke: "#00d4ff",
      strokeWidth: 2 / canvas.getZoom(),
      strokeDashArray: [6, 3],
      cornerColor: "#00d4ff",
      cornerSize: 12 / canvas.getZoom(),
      transparentCorners: false,
      hasRotatingPoint: false,
      lockRotation: true,
    });

    cropRef.current = rect;
    cropTargetRef.current = activeObj;

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    setToolMode("crop");
  }, [setToolMode]);

  const applyCrop = useCallback(() => {
    const canvas = fc.current,
      rect = cropRef.current,
      targetObj = cropTargetRef.current;

    if (!canvas || !rect || !targetObj) return;

    rect.visible = false;
    canvas.discardActiveObject();

    const hiddenObjs: fabric.Object[] = [];
    canvas.getObjects().forEach((obj) => {
      if (obj !== targetObj && obj.visible) {
        obj.visible = false;
        hiddenObjs.push(obj);
      }
    });

    const oldBg = canvas.backgroundColor;
    canvas.backgroundColor = "transparent";
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({
      left: rect.left ?? 0,
      top: rect.top ?? 0,
      width: (rect.width ?? 0) * (rect.scaleX ?? 1),
      height: (rect.height ?? 0) * (rect.scaleY ?? 1),
      format: "png",
      quality: 1,
      multiplier: 1, // we extract exactly logical coordinates
    });

    hiddenObjs.forEach((obj) => {
      obj.visible = true;
    });
    canvas.backgroundColor = oldBg;

    const imgEl = new Image();
    imgEl.onload = () => {
      const newImg = new fabric.Image(imgEl, {
        left: rect.left,
        top: rect.top,
        originX: "left",
        originY: "top",
        scaleX: 1,
        scaleY: 1,
        selectable: true,
        evented: true,
      });
      (newImg as any).set("customId", (targetObj as any).customId);

      canvas.remove(targetObj);
      canvas.add(newImg);
      canvas.remove(rect);
      canvas.setActiveObject(newImg);
      canvas.renderAll();

      cropRef.current = null;
      cropTargetRef.current = null;
      setToolMode("select");
      saveHistory();
    };
    imgEl.src = dataUrl;
  }, [saveHistory, setToolMode]);

  const cancelCrop = useCallback(() => {
    const canvas = fc.current,
      rect = cropRef.current;
    if (canvas && rect) {
      canvas.remove(rect);
      canvas.renderAll();
    }
    cropRef.current = null;
    cropTargetRef.current = null;
    setToolMode("select");
  }, [setToolMode]);

  const download = useCallback(() => {
    const canvas = fc.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();

    const scale = canvas.getZoom();
    const url = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1 / scale,
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
      className="flex flex-col bg-[#21262b] rounded-xl overflow-hidden h-full w-full min-h-[500px]"
    >
      {/* ── TOOLBAR ── */}
      <div className="flex items-center gap-1.5 py-2 px-3.5 bg-[#2a3036] border-b border-[#3c444d] flex-wrap min-h-[52px]">
        {/* Workspace Size & Bg */}
        <div className="flex items-center gap-1.5 bg-[#21262b] p-1.5 rounded-lg border border-[#3c444d]">
          <span className="text-[11px] text-slate-400">Canvas:</span>
          <Select
            size="small"
            value={canvasPreset}
            onChange={setCanvasPreset}
            className="w-[115px]"
            options={CANVAS_PRESETS}
            popupMatchSelectWidth={false}
          />
          <Divider type="vertical" className="border-[#3c444d] m-0" />
          <Tooltip title="Background Color">
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-400">
              Bg
              <div
                className="w-5 h-5 rounded border border-[#3c444d] relative overflow-hidden"
                style={{ backgroundColor: bgColor }}
              >
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => handleBgColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </label>
          </Tooltip>
          <Tooltip title="Toggle Transparent Background">
            <button
              onClick={handleToggleTransparent}
              className={`w-6 h-6 flex items-center justify-center rounded border transition-colors ml-0.5 ${
                isTransparentBg
                  ? "bg-[#7c3aed] border-[#7c3aed] text-white"
                  : "bg-transparent border-[#3c444d] text-slate-400 hover:text-white"
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-sm"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(135deg, transparent 75%, #ccc 75%)",
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 4px 0, 4px -4px, 0px 4px",
                  backgroundColor: "white",
                }}
              />
            </button>
          </Tooltip>
        </div>

        <Divider type="vertical" className="border-[#3c444d] h-6.5 mx-0.5" />

        {/* Tool group */}
        <div className="flex gap-0.5 bg-[#21262b] p-1 rounded-lg border border-[#3c444d]">
          <Btn
            active={tool === "select"}
            onClick={() => setToolMode("select")}
            icon={<MousePointer2 size={15} />}
            label="Select / Move"
          />
          <Btn
            active={tool === "draw"}
            onClick={() => setToolMode("draw")}
            icon={<Paintbrush size={15} />}
            label="Draw (Brush)"
          />
          <Btn
            active={tool === "text"}
            onClick={() => {
              if (!isCropping) setToolMode("text");
            }}
            icon={<Type size={15} />}
            label="Text"
          />
          <Btn
            active={isCropping}
            onClick={isCropping ? cancelCrop : startCrop}
            icon={<Crop size={15} />}
            label="Crop Selected Image"
          />
        </div>

        {/* Text/Brush Color & Add Text */}
        {(showTxtCtrl || tool === "draw") && !isCropping && (
          <>
            <Divider type="vertical" className="border-[#3c444d] h-6.5 mx-0.5" />
            <Tooltip title="Color">
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

        {/* Text Formatting */}
        {showTxtCtrl && !isCropping && (
          <>
            <Divider type="vertical" className="border-[#3c444d] h-6.5 mx-0.5" />
            <Select
              size="small"
              value={fontFamily}
              className="w-[120px]"
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
              className="w-[60px]"
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
                className={`w-7 h-7 rounded border border-[#3c444d] cursor-pointer flex items-center justify-center transition-colors
                  ${
                    b.active
                      ? "bg-[#7c3aed] text-white"
                      : "bg-transparent text-slate-300"
                  }
                `}
              >
                {b.icon}
              </button>
            ))}
          </>
        )}

        {/* Contextual Object Controls */}
        {sel && !isCropping && (
           <>
             <Divider type="vertical" className="border-[#3c444d] h-6.5 mx-0.5" />
             <Tooltip title="Opacity">
               <div className="flex items-center gap-1 w-[70px]">
                 <span className="text-[11px] text-slate-400">{Math.round(opacity * 100)}%</span>
                 <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => changeOpacity(parseFloat(e.target.value))} className="w-full accent-[#7c3aed] cursor-pointer" />
               </div>
             </Tooltip>
             
             <Divider type="vertical" className="border-[#3c444d] h-4 mx-0.5" />
             <Btn icon={<ArrowUp size={14}/>} onClick={bringForward} label="Bring Forward" />
             <Btn icon={<ArrowDown size={14}/>} onClick={sendBackward} label="Send Backward" />
             
             {sel.type === "image" && (
                <>
                   <Divider type="vertical" className="border-[#3c444d] h-4 mx-0.5" />
                   <Btn icon={<FlipHorizontal size={14}/>} onClick={() => flip('x')} label="Flip Horizontal" />
                   <Btn icon={<FlipVertical size={14}/>} onClick={() => flip('y')} label="Flip Vertical" />
                   
                   <div className="flex items-center gap-1.5 ml-1">
                     <span className="text-[11px] text-slate-400 flex items-center gap-1">
                       <ImageIcon size={12} /> Filter:
                     </span>
                     <Select
                       size="small"
                       value={activeFilter}
                       onChange={applyFilter}
                       className="w-[90px]"
                       options={FILTERS}
                       popupMatchSelectWidth={false}
                     />
                   </div>
                </>
             )}
             
             <Divider type="vertical" className="border-[#3c444d] h-6.5 mx-0.5" />
             <Btn
               danger
               onClick={deleteSelected}
               icon={<Trash2 size={15} />}
               label="Delete (Del)"
             />
           </>
        )}

        {/* Crop confirm/cancel */}
        {isCropping && (
          <>
            <Divider type="vertical" className="border-[#3c444d] h-6.5 mx-0.5" />
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

        <AntdUpload
          multiple
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImport}
        >
          <div className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-slate-300 py-1.5 px-3 rounded-md cursor-pointer transition-colors border border-[#3c444d] text-sm mr-2">
            <Upload size={14} />
            Import
          </div>
        </AntdUpload>

        <Button
          type="primary"
          icon={<Download size={14} />}
          onClick={download}
          disabled={!isReady}
          className="bg-gradient-to-br from-[#7c3aed] to-[#a855f7] border-none font-semibold shadow-md h-[30px]"
        >
          Download
        </Button>
      </div>

      {/* ── STATUS ── */}
      <div className="flex justify-between py-1 px-3.5 bg-[#2a3036] border-b border-[#3c444d] text-[11px] text-slate-500">
        <div>
          {isCropping && <span className="text-[#00d4ff]">🔲 Drag handles → Apply Crop</span>}
          {tool === "text" && !isCropping && <span className="text-[#a78bfa]">✏️ Configure then click Add</span>}
          {tool === "draw" && <span className="text-[#a78bfa]">🖌️ Draw freely on canvas</span>}
          {tool === "select" && !isCropping && <span>Select • Move • Import images • Select an object to edit • Del to delete</span>}
        </div>
        <div className="flex gap-4">
           <button onClick={rollback} className="hover:text-white transition-colors flex items-center gap-1" disabled={!canUndo} style={{opacity: canUndo ? 1 : 0.5}}>
              <Undo2 size={12} /> Rollback (Ctrl+Z)
           </button>
           <button onClick={reset} className="hover:text-red-400 transition-colors flex items-center gap-1">
              <RotateCcw size={12} /> Reset Canvas
           </button>
        </div>
      </div>

      {/* ── CANVAS AREA ── */}
      <div
        ref={areaRef}
        className="flex-1 overflow-auto flex justify-center items-center p-4 bg-[radial-gradient(ellipse_at_center,_#2a3036_0%,_#21262b_100%)] relative"
      >
        {!isReady && (
          <div className="flex flex-col items-center justify-center gap-3 p-15 text-slate-500">
            <div className="w-9 h-9 border-3 border-[#3c444d] border-t-[#7c3aed] rounded-full animate-spin" />
            <span className="text-[13px]">Initializing editor…</span>
          </div>
        )}
        <div
          className={`box-shadow-[0_20px_50px_rgba(0,0,0,0.6)] leading-none transition-opacity duration-300 ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
          style={{
             backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(135deg, transparent 75%, #ccc 75%)",
             backgroundSize: "20px 20px",
             backgroundPosition: "0 0, 10px 0, 10px -10px, 0px 10px",
             backgroundColor: "white"
          }}
        >
          <canvas ref={canvasRef} className="border border-[#3c444d]" />
        </div>
      </div>

      {/* ── IMAGE LIST ── */}
      <div className="bg-[#2a3036] border-t border-[#3c444d] px-4 py-2 transition-all">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-300 font-semibold flex items-center gap-2">
            <ImageIcon size={16} /> Imported Images
          </span>
          <Button
            size="small"
            type="text"
            icon={showImageList ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => setShowImageList(!showImageList)}
            className="text-slate-400 hover:text-white"
          >
            {showImageList ? "Hide" : "Show"}
          </Button>
        </div>
        {showImageList && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#3c444d]">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group w-20 h-20 bg-[#1a1f24] rounded-lg border border-[#3c444d] flex items-center justify-center overflow-hidden shrink-0"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="max-w-full max-h-full object-contain"
                />
                <button
                  onClick={() => deleteImageFromList(img.id)}
                  className="absolute top-1 right-1 bg-red-500/80 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="text-slate-500 text-xs py-4 flex items-center justify-center w-full bg-white/5 rounded border border-dashed border-[#3c444d]">
                No images imported yet. Click the &quot;Import&quot; button above to add images.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorSpace;
