"use client";

import React, { useState, useEffect, useRef } from "react";

const tabs = [
  "4K Image Generation",
  "Multi-shot AI Video Creation",
  "Brand-Controlled Prompts",
  "Brand-Controlled Prompts", // duplicated in mockup
  "Enterprise-Grade",
];

export default function GenerateSmarter() {
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
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.15 }
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
        paddingTop: "96px",
        // paddingBottom: "32px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, #080c17 40%, rgba(31, 27, 62, 0.4) 100%)", // Blend into next section
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
          top: "30%",
          left: "70%",
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

      {/* Background Watermark Text */}
      <div
        style={{
          position: "absolute",
          top: "84px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          lineHeight: 0.85,
          width: "100%",
        }}
      >
        <span
          style={{
            fontSize: isMd ? "120px" : "40px",
            fontWeight: 900,
            backgroundImage: "linear-gradient(to right, rgba(135, 206, 250, 0.1), rgba(216, 180, 255, 0.1))",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
        >
          Generate Smarter
        </span>
        <span
          style={{
            fontSize: isMd ? "120px" : "40px",
            fontWeight: 800,
            backgroundImage: "linear-gradient(to right, rgba(135, 206, 250, 0.1), rgba(216, 180, 255, 0.1))",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
        >
          Not Harder.
        </span>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingTop: "64px", // Push the main content down so it perfectly overlaps the middle of the watermark
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: isMd ? "44px" : "28px",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              margin: 0,
            }}
          >
            <span style={{ color: "#ffffff" }}>Generate Smarter.</span>
            <span style={{ color: "#6b7cff" }}>Not Harder.</span>
          </h2>
        </div>

        {/* Tabs / Pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "64px",
            paddingTop: "24px",
          }}
        >
          {tabs.map((tab, i) => (
            <button
              key={i}
              style={{
                padding: "10px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backgroundColor: "transparent",
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "13px",
                fontWeight: 400,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.7 }}
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {tab}
            </button>
          ))}
        </div>

        {/* Masonry Image Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMd ? "repeat(4, 1fr)" : "1fr",
            gap: "16px",
            alignItems: "start",
          }}
        >
          {/* Column 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "16px", overflow: "hidden" }}>
              <img src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/herosection/5.jpeg" alt="Watch" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "16px", overflow: "hidden" }}>
              <img src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/2.jpeg" alt="Portrait" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={(e) => { const v = e.currentTarget.querySelector("video"); if (v) v.play(); }}
              onMouseLeave={(e) => { const v = e.currentTarget.querySelector("video"); if (v) v.pause(); }}
            >
              <video src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/1.mp4" loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "16px", overflow: "hidden" }}>
              <img src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/7.jpg" alt="Face Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden" }}>
              <img src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/6.jpeg" alt="Pig Chef" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "16px", overflow: "hidden", backgroundColor: "#ebd5d5" }}>
              <img src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/3.jpeg" alt="Hummingbird" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden" }}>
              <img src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/8.jpg" alt="Hummingbird" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Column 4 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "16px", overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={(e) => { const v = e.currentTarget.querySelector("video"); if (v) v.play(); }}
              onMouseLeave={(e) => { const v = e.currentTarget.querySelector("video"); if (v) v.pause(); }}
            >
              <video src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/4.mp4" loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "16px", overflow: "hidden" }}>
              <img src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/generate-smarter/5.jpg" alt="Burger" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", pointerEvents: "none" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
