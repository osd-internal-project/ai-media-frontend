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
      className={`
        w-full min-h-screen
        flex flex-col
        items-end justify-start
        pt-10 pb-10 md:pt-16 md:pb-16
        px-4 md:px-6
        overflow-hidden
        transition-all duration-700
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{
        backgroundImage: "url('/images/feature-page/ultra-realistic/bg.svg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right top",
        backgroundSize: "auto 30%",
      }}
    >
            {/* Heading on top right */}
          <div className="w-full max-w-[1600px] mx-auto px-2 md:px-6 flex flex-row md:justify-end items-start mt-4 md:mt-8">
        <h2
          className={`
            font-bold
            text-[28px] md:text-[50px]
            leading-[120%]
            text-white
            tracking-tight
            text-right
            flex flex-col items-end
            mr-0 md:mr-16 mb-4 md:mb-8
          `}
          style={{
            fontFamily: "Clash Display Variable",
            fontStyle: "Medium",
          }}
        >
          <span>Ultra-Realistic</span>
          <span
            style={{
              background: "linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AI Humans
          </span>
        </h2>
      </div>
            {/* Columns section below heading */}
             <div className="w-full max-w-[1600px] mx-auto px-2 md:px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Left: bullet list */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-6 justify-center items-start md:ml-16">
          <ul className="list-none p-0 m-0">
            {bullets.map((text, idx) => (
              <li
                key={idx}
                onMouseEnter={() => setHoveredBullet(idx)}
                onMouseLeave={() => setHoveredBullet(null)}
                className={`
                  flex items-start gap-4 mb-4 last:mb-0
                  transition-all duration-300
                  ${hoveredBullet === idx ? "translate-x-2" : ""}
                  ${hoveredBullet !== null && hoveredBullet !== idx ? "opacity-60" : "opacity-100"}
                `}
              >
                <span className="text-[#87DDDE] text-[18px] md:text-[22px] mt-[2px]">✔</span>
                <span className="text-white text-[14px] md:text-[18px] leading-snug">
                  {text}
                </span>
              </li>
            ))}
          </ul>
                </div>
                {/* Right column: image */}
                <div className="flex-1 min-w-0 flex flex-col items-end md:mr-16 justify-center h-full relative mt-8 md:mt-0">
          <video
  src="/images/feature-page/ultra-realistic/content-vid.webm"
  autoPlay
  loop
  muted
  playsInline
  preload="none"
  onMouseEnter={() => setIsImageHovered(true)}
  onMouseLeave={() => setIsImageHovered(false)}
  className={`
    w-[90%] max-w-full max-h-[320px] md:max-h-[480px] rounded-2xl object-cover
    transition-all duration-300
    ${isImageHovered ? "scale-105 -translate-y-2 shadow-2xl" : "shadow-lg"}
  `}
  style={{
    boxShadow: isImageHovered
      ? "0 12px 40px 0 rgba(0,0,0,0.28)"
      : "0 8px 32px 0 rgba(0,0,0,0.18)",
  }}
/>
{/* Small absolute image bottom left */}
<img
  src="/images/feature-page/ultra-realistic/content.webp"
  alt="Ultra Realistic Content Small"
  className="absolute left-0 bottom-0 w-[100px] h-[100px] md:w-[200px] md:h-[200px] rounded-xl object-cover z-20 shadow-md"
/>
        </div>
      </div>
        </section>
    );
}   