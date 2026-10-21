import React, { useEffect, useState } from "react";
import { Tooltip } from "antd";
import Image from "next/image";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { GenerateConfig } from "../chat-generate-image";

type Props = {
  referenceImages?: string[];
};

export default function ImageSmartReference({ referenceImages }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  // Dark keeps the original hand-tuned values; light reads theme tokens.
  const c =
    mode === "dark"
      ? { box: "#1e1e21", boxBorder: "rgba(255,255,255,0.05)", tile: "#374151", tileText: "#9CA3AF" }
      : {
          box: semantic.colorBgLayout,
          boxBorder: semantic.colorBorder,
          tile: semantic.colorFillSecondary,
          tileText: semantic.colorTextSecondary,
        };
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getResolutionLabel = (value: string) => {
    switch (value) {
      case "2k":
        return "2K";
      case "4k":
        return "4K";
      case "Unknown":
        return "?";
      default:
        return "?";
    }
  };

  // ไม่มีรูป reference ก็ไม่ต้องแสดงกล่อง (ทุกแท็บใช้ component นี้)
  if (!referenceImages || referenceImages.length === 0) return null;

  return (
    <>
      <div
        className="my-1  p-1 rounded-lg border"
        style={{ background: c.box, borderColor: c.boxBorder }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-1">
            {referenceImages && referenceImages.length > 0 ? (
              referenceImages.slice(0, 3).map((imageUrl, index) => (
                <Tooltip
                  key={index}
                  trigger={"click"}
                  title={
                    <div className="p-2">
                      <Image
                        src={imageUrl}
                        alt={`Reference ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-contain rounded"
                        unoptimized
                      />
                    </div>
                  }
                  placement="bottom"
                  mouseEnterDelay={0.3}
                  mouseLeaveDelay={0.1}
                  arrow={false}
                >
                  <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-colors">
                    <Image
                      src={imageUrl}
                      alt={`Reference ${index + 1}`}
                      width={10}
                      height={10}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error(
                          `Reference image ${index + 1} failed to load:`,
                          imageUrl,
                        );
                      }}
                    />
                  </div>
                </Tooltip>
              ))
            ) : (
              <div
                className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 flex items-center justify-center"
                style={{ background: c.tile }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
                    stroke={c.tileText}
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M4 15L8 11L12 15L16 11L20 15"
                    stroke={c.tileText}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                    stroke={c.tileText}
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            )}
            {referenceImages && referenceImages.length > 3 && (
              <div
                className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 flex items-center justify-center"
                style={{ background: c.tile }}
              >
                <span className="text-xs" style={{ color: c.tileText }}>
                  +{referenceImages.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
