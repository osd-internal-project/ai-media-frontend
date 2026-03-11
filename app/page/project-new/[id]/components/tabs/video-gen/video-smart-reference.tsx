import React, { useEffect, useState, } from "react";
import { Tooltip } from "antd";
import Image from "next/image"; 
import { Volume2, VolumeX } from "lucide-react";
import { TMasterModelType } from "@/app/common/master-model-type.type";


interface VideoSmartReferenceProps {
    selectedAIModel?: TMasterModelType | null;
    firstFrameImage?: string;
    referenceImages?: string[]; // Reference images used for generation
    resolution?: string;
    ratio?: string;
    duration?: string;
    generateAudio?: boolean;
    isMultiImage?: boolean;
}

export default function VideoSmartReference({
    selectedAIModel,
    referenceImages,
    resolution,
    generateAudio,
    ratio,
    duration,
    isMultiImage,
}: VideoSmartReferenceProps) {
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
                    <span className="text-purple-400 font-medium">
                        {resolution ? getResolutionLabel(resolution) : "Unknown"}
                    </span>{" "}
                    <span className="text-gray-400">
                        {generateAudio ? (
                            <Volume2 className=" text-green-500" />
                        ) : (
                            <VolumeX />
                        )}
                    </span>
                    <span className="text-gray-400">{ratio}</span>
                    <span className="text-gray-400">{duration}s</span>
                    {isMultiImage && (
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center">
                                <span className="text-xs text-white">📷</span>
                            </div>
                            <span className="text-blue-400 text-xs">Multi-image</span>
                        </div>
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
                                            className="max-w-[200px] max-h-[200px] object-contain rounded"
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
    );
};