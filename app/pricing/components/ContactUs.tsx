"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Image } from "antd";
const tabs = [
  "4K Image Generation",
  "Multi-shot AI Video Creation",
  "Brand-Controlled Prompts",
  "Brand-Controlled Prompts", // duplicated in mockup
  "Enterprise-Grade",
];

export default function ContactUs() {
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const isMd = windowWidth >= 768;

  return (
    <div
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "10px",
        paddingBottom: "62px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background:
          "linear-gradient(to bottom, #080c17 40%, rgba(31, 27, 62, 0.4) 100%)", // Blend into next section
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}
    >
      {/* Background radial gradient glow */}
      <div
        style={{
          position: "absolute",
          top: "90%",
          left: "0%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "400px",
          borderRadius: "30%",
          background: `
      radial-gradient(circle at 40% 50%, rgba(120,110,255,0.45) 0%, rgba(120,110,255,0.25) 30%, rgba(120,110,255,0.1) 55%, rgba(0,0,0,0) 70%),
      radial-gradient(circle at 70% 50%, rgba(120,180,255,0.35) 0%, rgba(120,180,255,0.15) 35%, rgba(0,0,0,0) 65%)
    `,
          filter: "blur(80px)",
          opacity: 0.9,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Galaxy Plan */}

      {/* Bottom Images & Contacts Section matching reference */}
      <div className="mt-32 max-w-5xl mx-auto relative px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
          {/* Left Image Box */}
          <div className="relative pt-6 pr-6 w-full md:w-auto flex justify-center md:justify-start">
            {/* Dot Grid Background */}
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-40 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#888 3px, transparent 3px)",
                backgroundSize: "24px 24px",
              }}
            ></div>
            <Image
              src="/images/pricing-page/img1.png"
              alt="Creative Tools"
              className="w-[280px] h-[340px] object-cover rounded-[40px] shadow-2xl relative z-10 border-8 border-white"
            />
          </div>

          {/* Center Contact Us */}
          <div className="text-center z-20 space-y-10">
            <div className=" space-y-5">
              <div
                style={{
                  fontWeight: 500,
                  fontSize: "50px",
                  lineHeight: "100%",
                  letterSpacing: "-2%",
                  textAlign: "center",
                }}
              >
                Galaxy Plan
              </div>
              <div
                style={{
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "139%",
                  letterSpacing: "-2%",
                  textAlign: "center",
                }}
              >
                Custom plan for enterpirse
              </div>
            </div>
            <a
              href="/contact-sale"
              className="bg-[#353535] text-white px-10 py-3 rounded-full font-medium text-lg hover:bg-black transition-colors shadow-xl"
            >
              Contact Us
            </a>
          </div>

          {/* Right Image Box */}
          <div className="relative pl-6 pb-6 w-full md:w-auto flex justify-center md:justify-end">
            {/* Gray Circle Background */}
            {/* <div className="absolute bottom-0 right-[-20px] w-48 h-48 bg-[#E5E5E5] rounded-full z-0 pointer-events-none"></div> */}
            <Image
              src="/images/pricing-page/img2.png"
              alt="Ai Generation"
              className="w-[260px] h-[260px] object-cover rounded-[40px] shadow-2xl relative z-10 border-8 border-white"
            />
          </div>
        </div>{" "}
        {/* Bottom Form Actions */}
        {/* <div className="flex flex-wrap justify-center items-center gap-6 mt-32 pb-12">
                <button className="px-12 py-3 rounded-full border-2 border-[#6966FF] text-[#6966FF] font-medium text-[17px] hover:bg-indigo-50 transition-colors">
                  Book a Demo
                </button>
                <button className="px-12 py-3 rounded-full bg-[#6966FF] text-white font-medium text-[17px] hover:bg-[#5A55CC] transition-colors shadow-lg">
                  Contact Sales
                </button>
              </div> */}
      </div>
    </div>
  );
}
