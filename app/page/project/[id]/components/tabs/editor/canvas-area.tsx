import React from "react";

interface CanvasAreaProps {
areaRef: React.RefObject<HTMLDivElement | null>;
canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ areaRef, canvasRef, isReady }) => (
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
);

export default CanvasArea;