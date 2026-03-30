"use client";

import React, { useState } from "react";

export default function FeaturesCTA() {
    const [hoveredBtn, setHoveredBtn] = useState<number | null>(null);

    return (
        <section className="relative w-full py-32 px-6 flex justify-center items-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[800px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Ready to take your Visuals <br /> to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Next Level?</span>
                </h2>
                <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl">
                    Join thousands of creators and businesses scaling their content production with our advanced AI media platform.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button
                        onMouseEnter={() => setHoveredBtn(1)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        className="w-full sm:w-auto px-8 py-4 rounded-full text-white font-medium transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        style={{
                            backgroundColor: hoveredBtn === 1 ? "#5b61e0" : "#6c72ff",
                        }}
                    >
                        Start Creating Now
                    </button>

                    <button
                        onMouseEnter={() => setHoveredBtn(2)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        className="w-full sm:w-auto px-8 py-4 rounded-full text-white font-medium transition-all duration-200 border"
                        style={{
                            borderColor: hoveredBtn === 2 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                            backgroundColor: hoveredBtn === 2 ? "rgba(255,255,255,0.05)" : "transparent",
                        }}
                    >
                        Contact Sales
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    No credit card required for 7-day free trial.
                </p>
            </div>
        </section>
    );
}
