"use client";

import React, { useState, useEffect } from "react";

export default function FeaturesHero() {
    const [windowWidth, setWindowWidth] = useState(1200);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMd = windowWidth >= 768;
    const isLg = windowWidth >= 1024;

    return (
        <section
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "112px",
                paddingBottom: "40px",
                paddingLeft: "16px",
                paddingRight: "16px",
                overflow: "hidden",
                backgroundColor: "#0a0a0f",
            }}
        >
            {/* Background Typography */}
            <div
                style={{
                    position: "absolute",
                    top: 0, right: 0, bottom: '40%', left: 0,
                    pointerEvents: "none",
                    // display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflow: "hidden",
                    zIndex: 0,
                    userSelect: "none",
                    fontWeight: "bold",
                    color: "white",
                    lineHeight: 0.85,
                    letterSpacing: "-0.05em",
                    fontFamily: "sans-serif",
                    opacity: 0.03,
                    fontSize: "9vw"
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
                    <span >Empower</span>
                    <span >Your Business</span>
                    <span >with In-House</span>
                    <span >Creative Superpowers</span>
                </div>
            </div>

            {/* Background Image Layer (over text, behind content) */}
            <div
                style={{
                    position: "absolute",
                    top: 0, right: 0, bottom: 0, left: 0,
                    pointerEvents: "none",
                    backgroundImage: 'url("/images/features-hero/bg.png")',
                    backgroundSize: "400px",
                    backgroundPosition: "left 64px",
                    backgroundRepeat: "no-repeat",
                    zIndex: 1,
                }}
            />

            {/* Top-Left Image / Background (bg.png) */}
            {/* <div
                style={{
                    position: "absolute",
                    top: isMd ? "8%" : "10%",
                    left: isMd ? "8%" : "5%",
                    width: "400px",
                    maxWidth: "80vw",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            >
                <img
                    src="/images/features-hero/bg.png"
                    alt="Background elements"
                    style={{ width: "100%", height: "auto", objectFit: "contain" }}
                />
            </div> */}

            {/* Main Content Container */}
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    width: "100%",
                    maxWidth: "1600px",
                    margin: "0 auto",
                    padding: isLg ? "0 2%" : "0 24px",
                    display: "flex",
                    flexDirection: isMd ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "100%",
                }}
            >
                {/* Left Side Content */}
                <div
                    style={{
                        width: isMd ? "55%" : "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        paddingTop: isMd ? "0px" : "40px",
                        zIndex: 20,
                    }}
                >
                    <h1
                        style={{
                            fontSize: isLg ? "2.5rem" : isMd ? "3rem" : "2.25rem",
                            fontWeight: "bold",
                            lineHeight: 1.2,
                            marginBottom: "8px",
                            color: "white",
                            letterSpacing: "-0.025em",
                            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                        }}
                    >
                        Empower Your Business with In-House
                        <br />
                        <span
                            style={{
                                color: "transparent",
                                backgroundImage: "linear-gradient(to right, #6b7cff, #8ae9ff)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                            }}
                        >
                            Creative Superpowers
                        </span>
                    </h1>

                    {/* Arrow + Button */}
                    <div
                        style={{
                            marginTop: "56px",
                            marginLeft: "16px",
                            position: "relative",
                        }}
                    >
                        {/* Handwritten Arrow pointing down-right toward button */}
                        <div
                            style={{
                                position: "absolute",
                                display: isMd ? "block" : "none",
                                top: "-70px",
                                left: "60px",
                                width: "120px",
                                height: "70px"
                            }}
                        >
                            <svg
                                viewBox="0 0 120 70"
                                fill="none"
                                style={{ width: "100%", height: "100%", overflow: "visible" }}
                            >
                                {/* Curvy arrow from top-left toward bottom-right */}
                                <path
                                    d="M 10,50 C 25,48 40,40 40,28 C 40,16 25,16 25,28 C 25,40 55,42 85,56"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    fill="none"
                                    strokeLinecap="round"
                                    opacity="0.85"
                                />
                                {/* Arrowhead */}
                                <path
                                    d="M 76,51 L 85,56 L 81,46"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.85"
                                />
                                {/* "click" label */}
                                <text
                                    x="64"
                                    y="68"
                                    fill="white"
                                    fontSize="15"
                                    fontFamily="'Caveat', cursive, sans-serif"
                                    opacity="0.9"
                                    fontStyle="italic"
                                >
                                    click
                                </text>
                            </svg>
                        </div>

                        {/* Star sparkles */}
                        <div
                            style={{
                                position: "absolute",
                                left: "-16px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "rgba(255, 255, 255, 0.8)",
                                fontSize: "1.25rem",
                                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                            }}
                        >
                            ✦
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                right: "24px",
                                top: "-8px",
                                color: "rgba(255, 255, 255, 0.6)",
                                fontSize: "0.875rem",
                                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                                animationDelay: "0.15s",
                            }}
                        >
                            ✦
                        </div>

                        <button
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                position: "relative",
                                padding: "16px 40px",
                                borderRadius: "9999px",
                                backgroundColor: "rgba(17, 19, 34, 0.8)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                                border: "1px solid rgba(107, 124, 255, 0.3)",
                                overflow: "hidden",
                                boxShadow: isHovered
                                    ? "0 0 40px rgba(107,124,255,0.3)"
                                    : "0 0 30px rgba(107,124,255,0.15)",
                                transition: "all 300ms",
                                cursor: "pointer",
                            }}
                        >
                            {/* Hover effect gradient */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0, right: 0, bottom: 0, left: 0,
                                    backgroundImage: "linear-gradient(to right, rgba(107,124,255,0.2), transparent)",
                                    opacity: isHovered ? 1 : 0,
                                    transition: "opacity 300ms",
                                }}
                            />
                            <span
                                style={{
                                    position: "relative",
                                    zIndex: 10,
                                    color: "#D1D5DB",
                                    fontWeight: 500,
                                    letterSpacing: "0.025em",
                                }}
                            >
                                AI CAVE <span style={{ color: "#6b7cff" }}>Portal</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Right Side Floating Image (group.png) */}
                <div
                    style={{
                        width: isMd ? "45%" : "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        marginTop: isMd ? "0px" : "64px",
                        perspective: "1000px",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: "320px",
                            animation: "float 6s ease-in-out infinite",
                            zIndex: 15,
                        }}
                    >
                        <img
                            src="/images/features-hero/group.png"
                            alt="Features group illustration"
                            style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "contain",
                                filter: "drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))",
                            }}
                        />
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
                    50% { transform: translateY(-14px) rotate(var(--r, 0deg)); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}} />
        </section>
    );
}
