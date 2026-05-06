"use client";

import React, { useState, useEffect, useRef } from "react";

export default function FeaturesHero() {
    const [windowWidth, setWindowWidth] = useState(1200);
    const [isHovered, setIsHovered] = useState(false);
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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

    const isMd = windowWidth >= 768;
    const isLg = windowWidth >= 1024;

    return (
        <section
            ref={sectionRef}
            className={`relative w-full h-screen flex flex-col items-center overflow-hidden px-4 pt-24 md:pt-[112px] pb-10 transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
            {/* BG */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'url("/images/feature-page/features-hero/image1.png")',
                    backgroundSize: isMd ? "80vw" : "140vw",
                    backgroundPosition: "left top",
                    backgroundRepeat: "no-repeat",
                    zIndex: 0,
                }}
            />

            {/* MAIN */}
            <div
                className="relative z-10 w-full max-w-[1600px] mx-auto flex items-center justify-between min-h-[70vh] px-4 md:px-6"
                style={{
                    flexDirection: isMd ? "row" : "column",
                }}
            >
                {/* LEFT */}
                <div
                    className="flex flex-col items-start w-full md:w-[65%]"
                    style={{
                        paddingTop: isMd ? "0px" : "24px",
                    }}
                >
                    <h1
                        className="font-bold text-white leading-tight mb-2 md:mb-2"
                        style={{
                            fontSize: isLg ? "3.5rem" : isMd ? "3rem" : "2rem",
                            letterSpacing: "-0.025em",
                            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                        }}
                    >
                        Empower Your Business with In-House
                        <br />
                        <span className="bg-gradient-to-r from-indigo-500 to-cyan-300 bg-clip-text text-transparent">
                            Creative Superpowers
                        </span>
                    </h1>

                    {/* BUTTON */}
                    <div className="mt-10 md:mt-14 ml-2 md:ml-4 relative">
                        
                        {/* ARROW (hide mobile) */}
                        <div className="hidden md:block absolute top-[-60px] right-[-100px] w-[160px] h-[100px] pointer-events-none z-20">
                            <img
                                src="/images/feature-page/features-hero/arrow.svg"
                                alt="arrow"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* SPARKLES */}
                        <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 text-white/80 text-sm md:text-base animate-pulse">
                            ✦
                        </div>

                        <button
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="relative px-6 md:px-10 py-3 md:py-4 rounded-full backdrop-blur-md border transition-all"
                            style={{
                                backgroundColor: "rgba(17, 19, 34, 0.8)",
                                border: "1px solid rgba(107,124,255,0.3)",
                                boxShadow: isHovered
                                    ? "0 0 40px rgba(107,124,255,0.3)"
                                    : "0 0 30px rgba(107,124,255,0.15)",
                            }}
                        >
                            <span className="text-sm md:text-base text-gray-300 font-medium">
                                AI CAVE <span className="text-indigo-400">Portal</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* RIGHT IMAGE */}
                <div
                    className="flex justify-center md:justify-end items-center w-full mt-10 md:mt-0"
                    style={{
                        perspective: "1000px",
                    }}
                >
                    <div
                        style={{
                            width: isLg ? "480px" : isMd ? "400px" : "260px",
                            animation: "float 6s ease-in-out infinite",
                        }}
                    >
                        <img
                            src="/images/feature-page/features-hero/group.png"
                            alt="hero"
                            className="w-full h-auto object-contain"
                            style={{
                                filter: "drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))",
                            }}
                        />
                    </div>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-14px); }
                    }
                `,
                }}
            />
        </section>
    );
}