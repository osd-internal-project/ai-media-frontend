"use client";

import React from "react";

export default function InfiniteAesthetics() {
    return (
        <section className="relative w-full py-20 px-6 lg:px-[10%] flex flex-col items-center justify-center">
            <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-12 lg:gap-24">

                {/* Left side text container */}
                <div className="flex-1 max-w-lg bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(99,102,241,0.1)] card-gradient relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                        Infinite Aesthetics
                    </h2>

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                        Our platform offers a limitless supply of styles, patterns, and themes.
                        Whether you are looking for cyberpunk concepts, cinematic photographs,
                        or anime artistry, our AI engine understands your prompts deeply and
                        translates them into visually striking realities.
                    </p>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                        Take full control of lighting, mood, and composition to ensure your
                        visuals perfectly match your brand's unique identity.
                    </p>
                </div>

                {/* Right side image representation */}
                <div className="flex-1 relative w-full h-[400px] flex justify-center items-center">
                    <div className="relative w-[300px] md:w-[350px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <img
                            src="/images/herosection/4.png"
                            alt="Infinite Aesthetics"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent mix-blend-multiply"></div>
                    </div>
                    {/* Glow behind image */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/20 blur-[80px] rounded-full -z-10"></div>
                </div>

            </div>
        </section>
    );
}
