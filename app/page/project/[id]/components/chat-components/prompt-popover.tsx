import React from "react";
import Image from "next/image";
import { CloseOutlined } from "@ant-design/icons";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import { ImageIcon, Lightbulb } from "lucide-react";
import { Button, Tooltip } from "antd";

type Props = {
  promptGuideTemplates: TPromptGuideTemplate[];
  handleUsePromptGuide: (prompt: TPromptGuide) => void;
};

export default function PromptPopover({
  promptGuideTemplates,
  handleUsePromptGuide,
}: Props) {
  return (
    <div className="w-[800px] overflow-y-auto bg-[#1a1b1e] text-gray-200 px-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div></div>
        <Button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#6b7280",
            border: "none",
            background: "transparent",
            padding: 0,
          }}
          className="hover:!text-gray-800 transition-colors"
        >
          <Lightbulb size={14} />
          Prompt manual
        </Button>
      </div>

      <div className=" w-full">
        {promptGuideTemplates.map((template) => (
          <div key={template.id}>
            <div>{template.title}</div>
            <div className="w-full overflow-x-auto">
              {template?.promptGuides ? (
                <div className="flex flex-row gap-2 pb-2">
                  {template.promptGuides.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="w-1/4 min-w-[180px] flex-shrink-0 rounded-xl overflow-hidden relative group cursor-pointer border border-white/10 hover:border-white/20 transition-all"
                      onClick={() => handleUsePromptGuide(prompt)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 relative">
                        {prompt.images && prompt.images.length > 0 ? (
                          <>
                            {/* 1 image: Show full */}
                            {prompt.images.length === 1 && (
                              <Image
                                src={prompt.images[0].url}
                                alt={prompt.title || "Prompt guide"}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            )}

                            {/* 2 images: Split in half side by side */}
                            {prompt.images.length === 2 && (
                              <div className="flex h-full">
                                <div className="relative w-1/2 h-full">
                                  <Image
                                    src={prompt.images[0].url}
                                    alt="Image 1"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="relative w-1/2 h-full">
                                  <Image
                                    src={prompt.images[1].url}
                                    alt="Image 2"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              </div>
                            )}

                            {/* 3+ images: Grid layout - top 2 split, bottom 1 full */}
                            {prompt.images.length >= 3 && (
                              <div className="flex flex-col h-full">
                                {/* Top row: 2 images split in half */}
                                <div className="flex h-1/2">
                                  <div className="relative w-1/2 h-full">
                                    <Image
                                      src={prompt.images[0].url}
                                      alt="Image 1"
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="relative w-1/2 h-full">
                                    <Image
                                      src={prompt.images[1].url}
                                      alt="Image 2"
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                </div>
                                {/* Bottom row: 1 image full width */}
                                <div className="relative w-full h-1/2">
                                  <Image
                                    src={prompt.images[2].url}
                                    alt="Image 3"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-600" />
                          </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

                        {/* Title - Always Visible */}
                        <div className="absolute top-2 left-2 right-2 pointer-events-none">
                          <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md inline-block shadow-sm truncate max-w-full">
                            {prompt.title}
                          </div>
                        </div>

                        {/* Prompt Text - Visible on Hover */}
                        <div className="absolute inset-x-0 bottom-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="bg-black/70 backdrop-blur-md rounded-lg p-2 text-white text-[10px] w-full shadow-lg border border-white/10">
                            <p className="line-clamp-3 leading-relaxed">
                              {prompt.textPrompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No prompt guides found
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
