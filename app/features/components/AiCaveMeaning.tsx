"use client";

import React from "react";
import Image from "next/image";

export default function AiCaveMeaning() {
    return (
        <section className="w-full py-10 px-4 md:px-6 lg:px-[2%] flex flex-col items-center justify-center" style={{ minHeight: '100vh', height: '100vh' }}>
            <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-[2%]"  style={{ animation: "float 6s ease-in-out infinite" }}>
                <div
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                    style={{
                        borderRadius: "32px",
                        backgroundImage: "url('/images/feature-page/ai-cave-meaning/bg.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        padding: "48px 32px",
                    }}
                >
                    {/* Left: Title + Paragraph SVGs */}
                    <div className="relative flex flex-col justify-center items-start p-10 md:p-12 gap-6">
                        <h1
                            style={{
                                fontFamily: 'Clash Display Variable',
                                fontWeight: 700,
                                fontStyle: 'Medium',
                                fontSize: '64px',
                                lineHeight: '100%',
                                letterSpacing: '-2%',
                                marginBottom: '12px',
                                color: '#fff',
                            }}
                        >
                            What is AI Cave?
                        </h1>
                        <p
                            style={{
                                fontFamily: 'Clash Display Variable',
                                fontWeight: 400,
                                fontStyle: 'Regular',
                                fontSize: '24px',
                                lineHeight: '139%',
                                letterSpacing: '-2%',
                                color: '#fff',
                                marginBottom: '8px',
                            }}
                        >
                            <span style={{ color: '#87DDDE', borderRadius: '6px', padding: '0 4px', fontWeight: 500, fontSize: '48px' }}>AI Cave</span> is an enterprise-grade image and video generation platform designed to eliminate content bottlenecks and empower marketing, design, and creative teams. Built on <span style={{ color: '#87DDDE', borderRadius: '6px', padding: '0 4px', fontWeight: 500, fontSize: '28px' }}>BytePlus’s top-tier AI infrastructure</span> and localized for <span style={{ color: '#87DDDE', borderRadius: '6px', padding: '0 4px', fontWeight: 500, fontSize: '28px' }}>business use in Thailand</span>, AI Cave removes the technical barrier from AI content creation.
                        </p>
                        <p
                            style={{
                                fontFamily: 'Clash Display Variable',
                                fontWeight: 400,
                                fontStyle: 'Regular',
                                fontSize: '24px',
                                lineHeight: '139%',
                                letterSpacing: '-2%',
                                color: '#fff',
                                marginBottom: '8px',
                            }}
                        >
                            Whether you're a startup or an enterprise, AI Cave is fully <span style={{ color: '#87DDDE', borderRadius: '6px', padding: '0 4px', fontWeight: 500, fontSize: '28px' }}>customizable to your brand’s workflow</span>, tone, and user roles—enabling faster content production and reducing dependence on external agencies.
                        </p>
                    </div>

                    {/* Right: Content Image */}
                    <div className="flex justify-center">
                        <Image
                            src="/images/feature-page/ai-cave-meaning/content-img.png"
                            alt="AI Cave Meaning Content"
                            width={620}
                            height={520}
                            className="w-full h-auto object-contain"
                      
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
