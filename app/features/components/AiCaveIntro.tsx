"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function AiCaveIntro() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [inView, setInView] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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

    return (
        <section
            ref={sectionRef}
            className="w-full py-10 px-4 md:px-6 lg:px-[2%] flex flex-col items-center justify-center bg-no-repeat bg-right bg-contain"
            style={{
                backgroundImage: "url('/images/feature-page/intro/content-bg.png')",
                minHeight: '100vh',
                height: '100vh',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 0.9s ease, transform 0.9s ease',
            }}
        >
            <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-[2%]">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left: Image */}
                    <div
                        className="flex justify-center"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Image
                            src="/images/feature-page/intro/intro-img.png"
                            alt="AI Cave Intro"
                            width={620}
                            height={520}
                            className="w-full h-auto object-contain"
                            style={{
                                animation: "float 6s ease-in-out infinite",
                                transform: isHovered ? "translateY(-10px) scale(1.02)" : "none",
                                transition: "transform 0.4s ease",
                            }}
                        />
                    </div>

                    {/* Right: Content */}
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold">
                            <span className="font-bold" style={{ color: '#6366F1' }}>AI Cave</span>
                            <span className="text-gray-400 font-normal text-lg leading-relaxed"> is a Creative Acceleration Platform that lets your team
                                produce agency-level images and videos in-house—faster, cheaper,
                                and more consistently. Custom-built for businesses, AI Cave
                                includes role management, prompt guidance, and cloud asset
                                storage, making high-quality content creation accessible to
                                everyone.</span>
                        </h2>
                        <p className="text-3xl md:text-4xl " style={{ color: '#6366F1' }}>
                            Let your brand stand out—turn ideas into high-converting visuals
                            in minutes.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
