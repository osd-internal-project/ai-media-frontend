"use client";

import React, { useState, useEffect, useRef } from "react";

const features = [
  "Generate human video from a single image",
  "Animate facial expressions naturally",
  "Realistic lip-sync from audio input",
  "Emotion-aware performance generation",
  "Support text prompts for action & style control",
  "Create multi-person dialogue scenes",
  "Ideal for AI spokesperson & presenter videos",
];

export default function UltraRealisticHuman() {
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "148px",
        // paddingBottom: "96px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, #05070a 0%, #0a0c10 40%, #080a0f 100%)", // Matches the deep dark tone
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "15%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "300px",
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 40% 50%, rgba(120,110,255,0.45) 0%, rgba(120,110,255,0.25) 30%, rgba(120,110,255,0.1) 55%, rgba(0,0,0,0) 70%),
            radial-gradient(circle at 70% 50%, rgba(120,180,255,0.35) 0%, rgba(120,180,255,0.15) 35%, rgba(0,0,0,0) 65%)
          `,
          filter: "blur(80px)",
          opacity: 1,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Background Watermark Text - Ultra-Realistic Human */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: 0,
          right: 0,
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          lineHeight: 0.85,
          // paddingLeft: isMd ? "40px" : "16px",
          width: "200%", // Allow text to stretch way off screen like in mockup
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
          Ultra-Realistic Human
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
          AI Generation
        </span>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        {/* Title Text */}
        <h2
          style={{
            fontSize: isMd ? "40px" : "30px",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "4px",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          <span style={{ color: "#ffffff" }}>Ultra-Realistic Human</span>
          <span
            style={{
              background: "linear-gradient(90deg, #7a73ff 0%, #7cd4d8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              marginLeft: isMd ? "16px" : "8px",
            }}
          >
            AI Generation
          </span>
        </h2>

        {/* Content Split: Feature List (Left) + Big Image (Right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMd ? "1fr 1.2fr" : "1fr",
            gap: isMd ? "64px" : "32px",
            alignItems: "center",
          }}
        >
          {/* Left: Description & Feature Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <p
              style={{
                color: "#e2e8f0",
                fontSize: isMd ? "20px" : "16px",
                lineHeight: 1.6,
                fontWeight: 500,
                maxWidth: "450px",
                margin: 0,
              }}
            >
              Create commercial-grade human visuals with exceptional realism and consistency with script-to-human intelligence.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
              {features.map((feat, i) => (
                <li
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    transform: hoveredIndex === i ? "translateX(8px)" : "none",
                    opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.5,
                    transition: "transform 0.3s ease, opacity 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(90deg, #7a73ff 0%, #7cd4d8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontSize: i === 0 ? "22px" : "18px",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    ✔
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                      background: "#ffffff",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Main Highlight Image */}
          <div
            onMouseEnter={(e) => { setIsImageHovered(true); const v = e.currentTarget.querySelector("video"); if (v) v.play(); }}
            onMouseLeave={(e) => { setIsImageHovered(false); const v = e.currentTarget.querySelector("video"); if (v) v.pause(); }}
            style={{
              width: "100%",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              position: "relative",
              display: "flex",
              cursor: "pointer",
              transform: isImageHovered ? "translateY(-10px) scale(1.02)" : "none",
              transition: "transform 0.35s ease, box-shadow 0.35s ease",
            }}
          >
            <video src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/ultra-realistic-human/1.mp4" loop muted playsInline style={{ width: "100%", aspectRatio: "3/3", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
