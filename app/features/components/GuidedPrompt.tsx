"use client";

import React, { useEffect, useRef, useState } from "react";

export default function GuidedPrompt() {
    const [motion, setMotion] = useState([false, false, false]);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!inView) return;

        const t1 = setTimeout(() => setMotion([true, false, false]), 100);
        const t2 = setTimeout(() => setMotion([true, true, false]), 350);
        const t3 = setTimeout(() => setMotion([true, true, true]), 600);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [inView]);

    return (
      <section
    ref={sectionRef}
    className={`w-full min-h-full flex flex-col justify-center px-4 py-8 md:py-16 overflow-visible transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}
    style={{
        backgroundImage: "url('/images/feature-page/guided-prompt/Guided Prompt Builder.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center left",
        backgroundSize: "auto 30%",
    }}
>
            <div className="w-full max-w-[1600px] mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-start">
                
                {/* LEFT */}
                <div className="flex-1 flex flex-col justify-center items-start">
                    <h2 className="text-white font-bold text-3xl md:text-[50px] leading-[120%]">
                        Guided{" "}
                        <span className="bg-gradient-to-r from-indigo-500 to-cyan-300 bg-clip-text text-transparent">
                            Prompt Builder
                        </span>
                    </h2>
                </div>

                {/* RIGHT */}
                <div className="flex-1 relative w-full">
                    
                    <div className="flex flex-col md:flex-row w-full justify-center md:justify-end items-center md:items-stretch gap-4">
                        
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col justify-center gap-4 items-center md:items-start">
                            
                            {/* BOX 1 */}
                            <div
  className="guided-prompt-box w-[90%] max-w-[280px] md:w-[303px] h-[260px] md:h-[313px] bg-[#6366F1] rounded-[32px] shadow-[0_4px_24px_rgba(99,102,241,0.18)] p-6 md:p-8 flex flex-col gap-4 md:gap-5 md:ml-[72px]"
  style={{
    opacity: motion[0] ? 1 : 0,
    transform: motion[0]
      ? "translateY(0) scale(1)"
      : "translateY(40px) scale(0.96)",
  }}
>
                                <span className="text-[#87DDDE] font-bold text-4xl md:text-5xl">01</span>
                                <span className="text-black text-base md:text-xl">
                                    Use dropdown-style presets and branded templates
                                </span>
                            </div>

                            {/* 🔥 BOX 2 (mobile only) */}
                            <div
                                className="guided-prompt-box md:hidden w-[90%] max-w-[280px] h-[260px] bg-[#6366F1] rounded-[32px] p-6 flex flex-col gap-4"
                                style={{
                                    opacity: motion[2] ? 1 : 0,
                                    transform: motion[2]
                                        ? "translateY(0) scale(1)"
                                        : "translateY(40px) scale(0.96)",
                                }}
                            >
                                <span className="text-[#87DDDE] font-bold text-4xl">02</span>
                                <span className="text-black text-base">
                                    Includes auto-suggestions to improve prompt quality
                                </span>
                            </div>

                            {/* BOX 3 */}
                            <div
                                className="guided-prompt-box w-[90%] max-w-[280px] md:w-[303px] h-[260px] md:h-[313px] bg-[#6366F1] rounded-[32px] shadow-[0_4px_24px_rgba(99,102,241,0.18)] p-6 md:p-8 flex flex-col gap-4"
                                style={{
                                    opacity: motion[1] ? 1 : 0,
                                    transform: motion[1]
                                        ? "translateY(0) scale(1)"
                                        : "translateY(40px) scale(0.96)",
                                }}
                            >
                                <span className="text-[#87DDDE] font-bold text-4xl md:text-5xl">03</span>
                                <span className="text-black text-base md:text-xl">
                                    Designed for{" "}
                                    <span className="text-[#87DDDE] font-bold">
                                        non-technical users
                                    </span>
                                    —anyone can generate expert-level results
                                </span>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col justify-center items-center md:items-end">
                            
                            {/* 🔥 BOX 2 (desktop only) */}
                            <div
                                className="guided-prompt-box hidden md:flex w-[303px] h-[313px] bg-[#6366F1] rounded-[32px] shadow-[0_4px_24px_rgba(99,102,241,0.18)] p-8 flex-col gap-5"
                                style={{
                                    opacity: motion[2] ? 1 : 0,
                                    transform: motion[2]
                                        ? "translateY(0) scale(1)"
                                        : "translateY(40px) scale(0.96)",
                                }}
                            >
                                <span className="text-[#87DDDE] font-bold text-5xl">02</span>
                                <span className="text-black text-xl">
                                    Includes auto-suggestions to improve prompt quality
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}