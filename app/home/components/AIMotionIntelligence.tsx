"use client";

import React, { useState, useEffect } from "react";

const features = [
  "Turn ideas into high-impact videos - in minutes.",
  "Text-to-Video & Image-to-Video",
  "Multi-scene storytelling",
  "Stable motion & subject consistency",
  "Powered by advanced BytePlus models",
  "Ideal for ads, reels & seasonal campaigns",
  "From storyboard to final video - inside one platform.",
];

export default function AIMotionIntelligence() {
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
        // paddingBottom: "96px",
        paddingLeft: "16px",
        paddingRight: "16px",
        // Blends vertically from the previous section
        background: "linear-gradient(to bottom, #05070a 0%, #0a0e14 40%, #080a0f 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "70%",
          transform: "translate(-50%, -50%)",
          width: "800px",
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
      {/* Background Watermark Text - AI Motion Intelligence */}
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
          lineHeight: 0.9,
          // paddingLeft: isMd ? "40px" : "16px",
          width: "200%", // Stretch off-screen
        }}
      >
        <span
          style={{
            fontSize: isMd ? "100px" : "40px",
            fontWeight: 900,
            backgroundImage: "linear-gradient(to right, rgba(135, 206, 250, 0.1), rgba(216, 180, 255, 0.1))",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
        >
          AI Motion Intelligence for
        </span>
        <span
          style={{
            fontSize: isMd ? "100px" : "40px",
            fontWeight: 900,
            backgroundImage: "linear-gradient(to right, rgba(135, 206, 250, 0.1), rgba(216, 180, 255, 0.1))",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}
        >
          Digital Characters
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
        {/* Top Row: Title + Thumbnail Pills */}
        <div
          style={{
            display: "flex",
            flexDirection: isMd ? "row" : "column",
            justifyContent: "space-between",
            alignItems: isMd ? "flex-end" : "flex-start",
            gap: "32px",
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
            <span style={{ color: "#ffffff" }}>AI Motion Intelligence for</span>
            <span
              style={{
                background: "linear-gradient(90deg, #7a73ff 0%, #7cd4d8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                marginLeft: isMd ? "160px" : "16px",
              }}
            >
              Digital Characters
            </span>
          </h2>

          {/* Right side thumbnail pills */}
          {isMd && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div
                style={{
                  width: "72px",
                  height: "96px",
                  borderRadius: "36px",
                  overflow: "hidden",
                  border: "1px solid rgba(122, 115, 255, 0.4)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/images/ai-motion-intelligence/3.png"
                  alt="AI Generation Glow"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "95% 40%" }}
                />
              </div>

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
                  src="/images/ai-motion-intelligence/2.png"
                  alt="AI Generation Eyes"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Split: Big Image (Left) + Feature List (Right) */}
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
            style={{
              width: "100%",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              position: "relative",
              display: "flex",
            }}
          >
            <img
              src="/images/ai-motion-intelligence/1.png" // Expected path for actual image if added
              alt="AI Motion Intelligence Showcase"
              style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}

            />
          </div>

          {/* Right: Feature Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px", padding: isMd ? "0 16px" : "0" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "28px" }}>
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
