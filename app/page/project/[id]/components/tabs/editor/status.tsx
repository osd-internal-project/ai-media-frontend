import React from "react";
import { Undo2, Redo2, RotateCcw } from "lucide-react";
import { Tooltip } from "antd";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

interface StatusBarProps {
  isCropping: boolean;
  tool: string;
  rollback: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const iconBtnStyle = (active: boolean, semantic: any) => ({
  backgroundColor: active ? semantic.colorBgElevated : "transparent",
  border: `1px solid ${semantic.colorBorder}`,
  color: active ? semantic.colorPrimaryText : semantic.colorTextSecondary,
  cursor: active ? "pointer" : "not-allowed",
  transition: "all 0.2s",
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "0.375rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const StatusBar: React.FC<StatusBarProps> = ({
  isCropping, tool, rollback, redo, reset, canUndo, canRedo
}) =>
{
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  return (
    <div className="flex justify-between py-1 px-3.5 bg-[#2a3036] border-b border-[#3c444d] text-[11px] text-slate-500"
      style={{
        backgroundColor: semantic.colorBgContainer,
        borderColor: semantic.colorBorder,
      }}>
  <div>
  {isCropping && (
    <span style={{ color: semantic.colorPrimary }}>
      🔲 Drag handles → Apply Crop
    </span>
  )}
  {tool === "text" && !isCropping && (
    <span style={{ color: semantic.colorInfoText }}>
      ✏️ Configure then click Add
    </span>
  )}
  {tool === "draw" && (
    <span style={{ color: semantic.colorInfoText }}>
      🖌️ Draw freely on canvas
    </span>
  )}
  {tool === "select" && !isCropping && (
    <span>
      Select • Move • Import images • Select an object to edit • Del to delete
    </span>
  )}
</div>
 <div className="flex gap-1">
      <Tooltip title="Undo (Ctrl+Z)">
     <button
  onClick={rollback}
  disabled={!canUndo}
  style={{
    ...iconBtnStyle(canUndo, semantic),
    opacity: canUndo ? 1 : 0.5,
  }}
>
          <Undo2 color={semantic.colorWhite} size={16} />
        </button>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Y)">
        <button
          onClick={redo}
          disabled={!canRedo}
          style={{ ...iconBtnStyle(canRedo, semantic), opacity: canRedo ? 1 : 0.5 }}
        >
          <Redo2 color={semantic.colorWhite} size={16} />
        </button>
      </Tooltip>
      <Tooltip title="Reset Canvas">
        <button
          onClick={reset}
          className="w-7 h-7 flex items-center justify-center rounded  bg-transparent  text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
        >
          <RotateCcw color={semantic.colorWhite} size={16} />
        </button>
      </Tooltip>
    </div>
  </div>
);}

export default StatusBar;