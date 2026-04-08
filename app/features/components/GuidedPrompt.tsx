"use client";

import React, { useEffect, useRef, useState } from "react";


export default function GuidedPrompt() {
    // Motion state
    const [motion, setMotion] = useState([false, false, false]);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef<HTMLElement | null>(null);

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

    useEffect(() => {
        if (!inView) return;

        const t1 = setTimeout(() => setMotion([true, false, false]), 100);
        const t2 = setTimeout(() => setMotion([true, true, false]), 350);
        const t3 = setTimeout(() => setMotion([true, true, true]), 600);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [inView]);

    return (
        <section
            ref={sectionRef}
            style={{
                width: "100%",
                minHeight: "100vh",
                height: "100vh",
                backgroundImage: "url('/images/feature-page/guided-prompt/Guided Prompt Builder.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center left",
                backgroundSize: "auto 30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
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
            <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
                {/* Left column: Title */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <h2
                        style={{
                            fontFamily: 'Clash Display Variable',
                            fontWeight: 700,
                            fontStyle: 'Medium',
                            fontSize: '50px',
                            lineHeight: '120%',
                            color: '#fff',
                            letterSpacing: '-2%',
                            textAlign: 'left',
                            marginBottom: 0,
                        }}
                    >
                        Guided <span
                            style={{
                                display: 'inline-block',
                                background: 'linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >Prompt Builder</span>
                    </h2>
                </div>
                {/* Right column: (empty for now) */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%',  justifyContent: 'flex-end', gap: 16}}>
                        {/* Left column: Box 1 & 3 */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                            <div
                                className="guided-prompt-box"
                                style={{
                                    width: 303,
                                    height: 313,
                                    background: '#6366F1',
                                    borderRadius: 32,
                                    boxShadow: '0 4px 24px 0 rgba(99,102,241,0.18)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    color: '#000',
                                    fontWeight: 500,
                                    fontSize: 24,
                                    marginLeft: 72,
                                    marginBottom: 0,
                                    padding: 32,
                                    gap: 18,
                                    transition: 'transform 0.25s cubic-bezier(.4,1,.4,1), box-shadow 0.25s cubic-bezier(.4,1,.4,1), opacity 0.6s cubic-bezier(.4,1,.4,1)',
                                    cursor: 'pointer',
                                    opacity: motion[0] ? 1 : 0,
                                    transform: motion[0] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.04)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(99,102,241,0.28)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = motion[0] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)';
                                    e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(99,102,241,0.18)';
                                }}
                            >
                                <span style={{ color: '#87DDDE', fontWeight: 700, fontSize: 48, }}>01</span>
                                <span>Use dropdown-style presets and branded templates</span>
                            </div>
                            <div
                                className="guided-prompt-box"
                                style={{
                                    width: 303,
                                    height: 313,
                                    background: '#6366F1',
                                    borderRadius: 32,
                                    boxShadow: '0 4px 24px 0 rgba(99,102,241,0.18)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    color: '#000',
                                    fontWeight: 500,
                                    fontSize: 24,
                                    marginLeft: 0,
                                    padding: 32,
                                    gap: 16,
                                    transition: 'transform 0.25s cubic-bezier(.4,1,.4,1), box-shadow 0.25s cubic-bezier(.4,1,.4,1), opacity 0.6s cubic-bezier(.4,1,.4,1)',
                                    cursor: 'pointer',
                                    opacity: motion[1] ? 1 : 0,
                                    transform: motion[1] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.04)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(99,102,241,0.28)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = motion[1] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)';
                                    e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(99,102,241,0.18)';
                                }}
                            >
                                <span style={{ color: '#87DDDE', fontWeight: 700, fontSize: 48 }}>03</span>
                                <span>
                                    Designed for <span style={{ color: '#87DDDE', fontWeight: 700 }}>non-technical users</span>—anyone can generate expert-level results
                                </span>
                            </div>
                        </div>
                        {/* Right column: Box 2 */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                            <div
                                className="guided-prompt-box"
                                style={{
                                    width: 303,
                                    height: 313,
                                    background: '#6366F1',
                                    borderRadius: 32,
                                    boxShadow: '0 4px 24px 0 rgba(99,102,241,0.18)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    color: '#000',
                                    fontWeight: 500,
                                    fontSize: 24,
                                    marginLeft: 0,
                                    marginBottom: 0,
                                    padding: 32,
                                    gap: 18,
                                    transition: 'transform 0.25s cubic-bezier(.4,1,.4,1), box-shadow 0.25s cubic-bezier(.4,1,.4,1), opacity 0.6s cubic-bezier(.4,1,.4,1)',
                                    cursor: 'pointer',
                                    opacity: motion[2] ? 1 : 0,
                                    transform: motion[2] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.04)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(99,102,241,0.28)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = motion[2] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)';
                                    e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(99,102,241,0.18)';
                                }}
                            >
                                <span style={{ color: '#87DDDE', fontWeight: 700, fontSize: 48,}}>02</span>
                                <span>Includes auto-suggestions to improve prompt quality</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
