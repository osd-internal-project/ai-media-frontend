import React, { useEffect, useState } from "react";
import { Tooltip } from "antd";
import Image from "next/image";
import { GenerateConfig } from "../chat-generate-image";

type Props = {
  referenceImages?: string[];
};

export default function ImageSmartReference({ referenceImages }: Props) {
  const [isMobile, setIsMobile] = useState(false);
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

  return (
    <>
      <div className="my-1  p-1 bg-[#1e1e21] rounded-lg border border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-1">
            {referenceImages && referenceImages.length > 0 ? (
              referenceImages.slice(0, 3).map((imageUrl, index) => (
                <Tooltip
                  key={index}
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
              <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M4 15L8 11L12 15L16 11L20 15"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            )}
            {referenceImages && referenceImages.length > 3 && (
              <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-400">
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
