"use client";

import React, { useRef, useEffect } from "react";

export default function PromptStandardization() {
    const [hoveredChip, setHoveredChip] = React.useState<number | null>(null);
    return (
        <section
            style={{
                width: "100%",
                minHeight: "100vh",
                height: "100vh",
                backgroundImage: "url('/images/feature-page/prompt-standardization/bg.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top left",
                backgroundSize: "auto 30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "64px",
                paddingBottom: "64px",
                paddingLeft: "16px",
                paddingRight: "16px",
                overflow: "hidden",
            }}
        >
            <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 24px', marginTop: 48, marginBottom: 32 }}>
                <h2
                    style={{
                        fontFamily: 'Clash Display Variable',
                        fontWeight: 700,
                        fontStyle: 'Medium',
                        fontSize: '50px',
                        lineHeight: '120%',
                        color: '#fff',
                        letterSpacing: '-2%',
                        textAlign: 'center',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 72,
                        width: '100%',
                    }}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginRight: 16,
                        }}
                    >
                        Prompt
                    </span>
                    <span style={{ display: 'inline-block', color: '#fff' }}>Standardization</span>
                </h2>
                {/* Chips/Tags Marquee */}
                <div
                    style={{
                        position: 'relative',
                        width: '100vw',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        overflow: 'hidden',
                        marginTop: 0,
                        marginBottom: 56,
                        height: 64,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 24,
                            whiteSpace: 'nowrap',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            animation: 'marqueeLoop 24s linear infinite',
                        }}
                    >
                        {[
                            "Enforce brand tone, visual style, resolution, and banned terms with AI-powered prompt validation",
                            "Maintain creative control and safety across all content (page 14)",
                            "Enforce brand tone, visual style, resolution, and banned terms with AI-powered prompt validation",
                            "Maintain creative control and safety across all content (page 14)",
                        ].map((text, idx) => (
                            <span
                                key={idx}
                                onMouseEnter={() => setHoveredChip(idx)}
                                onMouseLeave={() => setHoveredChip(null)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    background: hoveredChip === idx ? 'rgba(99, 102, 241, 0.35)' : 'rgba(17, 19, 34, 0.8)',
                                    border: '1px solid rgba(107, 124, 255, 0.3)',
                                    color: '#D1D5DB',
                                    fontWeight: 500,
                                    fontSize: 18,
                                    padding: '12px 32px',
                                    marginRight: 0,
                                    boxShadow: hoveredChip === idx ? '0 0 24px rgba(107,124,255,0.28)' : '0 0 16px rgba(107,124,255,0.12)',
                                    gap: 12,
                                    transform: hoveredChip === idx ? 'translateY(-4px) scale(1.02)' : 'none',
                                    transition: 'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                                }}
                            >
                                {/* Tick icon SVG */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="12" fill="#87DDDE" />
                                    <path d="M7 13.5L10.5 17L17 10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{text}</span>
                            </span>
                        ))}
                        {/* Duplicate chips for seamless loop */}
                        {[
                            "Animate characters using reference image + driving video",
                            "Realistic full-body gestures and natural movement",
                            "Stable character identity across multiple scenes",
                            "Flexible control of pose, expression, and action",
                        ].map((text, idx) => (
                            <span
                                key={'loop-'+idx}
                                onMouseEnter={() => setHoveredChip(idx+4)}
                                onMouseLeave={() => setHoveredChip(null)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    background: hoveredChip === idx+4 ? 'rgba(99, 102, 241, 0.35)' : 'rgba(17, 19, 34, 0.8)',
                                    border: '1px solid rgba(107, 124, 255, 0.3)',
                                    color: '#D1D5DB',
                                    fontWeight: 500,
                                    fontSize: 18,
                                    padding: '12px 32px',
                                    marginRight: 0,
                                    boxShadow: hoveredChip === idx+4 ? '0 0 24px rgba(107,124,255,0.28)' : '0 0 16px rgba(107,124,255,0.12)',
                                    gap: 12,
                                    transform: hoveredChip === idx+4 ? 'translateY(-4px) scale(1.02)' : 'none',
                                    transition: 'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="12" fill="#87DDDE" />
                                    <path d="M7 13.5L10.5 17L17 10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{text}</span>
                            </span>
                        ))}
                    </div>
                    {/* Marquee loop animation style */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes marqueeLoop {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                    `
                    }} />
                </div>
            </div>
            {/* Slider Images */}
            {/* Slider Images with auto scroll and no side padding */}
            <div
                style={{
                    width: '100vw',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    position: 'relative',
                    marginTop: 0,
                    marginBottom: 48,
                    overflow: 'hidden',
                }}
            >
                <div
                    ref={slider => {
                        if (!slider) return;
                        const s: any = slider;
                        if (s._autoScrollAttached) return;
                        s._autoScrollAttached = true;
                        let scrollAmount = 0;
                        const scrollStep = 2;
                        const interval = setInterval(() => {
                            if (!slider) return;
                            if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 1) {
                                slider.scrollLeft = 0;
                                scrollAmount = 0;
                            } else {
                                slider.scrollLeft += scrollStep;
                                scrollAmount += scrollStep;
                            }
                        }, 24);
                        s._autoScrollInterval = interval;
                    }}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 24,
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        paddingBottom: 8,
                        width: '100vw',
                    }}
                >
                    {[
                        '/images/feature-page/prompt-standardization/img1.png',
                        '/images/feature-page/prompt-standardization/img2.png',
                        '/images/feature-page/prompt-standardization/img3.png',
                        '/images/feature-page/prompt-standardization/img1.png',
                        '/images/feature-page/prompt-standardization/img2.png',
                        '/images/feature-page/prompt-standardization/img3.png',
                    ].map((src, idx) => (
                        <img
                            key={idx}
                            src={src}
                            alt={`Dynamic Character ${idx+1}`}
                            style={{
                                width: 386,
                                height: 312,
                                borderRadius: 32,
                                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                                objectFit: 'cover',
                                opacity: 1,
                                transform: 'rotate(0deg)',
                                flexShrink: 0,
                                transition: 'transform 0.3s cubic-bezier(.4,1,.4,1), box-shadow 0.3s cubic-bezier(.4,1,.4,1)',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.04)';
                                e.currentTarget.style.boxShadow = '0 16px 48px 0 rgba(0,0,0,0.28)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'rotate(0deg)';
                                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.18)';
                            }}
                        />
                    ))}
                </div>
                {/* Hide scrollbar style */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                        .slider-hide-scrollbar::-webkit-scrollbar { display: none; }
                        .slider-hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                    `
                }} />
            </div>
        </section>
    );
}
