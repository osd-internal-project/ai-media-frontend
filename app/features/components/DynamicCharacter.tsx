"use client";

import React, { useEffect, useRef, useState } from "react";

export default function DynamicCharacter() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [hoveredChip, setHoveredChip] = useState<number | null>(null);

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

  const chips = [
    "Animate characters using reference image + driving video",
    "Realistic full-body gestures and natural movement",
    "Stable character identity across multiple scenes",
    "Flexible control of pose, expression, and action",
  ];

  return (
    <section
      ref={sectionRef}
      className={`
        w-full min-h-[100vh] flex flex-col items-center justify-center
        px-4 md:px-6 py-16 overflow-hidden
        transition-all duration-700
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{
        backgroundImage:
          "url('/images/feature-page/dynamic-character/bg.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top left",
        backgroundSize: "auto 30%",
      }}
    >
      <div className="w-full max-w-[1600px] mx-auto mt-8 mb-6">
        {/* TITLE */}
      <h2
  className="
    flex flex-col md:flex-row items-center justify-center text-center
    text-[28px] md:text-[50px]
    leading-[120%] font-bold mb-4 md:mb-8
  "
  style={{ fontFamily: "Clash Display Variable" }}
>
  <span className="md:mr-4 text-white">Dynamic Character</span>
  <span
    style={{
      background:
        "linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Performance Engine
  </span>
</h2>

        {/* MARQUEE */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden h-[36px] md:h-[64px] mt-8 md:mt-12 mb-8 md:mb-14">
  <div className="flex gap-2 md:gap-6 absolute top-0 left-0 h-full whitespace-nowrap animate-marquee">
    {[...chips, ...chips].map((text, idx) => (
      <span
        key={idx}
        onMouseEnter={() => setHoveredChip(idx)}
        onMouseLeave={() => setHoveredChip(null)}
        className="
          flex items-center rounded-full
          px-2.5 md:px-8 py-1 md:py-3
          text-xs md:text-lg
          transition-all duration-300
        "
        style={{
          background:
            hoveredChip === idx
              ? "rgba(99,102,241,0.35)"
              : "rgba(17,19,34,0.8)",
          border: "1px solid rgba(107,124,255,0.3)",
          color: "#D1D5DB",
          boxShadow:
            hoveredChip === idx
              ? "0 0 24px rgba(107,124,255,0.28)"
              : "0 0 16px rgba(107,124,255,0.12)",
          transform:
            hoveredChip === idx
              ? "translateY(-3px) scale(1.02)"
              : "none",
        }}
      >
        <svg
          width="18"
          height="18"
          className="mr-2 md:w-6 md:h-6"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="12" fill="#87DDDE" />
          <path
            d="M7 13.5L10.5 17L17 10"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        {text}
      </span>
    ))}
  </div>
</div>
      </div>

      {/* IMAGES */}
      <div
        className="
          w-full max-w-[1600px] mx-auto
          flex flex-col md:flex-row
          items-center justify-center
          gap-6 md:gap-12
        "
      >
    {["vid1.webm", "vid2.webm", "vid3.webm"].map((vid, i) => (
  <div key={i} className="w-full flex justify-center">
    <video
      src={`/images/feature-page/dynamic-character/${vid}`}
      autoPlay
      loop
      muted
                playsInline
                preload="none"
      className="
        w-[85%] md:w-full
        max-w-[260px] md:max-w-[320px] lg:max-w-[480px]
        h-[160px] md:h-[220px] lg:h-[420px]
        rounded-3xl object-cover
        border-2 border-[#7ed7f6]/40
        bg-black
      "
      style={{
        boxShadow:
          "0 8px 40px 0 rgba(80,120,255,0.18), 0 2px 8px 0 rgba(0,0,0,0.10)",
        animation: "float1 4s ease-in-out infinite",
      }}
    />
  </div>
))}
      </div>

      {/* ANIMATION */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 24s linear infinite;
          }

          @keyframes float1 {
            0%,100% { transform: translateY(0px); }
            50% { transform: translateY(-16px); }
          }
        `,
        }}
      />
    </section>
  );
}