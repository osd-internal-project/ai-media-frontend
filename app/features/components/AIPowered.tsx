"use client";

import React from "react";

export default function AIPowered() {
    return (
        <section className="w-full py-20 px-6 lg:px-[10%] flex flex-col items-center justify-center">
            <div className="text-center mb-16 relative">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                        AI Powered
                    </span>{" "}
                    Creation Tools
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Scale your content production effortlessly. Our suite of AI tools enables you to turn simple text prompts into complex, high-fidelity media assets.
                </p>

                {/* Glow behind title */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[150%] bg-indigo-500/10 blur-[80px] rounded-full -z-10"></div>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left column Content */}
                <div className="space-y-6">
                    {/* Detail item 1 */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                        <h3 className="text-xl font-semibold text-white mb-2">Prompt Optimization</h3>
                        <p className="text-gray-400 text-sm">
                            Our smart prompt assistant enhances your inputs to guarantee the best possible output from our models.
                        </p>
                    </div>

                    {/* Detail item 2 text with active style */}
                    <div className="bg-indigo-600/20 border border-indigo-500/30 p-6 rounded-2xl backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <h3 className="text-xl font-semibold text-indigo-300 mb-2">Rapid Iteration</h3>
                        <p className="text-indigo-200/80 text-sm">
                            Generate variations of your image instantly. Modify elements, change styles, or upscale with a single click.
                        </p>
                    </div>

                    {/* Detail item 3 */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                        <h3 className="text-xl font-semibold text-white mb-2">Asset Management</h3>
                        <p className="text-gray-400 text-sm">
                            Automatically organize your generated content with smart tagging and project-based folders.
                        </p>
                    </div>
                </div>

                {/* Right column Images */}
                <div className="relative w-full h-[500px] flex justify-center items-center">

                    <div className="absolute w-[240px] md:w-[280px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform rotate-[-8deg] -translate-x-12 translate-y-6">
                        <img src="/images/herosection/2.png" alt="Feature Graphic 1" className="w-full h-full object-cover" />
                    </div>

                    <div className="absolute w-[260px] md:w-[320px] aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(30,58,138,0.5)] border border-indigo-400/30 transform rotate-6 translate-x-12 -translate-y-6 z-10">
                        <img src="/images/herosection/1.jpg" alt="Feature Graphic 2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent"></div>
                    </div>

                </div>
            </div>
        </section>
    );
}
