import React, { useEffect, useState } from "react";
import { Tooltip } from "antd";
import Image from "next/image"; 
import {
  Play,
} from "lucide-react";
import { TMasterModelType } from "@/app/common/master-model-type.type";

interface DreamactorSmartReferenceProps {
  selectedAIModel?: TMasterModelType | null;
  firstFrameImage?: string;
  referenceImages?: string[]; // Reference images used for generation
  resolution?: string;
}

const getFileType = (url: string) => {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (["mp4", "webm", "ogg", "mov", "avi"].includes(ext || "")) return "video";
  if (["mp3", "wav", "aac", "m4a", "flac"].includes(ext || "")) return "audio";
  return "image";
};

export default function DeamactorSmartReference({
  selectedAIModel,
  referenceImages,
  resolution,
}: DreamactorSmartReferenceProps) {
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

  const getResolutionLabel = (res: string) => {
    switch (res) {
      case "480p":
        return "480p";
      case "720p":
        return "720p";
      case "1080p":
        return "1080p";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="mt-1 p-2 bg-[#1e1e21] rounded-lg border border-white/5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1 text-sm">
          {isMobile ? null : (
            <span className="text-white font-medium">Smart Reference</span>
          )}

          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <span className="text-blue-400 text-xs">
              {selectedAIModel?.name || "Unknown Model"}
            </span>
          </div>
        </div>

        {/* Multiple Reference Images Preview - separate from first frame */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {referenceImages && referenceImages.length > 0 ? (
            referenceImages.slice(0, 3).map((imageUrl, index) => {
              const fileType = getFileType(imageUrl);
              return (
                <Tooltip
                  key={index}
                  title={
                    <div className="p-2">
                      {fileType === "video" ? (
                        <video
                          src={imageUrl}
                          controls
                          autoPlay
                          muted
                          loop
                          className="max-w-[200px] max-h-[200px] rounded"
                        />
                      ) : fileType === "audio" ? (
                        <div className="min-w-[200px] flex items-center justify-center bg-gray-800 rounded p-2">
                          <audio src={imageUrl} controls className="w-full" />
                        </div>
                      ) : (
                        <Image
                          src={imageUrl}
                          alt={`Reference ${index + 1}`}
                          width={200}
                          height={200}
                          className="max-w-[200px] max-h-[200px] object-contain rounded"
                          unoptimized
                        />
                      )}
                    </div>
                  }
                  placement="bottom"
                  mouseEnterDelay={0.3}
                  mouseLeaveDelay={0.1}
                  arrow={false}
                  destroyTooltipOnHide={true}
                >
                  <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-colors bg-gray-800 flex items-center justify-center">
                    {fileType === "video" || fileType === "audio" ? (
                      <Play size={14} className="text-white" />
                    ) : (
                      <Image
                        src={imageUrl}
                        alt={`Reference ${index + 1}`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={() => {
                          console.error(
                            `Reference image ${index + 1} failed to load:`,
                            imageUrl,
                          );
                        }}
                      />
                    )}
                  </div>
                </Tooltip>
              );
            })
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
  );
}
