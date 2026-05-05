"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function AiCaveMeaning() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [inView, setInView] = useState(false);
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

    return (
        <section
            ref={sectionRef}
            className="w-full py-12 px-4 md:px-6 flex items-center justify-center"
            style={{
                minHeight: "100vh", // ❗ เอา height 100vh ออก
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(32px)",
                transition: "opacity 0.9s ease, transform 0.9s ease",
            }}
        >
            <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-[2%]">
                <div
                    className="
                        w-full 
                        grid grid-cols-1 md:grid-cols-2 
                        gap-6 md:gap-10 
                        items-center
                        p-6 md:p-10 lg:p-14
                        rounded-[24px] md:rounded-[40px]
                    "
                    style={{
                        backgroundImage: "url('/images/feature-page/ai-cave-meaning/bg.webp')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    }}
                >
                    {/* LEFT */}
                    <div className="flex flex-col gap-4 md:gap-6">
                        <h1
                            className="
                                text-[32px] 
                                md:text-[48px] 
                                lg:text-[64px]
                                leading-tight
                                text-white
                                font-bold
                            "
                        >
                            What is AI Cave?
                        </h1>

                        <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] leading-relaxed">
                            <span className="text-[#87DDDE] font-semibold text-[22px] md:text-[32px] lg:text-[48px]">
                                AI Cave
                            </span>{" "}
                            is an enterprise-grade image and video generation platform designed to eliminate content bottlenecks.
                        </p>

                        <p className="text-white text-[16px] md:text-[20px] lg:text-[24px] leading-relaxed">
                            Built on{" "}
                            <span className="text-[#87DDDE] font-semibold">
                                BytePlus AI infrastructure
                            </span>{" "}
                            and localized for{" "}
                            <span className="text-[#87DDDE] font-semibold">
                                Thailand businesses
                            </span>
                            .
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div
                        className="flex justify-center"
                        onMouseEnter={() => setIsImageHovered(true)}
                        onMouseLeave={() => setIsImageHovered(false)}
                    >
                        <Image
                            src="/images/feature-page/ai-cave-meaning/content-img.png"
                            alt="AI Cave Meaning Content"
                            width={620}
                            height={520}
                            
                            // ✅ Lazy load control
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 50vw"

                            className="w-full max-w-[500px] md:max-w-[620px] h-auto object-contain"
                            style={{
                                transform: isImageHovered
                                    ? "translateY(-10px) scale(1.03)"
                                    : "none",
                                transition: "transform 0.4s ease",
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}