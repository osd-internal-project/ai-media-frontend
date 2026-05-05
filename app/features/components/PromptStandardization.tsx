"use client";

import React, { useRef, useEffect } from "react";

export default function PromptStandardization() {
    const [hoveredChip, setHoveredChip] = React.useState<number | null>(null);

    return (
        <section
            className="w-full min-h-screen h-screen flex flex-col items-center justify-center px-4 py-12 md:py-16 overflow-hidden"
            style={{
                backgroundImage: "url('/images/feature-page/prompt-standardization/bg.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top left",
                backgroundSize: "auto 30%",
            }}
        >
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 mt-8 md:mt-12 mb-6 md:mb-8">
                
                {/* TITLE */}
                <h2 className="text-white font-bold text-[28px] md:text-[50px] leading-[120%] text-center flex items-center justify-center mb-10 md:mb-[72px]">
                    <span className="bg-gradient-to-r from-indigo-500 to-cyan-300 bg-clip-text text-transparent mr-2 md:mr-4">
                        Prompt
                    </span>
                    <span>Standardization</span>
                </h2>

                {/* CHIPS */}
                <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden mb-10 md:mb-14 h-[48px] md:h-[64px]">
                    <div
                        className="flex items-center gap-3 md:gap-6 whitespace-nowrap absolute left-0 top-0 h-full"
                        style={{
                            animation: "marqueeLoop 24s linear infinite",
                        }}
                    >
                        {[
                            "Enforce brand tone, visual style, resolution, and banned terms with AI-powered prompt validation",
                            "Maintain creative control and safety across all content (page 14)",
                            "Enforce brand tone, visual style, resolution, and banned terms with AI-powered prompt validation",
                            "Maintain creative control and safety across all content (page 14)",
                        ].map((text, idx) => (
                            <span
                                key={idx}
                                onMouseEnter={() => setHoveredChip(idx)}
                                onMouseLeave={() => setHoveredChip(null)}
                                className="inline-flex items-center rounded-full border text-gray-300 gap-2 md:gap-3 transition-all"
                                style={{
                                    background:
                                        hoveredChip === idx
                                            ? "rgba(99,102,241,0.35)"
                                            : "rgba(17,19,34,0.8)",
                                    border: "1px solid rgba(107,124,255,0.3)",
                                    fontSize: "14px",
                                    padding: "8px 16px",
                                }}
                            >
                                <svg width="18" height="18" className="md:w-6 md:h-6">
                                    <circle cx="12" cy="12" r="12" fill="#87DDDE" />
                                </svg>
                                <span>{text}</span>
                            </span>
                        ))}

                        {[
                            "Animate characters using reference image + driving video",
                            "Realistic full-body gestures and natural movement",
                            "Stable character identity across multiple scenes",
                            "Flexible control of pose, expression, and action",
                        ].map((text, idx) => (
                            <span
                                key={'loop-'+idx}
                                className="inline-flex items-center rounded-full border text-gray-300 gap-2 md:gap-3"
                                style={{
                                    fontSize: "14px",
                                    padding: "8px 16px",
                                    background: "rgba(17,19,34,0.8)",
                                    border: "1px solid rgba(107,124,255,0.3)",
                                }}
                            >
                                <svg width="18" height="18" className="md:w-6 md:h-6">
                                    <circle cx="12" cy="12" r="12" fill="#87DDDE" />
                                </svg>
                                <span>{text}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* SLIDER */}
            <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden mb-8 md:mb-12">
                <div
                    ref={slider => {
                        if (!slider) return;
                        const s: any = slider;
                        if (s._autoScrollAttached) return;
                        s._autoScrollAttached = true;
                        const interval = setInterval(() => {
                            if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 1) {
                                slider.scrollLeft = 0;
                            } else {
                                slider.scrollLeft += 2;
                            }
                        }, 24);
                        s._autoScrollInterval = interval;
                    }}
                    className="flex gap-3 md:gap-6 overflow-x-auto w-screen pb-2"
                >
                    {[
                        '/images/feature-page/prompt-standardization/img1.png',
                        '/images/feature-page/prompt-standardization/img2.png',
                        '/images/feature-page/prompt-standardization/img3.png',
                        '/images/feature-page/prompt-standardization/img1.png',
                        '/images/feature-page/prompt-standardization/img2.png',
                        '/images/feature-page/prompt-standardization/img3.png',
                    ].map((src, idx) => (
                        <img
                            key={idx}
                            src={src}
                            className="w-[220px] h-[180px] md:w-[386px] md:h-[312px] rounded-[20px] md:rounded-[32px] object-cover flex-shrink-0"
                        />
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marqueeLoop {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `
            }} />
        </section>
    );
}