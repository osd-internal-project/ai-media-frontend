import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import React from "react";

interface CanvasAreaProps {
areaRef: React.RefObject<HTMLDivElement | null>;
canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ areaRef, canvasRef, isReady }) =>
{
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  return (
 <div
  ref={areaRef}
  className="flex-1 overflow-auto flex justify-center items-center p-4 relative"
  style={{
    background: `radial-gradient(ellipse at center, ${semantic.colorBgElevated} 0%, ${semantic.colorBgContainer} 100%)`,
  }}
>
  {!isReady && (
    <div className="flex flex-col items-center justify-center gap-3 p-15" style={{ color: semantic.colorTextSecondary }}>
      <div
        className="w-9 h-9 rounded-full animate-spin"
        style={{
          borderWidth: 3,
          borderStyle: "solid",
          borderColor: `${semantic.colorBorder}`,
          borderTopColor: semantic.colorPrimary,
        }}
      />
      <span className="text-[13px]">Initializing editor…</span>
    </div>
  )}
  <div
    className={`box-shadow-[0_20px_50px_rgba(0,0,0,0.6)] leading-none transition-opacity duration-300 ${
      isReady ? "opacity-100" : "opacity-0"
    }`}
    style={{
      backgroundImage:
        "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(135deg, transparent 75%, #ccc 75%)",
      backgroundSize: "20px 20px",
      backgroundPosition: "0 0, 10px 0, 10px -10px, 0px 10px",
      backgroundColor: "white",
    }}
  >
    <canvas ref={canvasRef} style={{ border: `1px solid ${semantic.colorBorder}` }} />
  </div>
</div>
);}

export default CanvasArea;