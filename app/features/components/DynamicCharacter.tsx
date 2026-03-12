"use client";

import React from "react";

export default function DynamicCharacter() {
    return (
        <section
            style={{
                width: "100%",
                minHeight: "100vh",
                height: "100vh",
                backgroundImage: "url('/images/feature-page/dynamic-character/bg.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top left",
                backgroundSize: "auto 48%",
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
                    <span style={{ display: 'inline-block', marginRight: 16 }}>Dynamic Character</span>
                    <span
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Performance Engine
                    </span>
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
                            "Animate characters using reference image + driving video",
                            "Realistic full-body gestures and natural movement",
                            "Stable character identity across multiple scenes",
                            "Flexible control of pose, expression, and action",
                        ].map((text, idx) => (
                            <span
                                key={idx}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    background: 'rgba(17, 19, 34, 0.8)',
                                    border: '1px solid rgba(107, 124, 255, 0.3)',
                                    color: '#D1D5DB',
                                    fontWeight: 500,
                                    fontSize: 18,
                                    padding: '12px 32px',
                                    marginRight: 0,
                                    boxShadow: '0 0 16px rgba(107,124,255,0.12)',
                                    gap: 12,
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
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    background: 'rgba(17, 19, 34, 0.8)',
                                    border: '1px solid rgba(107, 124, 255, 0.3)',
                                    color: '#D1D5DB',
                                    fontWeight: 500,
                                    fontSize: 18,
                                    padding: '12px 32px',
                                    marginRight: 0,
                                    boxShadow: '0 0 16px rgba(107,124,255,0.12)',
                                    gap: 12,
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
            {/* 3 Columns Images with motion */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '1600px',
                    margin: '0 auto',
                    padding: '0 24px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 48,
                    marginTop: 0,
                    marginBottom: 48,
                }}
            >
                {/* Image 1 */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src="/images/feature-page/dynamic-character/img1.png"
                        alt="Dynamic Character 1"
                        style={{
                            width: '100%',
                            maxWidth: 480,
                            height: 420,
                            borderRadius: 32,
                            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                            objectFit: 'cover',
                            animation: 'float1 4s ease-in-out infinite',
                        }}
                    />
                </div>
                {/* Image 2 */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src="/images/feature-page/dynamic-character/img2.png"
                        alt="Dynamic Character 2"
                        style={{
                            width: '100%',
                            maxWidth: 480,
                            height: 420,
                            borderRadius: 32,
                            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                            objectFit: 'cover',
                            animation: 'scaleMotion 3.5s ease-in-out infinite',
                        }}
                    />
                </div>
                {/* Image 3 */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src="/images/feature-page/dynamic-character/img3.png"
                        alt="Dynamic Character 3"
                        style={{
                            width: '100%',
                            maxWidth: 480,
                            height: 420,
                            borderRadius: 32,
                            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                            objectFit: 'cover',
                            animation: 'float2 4.5s ease-in-out infinite',
                        }}
                    />
                </div>
            </div>
            {/* Motion styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float1 {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-18px); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes scaleMotion {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.06); }
                }
            `
            }} />
        </section>
    );
}
