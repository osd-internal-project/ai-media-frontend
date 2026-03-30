"use client";

import React from "react";

export default function ImageGrid() {
    return (
        <section className="relative w-full py-24 flex justify-center items-center overflow-hidden">
            <div className="flex justify-center items-center gap-4 md:gap-8 w-full max-w-7xl px-4 perspective-[1000px]">
                {/* Left Image */}
                <div
                    className="w-1/3 aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105"
                    style={{ transform: "rotateY(15deg) translateZ(-50px)" }}
                >
                    <img
                        src="/images/herosection/1.jpg"
                        alt="Autumn Theme"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Center Image (larger) */}
                <div
                    className="w-[40%] aspect-[4/3] max-w-[400px] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] z-10"
                >
                    <img
                        src="/images/herosection/5.jpeg"
                        alt="Ballerina"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right Image */}
                <div
                    className="w-1/3 aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105"
                    style={{ transform: "rotateY(-15deg) translateZ(-50px)" }}
                >
                    <img
                        src="/images/herosection/2.png"
                        alt="Aurora Theme"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-[#6b7cff]/10 blur-[100px] rounded-[100%] pointer-events-none z-[-1]"></div>
        </section>
    );
}
