"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function TeamCollaboration() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const itemDelays = [0, 120, 240];

  return (
    <section
      ref={sectionRef}
      className={`w-full min-h-screen flex justify-center px-4 py-12 md:py-[98px] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        backgroundImage: "url('/images/feature-page/team-collab/bg.svg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left top",
        backgroundSize: "auto 40%",
      }}
    >
      <div className="w-full max-w-[1600px] mx-auto flex flex-col">
        
        {/* TITLE */}
        <h1 className="font-bold text-white leading-[110%] tracking-[-0.02em] mb-8 md:mb-12 text-[32px] md:text-[64px]">
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-300 bg-clip-text text-transparent">
            Team
          </span>
          <span className="ml-2">Collaboration Tools</span>
        </h1>

        {/* 🔥 KEY: column mobile / row desktop */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-[48px] items-center w-full">
          
          {/* LEFT */}
          <div className="flex-1 text-white flex flex-col gap-3 md:gap-4">
            
            {/* ITEM */}
            {[ 
              "Share prompts via one-click",
              "Access shared team libraries and version history",
              "Remix and repurpose content across departments",
            ].map((text, idx) => (
              <React.Fragment key={idx}>
                <div
                  className="rounded-2xl p-4 md:p-6 cursor-pointer transition-all"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(22px)",
                    transition: `opacity 0.7s ease ${itemDelays[idx]}ms, transform 0.7s ease ${itemDelays[idx]}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px) scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(22px)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="text-indigo-500 font-bold text-[28px] md:text-[48px] mb-2 md:mb-3">
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  <div className="text-[16px] md:text-[22px]">
                    {text}
                  </div>
                </div>

                {idx !== 2 && (
                  <hr className="border-t border-indigo-500 mt-4 md:mt-6" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* RIGHT IMAGE */}
          <div
            className="flex-1 flex justify-center items-center w-full"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(32px)",
              transition: `opacity 0.8s ease 360ms, transform 0.8s ease 360ms`,
            }}
          >
            <Image
              src="/images/feature-page/team-collab/img1.png"
              alt="Team Collaboration"
              width={1000}
              height={700}
              className="w-full max-w-[280px] md:max-w-[720px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}