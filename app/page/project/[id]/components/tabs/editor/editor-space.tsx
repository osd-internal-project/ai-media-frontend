"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import * as fabric from "fabric";
import { Button,  Tooltip,  Upload as AntdUpload } from "antd";
import {
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import EditorToolbar from "./toolbar";
import StatusBar from "./status";
import CanvasArea from "./canvas-area";
import ImageList from "./image-list";

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

export type Tool = "select" | "text" | "crop" | "draw";

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
  const redoRef = useRef<string[]>([]);
  const [canRedo, setCanRedo] = useState(false);
  const isRestoringRef = useRef(false);

  const saveHistory = useCallback(() => {
    if (!fc.current) return;
    const snap = JSON.stringify((fc.current as any).toJSON(["customId"]));
    historyRef.current = [...historyRef.current, snap];
    redoRef.current = [];
    setCanUndo(historyRef.current.length > 1);
      setCanRedo(false);
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
      canvas.setZoom(1);
      canvas.renderAll();
    };
  
  useEffect(() => {
    applyCanvasSize();
    repositionObjectsInCanvas();
    window.addEventListener("resize", applyCanvasSize);
    return () => window.removeEventListener("resize", applyCanvasSize);
  }, [canvasPreset, isReady]);

 useEffect(() => {
  const canvas = fc.current;
  if (!canvas) return;
  const h = () => {
    if (!isRestoringRef.current) saveHistory();
  };
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
  console.log("handleImport called", file);
  if (!fc.current) {
    console.error("fabric.Canvas not ready");
    return false;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const url = event.target?.result as string;
    if (!url) {
      console.error("FileReader result is empty");
      return;
    }

    const customId = Math.random().toString(36).substr(2, 9);
    const newImage = {
      id: customId,
      name: file.name,
      url,
      
    };

    setImages((prev) => {
      console.log("setImages", [...prev, newImage]);
      return [...prev, newImage];
    });

    const imgEl = new window.Image();
    imgEl.crossOrigin = "anonymous";
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
      console.log("Image added to canvas", imgObj);
    };
    imgEl.onerror = (e) => {
      console.error("Image load error", e);
    };
    imgEl.src = url;
  };
  reader.onerror = (e) => {
    console.error("FileReader error", e);
  };
  reader.readAsDataURL(file);

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") redo();
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
  isRestoringRef.current = true;
  const current = historyRef.current[historyRef.current.length - 1];
  redoRef.current = [current, ...redoRef.current];
  historyRef.current = historyRef.current.slice(0, -1);
  const prev = historyRef.current[historyRef.current.length - 1];
  canvas.loadFromJSON(prev).then(() => {
    canvas.renderAll();
    isRestoringRef.current = false;
  });
  setCanUndo(historyRef.current.length > 1);
  setCanRedo(redoRef.current.length > 0);
}, []);

  const redo = useCallback(() => {
  const canvas = fc.current;
  if (!canvas || redoRef.current.length === 0) return;
  isRestoringRef.current = true;
  const next = redoRef.current[0];
  redoRef.current = redoRef.current.slice(1);
  historyRef.current = [...historyRef.current, next];
  canvas.loadFromJSON(next).then(() => {
    canvas.renderAll();
    isRestoringRef.current = false;
  });
  setCanUndo(historyRef.current.length > 1);
  setCanRedo(redoRef.current.length > 0);
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

    // const bound = activeObj.getBoundingRect();
    const bound = activeObj.getBoundingRect();
    const zoom = canvas.getZoom();

    const rect = new fabric.Rect({
      left: bound.left, 
      top: bound.top, 
      width: bound.width ,
      height: bound.height ,
      originX: "left",
      originY: "top",
      fill: "rgba(0,0,0,0.1)",
      stroke: "#00d4ff",
      strokeWidth: 2 ,
      strokeDashArray: [6, 3],
      cornerColor: "#00d4ff",
      cornerSize: 16 ,
      transparentCorners: false,
      hasRotatingPoint: false,
      lockRotation: true,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      evented: true,
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

  const repositionObjectsInCanvas = () => {
  const canvas = fc.current;
  if (!canvas) return;
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  canvas.getObjects().forEach(obj => {
    if (obj.type === "image") {
      // scale down if image is bigger than canvas
      if (obj.width * obj.scaleX > width) {
        obj.scaleX = width / obj.width;
      }
      if (obj.height * obj.scaleY > height) {
        obj.scaleY = height / obj.height;
      }
      // clamp position
      obj.left = Math.max(0, Math.min(obj.left, width - obj.width * obj.scaleX));
      obj.top = Math.max(0, Math.min(obj.top, height - obj.height * obj.scaleY));
      obj.setCoords();
    }
  });
  canvas.renderAll();
};

  return (
    <div
      ref={wrapRef}
      className="flex flex-col bg-[#21262b] rounded-xl overflow-hidden h-full w-full min-h-[500px]"
    >

{/* ── TOOLBAR ── */}
      <EditorToolbar
canvasPreset={canvasPreset}
setCanvasPreset={setCanvasPreset}
bgColor={bgColor}
handleBgColor={handleBgColor}
isTransparentBg={isTransparentBg}
handleToggleTransparent={handleToggleTransparent}
tool={tool}
setToolMode={setToolMode}
isCropping={isCropping}
applyCrop={applyCrop} 
cancelCrop={cancelCrop}
startCrop={startCrop}
showTxtCtrl={showTxtCtrl}
textColor={textColor}
setTextColor={setTextColor}
applyText={applyText}
fontFamily={fontFamily}
setFontFamily={setFontFamily}
fontSize={fontSize}
setFontSize={setFontSize}
isBold={isBold}
setIsBold={setIsBold}
isItalic={isItalic}
setIsItalic={setIsItalic}
addText={addText}
sel={sel}
opacity={opacity}
changeOpacity={changeOpacity}
bringForward={bringForward}
sendBackward={sendBackward}
flip={flip}
activeFilter={activeFilter}
applyFilter={applyFilter}
deleteSelected={deleteSelected}
download={download}
isReady={isReady}
rollback={rollback}
redo={redo}
reset={reset}
canUndo={canUndo}
canRedo={canRedo}
Btn={Btn}
FONTS={FONTS}
FONT_SIZES={FONT_SIZES}
CANVAS_PRESETS={CANVAS_PRESETS}
FILTERS={FILTERS}
handleImport={handleImport}
/>

      {/* ── STATUS ── */}
      <StatusBar
  isCropping={isCropping}
  tool={tool}
  rollback={rollback}
  redo={redo}
  reset={reset}
  canUndo={canUndo}
  canRedo={canRedo}
/>

      {/* ── CANVAS AREA ── */}
     <CanvasArea areaRef={areaRef} canvasRef={canvasRef} isReady={isReady} />

      {/* ── IMAGE LIST ── */}
    <ImageList
  images={images}
  showImageList={showImageList}
  setShowImageList={setShowImageList}
  deleteImageFromList={deleteImageFromList}
/>
    </div>
  );
};

export default EditorSpace;
