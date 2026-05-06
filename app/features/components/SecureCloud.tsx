"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function SecureCloud() {
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

  const cardDelays = [0, 120, 240];

  return (
    <section
      ref={sectionRef}
      className={`w-full min-h-screen flex justify-center px-4 py-12 md:py-[80px] transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        background: `url('/images/feature-page/secure-cloud/bg.png') left top no-repeat`,
        backgroundSize: "auto 40%",
      }}
    >
      <div className="w-full max-w-[1400px] flex flex-col">
        
        {/* 🔥 GRID → mobile = column */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 md:gap-[80px] items-center">
          
          {/* LEFT */}
          <div className="flex flex-col items-start">
            
            <h2 className="text-white font-bold leading-[110%] mb-6 md:mb-12 text-[28px] md:text-[52px]">
              Secure Cloud{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-300 bg-clip-text text-transparent">
                Media Library
              </span>
            </h2>

            <div className="rounded-[20px] md:rounded-[28px] overflow-hidden w-full max-w-[320px] md:max-w-[640px]">
              <Image
                src="/images/feature-page/secure-cloud/img1.png"
                alt="Gallery"
                width={900}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="relative w-full h-auto md:w-[640px] md:h-[720px] flex flex-col md:block gap-4"
          >

            {/* 🔥 MOBILE = stacked / DESKTOP = absolute */}

            {/* CARD 01 */}
            <div
              className="md:absolute w-full md:w-[345px] h-auto md:h-[346px] p-5 md:p-[48px] rounded-[24px] md:rounded-[32px] bg-black text-white flex flex-col gap-3"
              style={{
                top: 0,
                left: 0,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.7s ease ${cardDelays[0]}ms`,
              }}
            >
              <div className="text-indigo-500 font-bold text-[28px] md:text-[48px]">01</div>
              <div className="text-[18px] md:text-[32px]">
                Store all generated content in the cloud
              </div>
            </div>

            {/* CARD 02 */}
            <div
              className="md:absolute w-full md:w-[345px] h-auto md:h-[346px] p-5 md:p-[48px] rounded-[24px] md:rounded-[32px] bg-indigo-500 text-white flex flex-col gap-3"
              style={{
                top: "65px",
                left: "292px",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.7s ease ${cardDelays[1]}ms`,
              }}
            >
              <div className="text-cyan-300 font-bold text-[28px] md:text-[48px]">02</div>
              <div className="text-[18px] md:text-[32px]">
                Maintain access for at <b className="text-cyan-300">least 3</b> months
              </div>
            </div>

            {/* CARD 03 */}
            <div
              className="md:absolute w-full md:w-[345px] h-auto md:h-[346px] p-5 md:p-[48px] rounded-[24px] md:rounded-[32px] bg-cyan-300 text-black flex flex-col gap-3"
              style={{
                top: "346px",
                left: "50px",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.7s ease ${cardDelays[2]}ms`,
              }}
            >
              <div className="font-bold text-[28px] md:text-[48px]">03</div>
              <div className="text-[18px] md:text-[32px]">
                Easy retrieval and reuse for campaigns
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}