import React from "react";
import { Button, Select, Tooltip, Divider, Upload as AntdUpload } from "antd";
import {
  Type, Download, Trash2, MousePointer2, Bold, Italic, Undo2, RotateCcw, Crop, Check, X,
  Image as ImageIcon, Upload, Eye, EyeOff, Paintbrush, FlipHorizontal, FlipVertical, ArrowUp, ArrowDown, Redo2
} from "lucide-react";
import type { Tool } from "./editor-space"; // หรือประกาศ type Tool ให้ตรงกัน

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
}) => (
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
);

export default EditorToolbar;