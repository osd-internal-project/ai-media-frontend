"use client";

import React, { useEffect, useRef, useState } from "react";

export default function UltraRealistic() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [inView, setInView] = useState(false);
    const [hoveredBullet, setHoveredBullet] = useState<number | null>(null);
    const [isImageHovered, setIsImageHovered] = useState(false);

    useEffect(() => {
        if (!sectionRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const bullets = [
        "Create expressive, lifelike human videos from minimal input.",
        "Generate human video from a single reference image",
        "Audio-driven lip sync with natural facial movement",
        "Emotion-aware expressions and gestures",
        "Support multi-person dialogue scenes",
        "Optional prompt control for style and camera direction",
        "Maintain consistent character identity across scenes",
    ];

    return (
        <section
            ref={sectionRef}
            style={{
                width: "100vw",
                minHeight: "100vh",
                height: "100vh",
                backgroundImage: "url('/images/feature-page/ultra-realistic/bg.svg')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right top",
                backgroundSize: "auto 30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                paddingTop: "64px",
                paddingBottom: "64px",
                paddingLeft: "16px",
                paddingRight: "16px",
                overflow: "hidden",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(32px)",
                transition: "opacity 0.9s ease, transform 0.9s ease",
            }}
        >
            {/* Heading on top right */}
            <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start', marginTop: 32 }}>
                <h2
                    style={{
                        fontFamily: 'Clash Display Variable',
                        fontWeight: 700,
                        fontStyle: 'Medium',
                        fontSize: '50px',
                        lineHeight: '120%',
                        color: '#fff',
                        letterSpacing: '-2%',
                        textAlign: 'right',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        marginRight: 64,
                        marginBottom: 32,
                    }}
                >
                    <span style={{ display: 'block' }}>Ultra-Realistic</span>
                    <span
                        style={{
                            display: 'block',
                            background: 'linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        AI Humans
                    </span>
                </h2>
            </div>
            {/* Columns section below heading */}
            <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Left column: bullet list */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 64 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {bullets.map((text, idx) => (
                            <li
                                key={idx}
                                onMouseEnter={() => setHoveredBullet(idx)}
                                onMouseLeave={() => setHoveredBullet(null)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 16,
                                    marginBottom: idx === bullets.length - 1 ? 0 : 18,
                                    transform: hoveredBullet === idx ? 'translateX(8px)' : 'none',
                                    opacity: hoveredBullet === null || hoveredBullet === idx ? 1 : 0.6,
                                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                                }}
                            >
                                <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                                <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                    {text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Right column: image */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 64, justifyContent: 'center', height: '100%', position: "relative",
                overflow: "hidden", }}>
                    <img 
                        src={"/images/feature-page/ultra-realistic/content.png"}
                        alt="Ultra Realistic Content"
                        onMouseEnter={() => setIsImageHovered(true)}
                        onMouseLeave={() => setIsImageHovered(false)}
                        style={{
                            width: '90%',
                            height: '90%',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            borderRadius: '32px',
                            boxShadow: isImageHovered ? '0 12px 40px 0 rgba(0,0,0,0.28)' : '0 8px 32px 0 rgba(0,0,0,0.18)',
                            objectFit: 'cover',
                            transform: isImageHovered ? 'translateY(-12px) scale(1.03)' : 'none',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        }}
                    />
                    {/* Small absolute image bottom left in this column */}
                    <img
                        src={"/images/feature-page/ultra-realistic/content.png"}
                        alt="Ultra Realistic Content Small"
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            width: 200,
                            height: 200,
                            borderRadius: 18,
                            boxShadow: '0 4px 16px 0 rgba(0,0,0,0.14)',
                            objectFit: 'cover',
                            zIndex: 2,
                        }}
                    />
                </div>
            </div>
        </section>
    );
}   