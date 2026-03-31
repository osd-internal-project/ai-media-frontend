"use client";

import React from "react";

export default function StunningGeneration() {
    return (
        <section className="w-full py-20 px-6 lg:px-[10%] flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left side text container */}
            <div className="flex-1 flex flex-col max-w-lg z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                        Stunning AI
                    </span>
                    <br /> Image & Video <br /> Generation
                </h2>

                <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light mb-8">
                    Turn your ideas into breathtaking visuals in seconds.
                    Use advanced controls to refine details and maintain
                    composition across your entire project.
                </p>

                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-1 flex-shrink-0">
                            <span className="text-blue-400 text-xs">✓</span>
                        </div>
                        <span className="text-gray-300">High Resolution Outputs up to 4K</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-1 flex-shrink-0">
                            <span className="text-blue-400 text-xs">✓</span>
                        </div>
                        <span className="text-gray-300">Style Consistency and Character Persistence</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-1 flex-shrink-0">
                            <span className="text-blue-400 text-xs">✓</span>
                        </div>
                        <span className="text-gray-300">Rapid Generation speeds optimized for flow</span>
                    </li>
                </ul>
            </div>

            {/* Right side Images representation */}
            <div className="flex-1 relative w-full flex justify-center items-center">
                <div className="relative flex gap-4 pr-10">

                    {/* Before Image */}
                    <div className="relative w-[200px] md:w-[250px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-10 transform -rotate-6 translate-y-4">
                        <img
                            src="/images/herosection/3.png"
                            alt="Before Generation"
                            className="w-full h-full object-cover filter contrast-75 brightness-75 blur-[1px]"
                        />
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs text-white/70">
                            Sketch
                        </div>
                    </div>

                    {/* After Image */}
                    <div className="relative w-[220px] md:w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(99,102,241,0.3)] border border-indigo-500/30 z-20 transform rotate-3 -translate-x-12 -translate-y-8">
                        <img
                            src="/images/herosection/3.png"
                            alt="After Generation"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 bg-indigo-500/80 backdrop-blur px-3 py-1 rounded-full text-xs text-white shadow-lg border border-indigo-400/50">
                            Final Render
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
