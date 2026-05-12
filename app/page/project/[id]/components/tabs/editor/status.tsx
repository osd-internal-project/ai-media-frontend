import React from "react";
import { Undo2, Redo2, RotateCcw } from "lucide-react";
import { Tooltip } from "antd";

interface StatusBarProps {
  isCropping: boolean;
  tool: string;
  rollback: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const iconBtnClass = (active: boolean) =>
  `w-7 h-7 flex items-center justify-center rounded border transition-colors
   ${active
      ? "bg-[#3c444d] border-[#3c444d] text-white hover:bg-[#7c3aed]"
      : "bg-transparent border-[#3c444d] text-slate-400 cursor-not-allowed"
   }`;


const StatusBar: React.FC<StatusBarProps> = ({
  isCropping, tool, rollback, redo, reset, canUndo, canRedo
}) => (
<div className="flex justify-between py-1 px-3.5 bg-[#2a3036] border-b border-[#3c444d] text-[11px] text-slate-500">
    <div>
      {isCropping && <span className="text-[#00d4ff]">🔲 Drag handles → Apply Crop</span>}
      {tool === "text" && !isCropping && <span className="text-[#a78bfa]">✏️ Configure then click Add</span>}
      {tool === "draw" && <span className="text-[#a78bfa]">🖌️ Draw freely on canvas</span>}
      {tool === "select" && !isCropping && <span>Select • Move • Import images • Select an object to edit • Del to delete</span>}
    </div>
 <div className="flex gap-1">
      <Tooltip title="Undo (Ctrl+Z)">
        <button
          onClick={rollback}
          disabled={!canUndo}
          className={iconBtnClass(canUndo)}
          style={{ opacity: canUndo ? 1 : 0.5 }}
        >
          <Undo2 color="white" size={16} />
        </button>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Y)">
        <button
          onClick={redo}
          disabled={!canRedo}
          className={iconBtnClass(canRedo)}
          style={{ opacity: canRedo ? 1 : 0.5 }}
        >
          <Redo2 color="white" size={16} />
        </button>
      </Tooltip>
      <Tooltip title="Reset Canvas">
        <button
          onClick={reset}
          className="w-7 h-7 flex items-center justify-center rounded  bg-transparent  text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
        >
          <RotateCcw color="white" size={16} />
        </button>
      </Tooltip>
    </div>
  </div>
);

export default StatusBar;