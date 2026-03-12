"use client";

import React from "react";

export default function UltraRealistic() {
    return (
        <section
            style={{
                width: "100%",
                minHeight: "100vh",
                height: "100vh",
                backgroundImage: "url('/images/feature-page/ultra-realistic/bg.svg')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right top",
                backgroundSize: "auto 48%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                paddingTop: "64px",
                paddingBottom: "64px",
                paddingLeft: "16px",
                paddingRight: "16px",
                overflow: "hidden",
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
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                            <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                            <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                Create expressive, lifelike human videos from minimal input.
                            </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                            <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                            <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                Generate human video from a single reference image
                            </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                            <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                            <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                Audio-driven lip sync with natural facial movement
                            </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                            <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                            <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                Emotion-aware expressions and gestures
                            </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                            <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                            <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                Support multi-person dialogue scenes
                            </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                            <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                            <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                Optional prompt control for style and camera direction
                            </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
                            <span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
                                Maintain consistent character identity across scenes
                            </span>
                        </li>
                    </ul>
                </div>
                {/* Right column: image */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 64, justifyContent: 'center', height: '100%', position: "relative",
                overflow: "hidden", }}>
                    <img 
                        src={"/images/feature-page/ultra-realistic/content.png"}
                        alt="Ultra Realistic Content"
                        style={{
                            width: '90%',
                            height: '90%',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            borderRadius: '32px',
                            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                            objectFit: 'cover',
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