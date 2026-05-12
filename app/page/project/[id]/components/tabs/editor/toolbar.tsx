import React from "react";
import { Button, Select, Tooltip, Divider, Upload as AntdUpload } from "antd";
import {
  Type, Download, Trash2, MousePointer2, Bold, Italic, Undo2, RotateCcw, Crop, Check, X,
  Image as ImageIcon, Upload, Eye, EyeOff, Paintbrush, FlipHorizontal, FlipVertical, ArrowUp, ArrowDown, Redo2
} from "lucide-react";
import type { Tool } from "./editor-space"; // หรือประกาศ type Tool ให้ตรงกัน
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

interface EditorToolbarProps {
  canvasPreset: string;
  setCanvasPreset: (v: string) => void;
  bgColor: string;
  handleBgColor: (c: string) => void;
  isTransparentBg: boolean;
  handleToggleTransparent: () => void;
  tool: Tool;
  setToolMode: (t: Tool) => void;
  isCropping: boolean;
  cancelCrop: () => void;
  startCrop: () => void;
  showTxtCtrl: boolean;
  textColor: string;
  setTextColor: (c: string) => void;
  applyText: (props: Record<string, unknown>) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  isBold: boolean;
  setIsBold: (b: boolean) => void;
  isItalic: boolean;
  setIsItalic: (b: boolean) => void;
  addText: () => void;
  sel: any;
  opacity: number;
  changeOpacity: (n: number) => void;
  bringForward: () => void;
  sendBackward: () => void;
  flip: (dir: 'x' | 'y') => void;
  activeFilter: string;
  applyFilter: (f: string) => void;
  deleteSelected: () => void;
  download: () => void;
  isReady: boolean;
  rollback: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  Btn: any;
  FONTS: string[];
  FONT_SIZES: number[];
  CANVAS_PRESETS: { label: string; value: string }[];
  FILTERS: { value: string; label: string }[];
  handleImport?: (file: File) => boolean;
  applyCrop?: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  canvasPreset, setCanvasPreset, bgColor, handleBgColor, isTransparentBg, handleToggleTransparent,
  tool, setToolMode, isCropping, cancelCrop, startCrop, showTxtCtrl, textColor, setTextColor, applyText,
  fontFamily, setFontFamily, fontSize, setFontSize, isBold, setIsBold, isItalic, setIsItalic, addText,
  sel, opacity, changeOpacity, bringForward, sendBackward, flip, activeFilter, applyFilter, deleteSelected,
  download, isReady, rollback, redo, reset, canUndo, canRedo, Btn, FONTS, FONT_SIZES, CANVAS_PRESETS, FILTERS,
  handleImport, applyCrop
}) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  return (
    <div className="flex flex-wrap items-center gap-1 py-1.5 px-1.5 sm:gap-1.5 sm:py-2 sm:px-3.5 w-full items-stretch"
  style={{
    backgroundColor: semantic.colorBgContainer,
    borderBottom: `1px solid ${semantic.colorBorder}`,
  }}>
        <div className="flex w-full flex-wrap items-center gap-1 min-w-0 sm:gap-1.5 sm:items-stretch">
        {/* Workspace Size & Bg */}
    <div className="flex w-full flex-wrap items-center gap-1 p-1 rounded-lg border sm:w-auto sm:gap-1.5 sm:p-1.5"
      style={{
    backgroundColor: semantic.colorBgContainer,
    border: `1px solid ${semantic.colorBorder}`,
  }}>
          <span className="text-[10px] text-slate-400 sm:text-[11px]">Canvas:</span>
          <Select
            size="small"
            value={canvasPreset}
            onChange={setCanvasPreset}
            className="w-[96px] sm:w-[115px]"
            options={CANVAS_PRESETS}
            popupMatchSelectWidth={false}
          />
      <Divider type="vertical" className="!hidden self-center m-0 sm:!block"
        style={{
    border: `1px solid ${semantic.colorBorder}`,
  }}/>
          <Tooltip title="Background Color">
            <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400 sm:text-[11px]">
              Bg
              <div
                className="h-4 w-4 rounded relative overflow-hidden sm:h-5 sm:w-5"
                style={{ backgroundColor: bgColor, border: `1px solid ${semantic.colorBorder}` }}
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
 className={`flex h-5 w-5 items-center justify-center rounded border transition-colors sm:ml-0.5 sm:h-6 sm:w-6 ${
    isTransparentBg
      ? "text-white"
      : "bg-transparent text-slate-400 hover:text-white"
  }`}
  style={{
    backgroundColor: isTransparentBg ? semantic.colorPrimary : "transparent",
    border: `1px solid ${isTransparentBg ? semantic.colorPrimary : semantic.colorBorder}`,
  }}
            >
              <div
                className="h-3 w-3 rounded-sm sm:h-3.5 sm:w-3.5"
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

    <Divider type="vertical" className="!hidden self-center h-6.5 mx-0.5 sm:!block"
      style={{
    border: `1px solid ${semantic.colorBorder}`,
  }} />

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
        {/* Tool group */}
    <div className="flex w-auto flex-wrap items-center gap-0.5 p-1 rounded-lg border"
      style={{
    backgroundColor: semantic.colorBgContainer,
    border: `1px solid ${semantic.colorBorder}`,
  }}>
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

        <div className="flex items-center gap-1 sm:hidden">
          <AntdUpload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Tooltip title="Import">
              <button
                type="button"
                className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-md cursor-pointer transition-all duration-150 sm:h-9 sm:w-9"
                style={{
                  backgroundColor: semantic.colorBgElevated,
                  color: semantic.colorText,
                  border: `1px solid ${semantic.colorBorder}`,
                }}
              >
                <Upload size={14} />
              </button>
            </Tooltip>
          </AntdUpload>
          <Tooltip title="Download">
            <button
              type="button"
              onClick={download}
              disabled={!isReady}
              className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-md cursor-pointer transition-all duration-150 disabled:cursor-not-allowed sm:h-9 sm:w-9"
              style={{
                backgroundColor: isReady ? semantic.colorPrimary : semantic.colorFillTertiary,
                color: isReady ? semantic.colorWhite ?? "#ffffff" : semantic.colorTextDisabled,
                opacity: isReady ? 1 : 0.6,
              }}
            >
              <Download size={14} />
            </button>
          </Tooltip>
        </div>
        </div>

        {/* Text/Brush Color & Add Text */}
        {(showTxtCtrl || tool === "draw") && !isCropping && (
          <> 
        <Divider type="vertical" className="!hidden self-center h-6.5 mx-0.5 sm:!block"
          style={{
    border: `1px solid ${semantic.colorBorder}`,
  }}/>
            <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:gap-1.5">
            <Tooltip title="Color">
              <label className="flex items-center gap-1 cursor-pointer text-[10px] text-[#94a3b8] sm:text-xs">
                <div
                  className="relative h-4 w-4 overflow-hidden rounded border-2 border-[#3c444d] sm:h-6 sm:w-6"
                  style={{ backgroundColor: textColor, borderColor: semantic.colorBorder }}
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
                className="!h-7 !px-2 !text-[11px] bg-[#10b981] border-[#10b981] sm:!h-8 sm:!px-3 sm:!text-xs"
              >
                Add
              </Button>
            )}
            </div>
          </>
        )}

        {/* Text Formatting */}
        {showTxtCtrl && !isCropping && (
          <>
            <Divider type="vertical" className="!hidden self-center border-[#3c444d] h-6.5 mx-0.5 sm:!block" />
            <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:gap-1.5">
            <Select
              size="small"
              value={fontFamily}
              className="w-[92px] sm:w-[120px]"
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
              className="w-[50px] sm:w-[60px]"
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
    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded transition-colors sm:h-7 sm:w-7"
    style={{
      backgroundColor: b.active ? semantic.colorPrimary : "transparent",
      color: b.active ? "#fff" : semantic.colorText,
      border: `1px solid ${b.active ? semantic.colorPrimary : semantic.colorBorder}`,
    }}
  >
    {b.icon}
  </button>
            ))}
            </div>
          </>
        )}

        {/* Contextual Object Controls */}
        {sel && !isCropping && (
           <>
             <Divider type="vertical" className="!hidden self-center border-[#3c444d] h-6.5 mx-0.5 sm:!block" />
          <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:gap-1.5">
          <Tooltip title="Opacity">
  <div
    className="flex items-center gap-1.5 sm:gap-2"
    style={{ minWidth: 96, flexShrink: 0 }}
  >
    <span className="text-[10px] text-slate-400 sm:text-[11px]" style={{ minWidth: 28, textAlign: "right" }}>
      {Math.round(opacity * 100)}%
    </span>
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={opacity}
      onChange={e => changeOpacity(parseFloat(e.target.value))}
      className="w-full cursor-pointer"
      style={{
        accentColor: semantic.colorPrimary,
        minWidth: 56,
        maxWidth: 88,
      }}
    />
  </div>
</Tooltip>
             
             <Divider type="vertical" className="!hidden self-center border-[#3c444d] h-4 mx-0.5 sm:!block" />
             <Btn icon={<ArrowUp size={14}/>} onClick={bringForward} label="Bring Forward" />
             <Btn icon={<ArrowDown size={14}/>} onClick={sendBackward} label="Send Backward" />
             
             {sel.type === "image" && (
                <>
                   <Divider type="vertical" className="!hidden self-center border-[#3c444d] h-4 mx-0.5 sm:!block" />
                   <Btn icon={<FlipHorizontal size={14}/>} onClick={() => flip('x')} label="Flip Horizontal" />
                   <Btn icon={<FlipVertical size={14}/>} onClick={() => flip('y')} label="Flip Vertical" />
                   
                   <div className="flex items-center gap-1 sm:ml-1 sm:gap-1.5">
                     <span className="flex items-center gap-1 text-[10px] text-slate-400 sm:text-[11px]">
                       <ImageIcon size={12} /> Filter:
                     </span>
                     <Select
                       size="small"
                       value={activeFilter}
                       onChange={applyFilter}
                       className="w-[76px] sm:w-[90px]"
                       options={FILTERS}
                       popupMatchSelectWidth={false}
                     />
                   </div>
                </>
             )}
             
             <Divider type="vertical" className="!hidden self-center border-[#3c444d] h-6.5 mx-0.5 sm:!block" />
             <Btn
               danger
               onClick={deleteSelected}
               icon={<Trash2 size={15} />}
               label="Delete (Del)"
             />
          </div>
           </>
        )}

        {/* Crop confirm/cancel */}
        {isCropping && (
          <>
            <Divider type="vertical" className="!hidden self-center border-[#3c444d] h-6.5 mx-0.5 sm:!block" />
            <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:gap-1.5">
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
            </div>
          </>
        )}

        <div className="hidden ml-auto items-center gap-2 sm:flex">
        <AntdUpload
          className="sm:flex sm:h-[30px]"
          multiple
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImport}
        >
          <div
            className="flex h-[30px] items-center justify-center gap-1 rounded-md cursor-pointer transition-colors border px-3 text-sm leading-none"
            style={{
              background: semantic.colorBgElevated,
              color: semantic.colorText,
              borderColor: semantic.colorBorder,
            }}
          >
            <Upload size={14} />
            Import
          </div>
        </AntdUpload>

        <Button
          type="primary"
          icon={<Download size={14} />}
          onClick={download}
          disabled={!isReady}
          className="h-[30px] border-none bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-sm font-semibold shadow-md"
        >
          Download
        </Button>
        </div>

        </div>

      </div>)
}
    
    
     

export default EditorToolbar;