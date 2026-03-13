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
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "112px",
                paddingBottom: "40px",
                paddingLeft: "16px",
                paddingRight: "16px",
                overflow: "hidden",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(32px)",
                transition: "opacity 0.9s ease, transform 0.9s ease",
            }}
        >
            {/* Full Background Image */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    backgroundImage: 'url("/images/feature-page/features-hero/image1.png")',
                    backgroundSize: "80vw",
                    backgroundPosition: "left top",
                    backgroundRepeat: "no-repeat",
                    zIndex: 0,
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
                    minHeight: "70vh",
                }}
            >
                {/* Left Side Content */}
                <div
                    style={{
                        width: isMd ? "65%" : "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        paddingTop: isMd ? "0px" : "40px",
                        zIndex: 20,
                    }}
                >
                    <h1
                        style={{
                            fontSize: isLg ? "3.5rem" : isMd ? "3rem" : "2.75rem",
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
                        {/* Handwritten Arrow SVG starting at top-right of button */}
                        <div
                            style={{
                                position: "absolute",
                                display: isMd ? "block" : "none",
                                top: "-60px",
                                right: "-100px",
                                width: "160px",
                                height: "100px",
                                pointerEvents: "none",
                                zIndex: 20
                            }}
                        >
                            <img
                                src="/images/feature-page/features-hero/arrow.svg"
                                alt="Arrow pointing to button"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
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
                        width: "auto",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        position: "relative",
                        marginTop: isMd ? "0px" : "64px",
                        perspective: "1000px",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: isLg ? "480px" : isMd ? "400px" : "320px",
                            maxWidth: "100%",
                            animation: "float 6s ease-in-out infinite",
                            zIndex: 15,
                        }}
                    >
                        <img
                            src="/images/feature-page/features-hero/group.png"
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
