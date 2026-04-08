"use client";

import React, { useState, useEffect } from "react";

const features = [
  "Commercial-Ready Visuals at Scale",
  "Generate high-resolution visuals tailored to your brand.",
  "Text-to-Image & Image-to-Image",
  "Generate up to 10 images simultaneously",
  "Product mockups & campaign creatives",
  "Brand-aligned style enforcement",
  "Built-in Prompt Guide & Templates",
  "Create A/B variations instantly.",
  "Maintain visual consistency across campaigns.",
];

export default function AIImageGeneration() {
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMd = windowWidth >= 768;

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "148px",
        // paddingBottom: "10px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, rgba(31, 27, 62, 0.4) 0%, #0a0d14 50%, #05070a 100%)",
        overflow: "hidden",
      }}
    >
      {/* Background radial gradient glow (Added separately so it doesn't blur the text) */}
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
            radial-gradient(circle at 40% 50%, rgba(120,110,255,0.45) 0%, rgba(120,110,255,0.25) 30%, rgba(120,110,255,0.1) 55%, rgba(0,0,0,0) 70%),
            radial-gradient(circle at 70% 50%, rgba(120,180,255,0.35) 0%, rgba(120,180,255,0.15) 35%, rgba(0,0,0,0) 65%)
          `,
          filter: "blur(80px)",
          opacity: 1,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Background Watermark Text - All Image Generation */}
      <div
        style={{
          position: "absolute",
          top: "18%",
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
            color: "rgba(120, 180, 255, 0.08)",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
        >
          All Image
        </span>
        <span
          style={{
            fontSize: isMd ? "80px" : "40px",
            fontWeight: 800,
            color: "rgba(120, 180, 255, 0.08)",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
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
          gap: "64px",
        }}
      >
        {/* Top Row: Title + Header Images Row */}
        <div
          style={{
            display: "flex",
            flexDirection: isMd ? "row" : "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
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
            <span style={{ color: "#4f46e5" }}>AI Image</span>
            <span style={{ color: "#ffffff" }}>Generation</span>
          </h2>

          {/* Top Pill Images Area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flex: 1,
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <div
              style={{
                width: isMd ? "75%" : "85%",
                height: "96px",
                borderRadius: "48px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                position: "relative",
              }}
            >
              <img
                src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/ai-image-generation/2.png"
                alt="AI Generation Eyes"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
              />
            </div>
            <div
              style={{
                width: "72px",
                height: "96px",
                borderRadius: "36px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <img
                src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/ai-image-generation/3.png"
                alt="AI Generation Glow"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "95% 40%" }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Split: Big Image + Feature List */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMd ? "1fr 1fr" : "1fr",
            gap: isMd ? "64px" : "32px",
            alignItems: "center",
          }}
        >
          {/* Left: Main Main Highlight Image */}
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              position: "relative",
            }}
          >
            <img
              src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/ai-image-generation/1.jpeg"
              alt="Main AI Artwork Highlight"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Right: Feature Checklist */}
          <div style={{ padding: isMd ? "0 32px" : "0" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
              {features.map((feat, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4 8L11 1" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    style={{
                      color: "#e2e8f0",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: 1.5,
                      letterSpacing: "0.01em",
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
