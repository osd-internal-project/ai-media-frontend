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
    <div className="w-full  bg-[#18181b] text-zinc-200 px-6 py-4 rounded-xl border border-white/10 shadow-2xl custom-scrollbar">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4  top-0 bg-[#18181b] z-10">
        <div className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></span>
          Prompt Templates
        </div>
        <Button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#EAB308",
            // border: "1px solid rgba(234, 179, 8, 0.2)",
            // background: "rgba(234, 179, 8, 0.1)",
            padding: "4px 12px",
            borderRadius: "9999px",
            height: "28px",
          }}
          type="link"
          className="hover:!text-yellow-300 transition-all duration-300"
        >
          <Lightbulb size={14} strokeWidth={2.5} />
          <span className="font-semibold tracking-wide">Prompt Manual</span>
        </Button>
      </div>
      {promptGuideTemplates.length > 0 ? (
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-8 pb-4 ">
          {promptGuideTemplates.map((template) => (
            <div key={template.id} className="relative">
              <div className="flex items-center gap-2 mb-3 sticky left-0">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  {template.title}
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>

              <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                {template?.promptGuides ? (
                  <div className="flex flex-row gap-3">
                    {template.promptGuides.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="w-48 min-w-[192px] flex-shrink-0 rounded-lg overflow-hidden relative group cursor-pointer border border-white/5 bg-zinc-900/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => handleUsePromptGuide(prompt)}
                      >
                        <div className="aspect-[3/2] relative overflow-hidden">
                          {prompt.images && prompt.images.length > 0 ? (
                            <>
                              {/* 1 image: Show full */}
                              {prompt.images.length === 1 && (
                                <Image
                                  src={prompt.images[0].url}
                                  alt={prompt.title || "Prompt guide"}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                                  unoptimized
                                />
                              )}

                              {/* 2 images: Split in half side by side */}
                              {prompt.images.length === 2 && (
                                <div className="flex h-full group-hover:scale-105 transition-transform duration-700">
                                  <div className="relative w-1/2 h-full border-r border-black/20">
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

                              {/* 3+ images: Grid layout */}
                              {prompt.images.length >= 3 && (
                                <div className="flex flex-col h-full group-hover:scale-105 transition-transform duration-700">
                                  <div className="flex h-1/2 border-b border-black/20">
                                    <div className="relative w-1/2 h-full border-r border-black/20">
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
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                              <ImageIcon className="w-8 h-8 text-zinc-600" />
                            </div>
                          )}

                          {/* Dark Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Content Container */}
                          <div className="absolute inset-0 p-3 flex flex-col justify-end">
                            {/* Title - Moves up on hover */}
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-10">
                              <h4 className="text-white text-xs font-bold leading-tight drop-shadow-md line-clamp-1 group-hover:line-clamp-none mb-1">
                                {prompt.title}
                              </h4>
                            </div>

                            {/* Trigger for text reveal */}
                            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                              <p className="text-[10px] text-zinc-300 leading-relaxed line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                {prompt.textPrompt}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-zinc-600 py-8 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
                    <p className="text-sm">No prompt guides available</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-zinc-600 py-8 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
          <p className="text-sm">Loading...</p>
        </div>
      )}
    </div>
  );
}
