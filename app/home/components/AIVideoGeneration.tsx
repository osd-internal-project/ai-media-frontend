"use client";

import React, { useState, useEffect, useRef } from "react";

const features = [
  "Turn ideas into high-impact videos - in minutes.",
  "Text-to-Video & Image-to-Video",
  "Multi-scene storytelling",
  "Stable motion & subject consistency",
  "Powered by advanced BytePlus models",
  "Ideal for ads, reels & seasonal campaigns",
  "From storyboard to final video - inside one platform.",
];

export default function AIVideoGeneration() {
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
        background: "linear-gradient(to bottom, #05070a 0%, #0a1118 40%, #05070a 100%)",
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
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 40% 50%, rgba(124,212,216,0.6) 0%, rgba(124,212,216,0.3) 30%, rgba(124,212,216,0.1) 55%, rgba(0,0,0,0) 70%),
            radial-gradient(circle at 70% 50%, rgba(150,230,235,0.5) 0%, rgba(150,230,235,0.2) 35%, rgba(0,0,0,0) 65%)
          `,
          filter: "blur(80px)",
          opacity: 0.9,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "-200px",  // Move left to hide left edge instead of using transform
          width: "800px",
          height: "800px",
          background: "radial-gradient(ellipse at center, rgba(62,130,150,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Background Watermark Text - AI Video Generation */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: 0,
          right: 0,
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          lineHeight: 0.85,
          // paddingLeft: isMd ? "40px" : "16px",
        }}
      >
        <span
          style={{
            fontSize: isMd ? "80px" : "40px",
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.02)",
            letterSpacing: "-0.04em",
          }}
        >
          AI Video
        </span>
        <span
          style={{
            fontSize: isMd ? "80px" : "40px",
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.02)",
            letterSpacing: "-0.04em",
          }}
        >
          Generation
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
            fontSize: isMd ? "36px" : "28px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#7cd4d8" }}>AI Video</span>
          <span style={{ color: "#ffffff" }}>Generation</span>
        </h2>

        {/* Content Split: Big Image + Feature List */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMd ? "1.2fr 1fr" : "1fr",
            gap: isMd ? "64px" : "32px",
            alignItems: "center",
          }}
        >
          {/* Left: Main Highlight Image */}
          <div
            onMouseEnter={(e) => { setIsImageHovered(true); const v = e.currentTarget.querySelector("video"); if (v) v.play(); }}
            onMouseLeave={(e) => { setIsImageHovered(false); const v = e.currentTarget.querySelector("video"); if (v) v.pause(); }}
            style={{
              width: "100%",
              aspectRatio: "16/10",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              position: "relative",
              cursor: "pointer",
              transform: isImageHovered ? "translateY(-10px) scale(1.02)" : "none",
              transition: "transform 0.35s ease, box-shadow 0.35s ease",
            }}
          >
            <video src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/ai-video-generate/1.mp4" loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
          </div>

          {/* Right: Feature Checklist */}
          <div style={{ padding: isMd ? "0 16px" : "0" }}>
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
                      background: "#7cd4d8",
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
        </div>
      </div>
    </section>
  );
}
