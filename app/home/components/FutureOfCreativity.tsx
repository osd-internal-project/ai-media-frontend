"use client";

import React, { useState, useEffect } from "react";

const cards = [
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/future-of-ai/1.jpeg",
    fallbackColor: "bg-red-900",
    text: "AI Cave evolves\nwith your\nbusiness.",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/future-of-ai/2.jpeg",
    fallbackColor: "bg-amber-900",
    text: "AI Creative\nCopilot",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/future-of-ai/3.jpeg",
    fallbackColor: "bg-indigo-900",
    text: "Voice & Multi-\nmodal AI\nexpansion",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/future-of-ai/4.jpeg",
    fallbackColor: "bg-purple-900",
    text: "Unified AI tool\nintegrations",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/future-of-ai/5.jpeg",
    fallbackColor: "bg-pink-900",
    text: "Mobile\napplication for\non-the-go\napprovals",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/future-of-ai/6.jpeg",
    fallbackColor: "bg-emerald-900",
    text: "Your centralized\nAI creative hub.",
  },
];

export default function FutureOfCreativity() {
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
        // paddingBottom: "128px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, #0a0a0a 0%, #0d0f12 50%, #080a0f 100%)", // Matches the deep dark tone
        overflow: "hidden",
      }}
    >
      {/* Background Watermark Text */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          left: 0,
          right: 0,
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
          The Future of AI
        </span>
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
          Creativity
        </span>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1000px", // slightly narrower to match the tight grid look
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "64px",
        }}
      >
        {/* Title Text */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h2
            style={{
              fontSize: isMd ? "36px" : "28px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              margin: 0,
              textAlign: "center",
            }}
          >
            The Future of AI Creativity
          </h2>
        </div>

        <div style={{
          paddingBottom: "8px",
        }} />
        {/* 3x2 Image Card Grid */}
        <div
          style={{
            paddingTop: "64px",
            display: "grid",
            gridTemplateColumns: isMd ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: isMd ? "24px" : "16px",
            padding: isMd ? "0 16px" : "0",
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                aspectRatio: "3/4", // Vertical card aspect ratio
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
              }}
            >
              <img
                src={card.image}
                alt={card.text.replace("\n", " ")}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}

              />

              {/* Gradient Overlay for Text Readability */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* Inscribed Text */}
              <div
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "24px",
                  right: "24px",
                }}
              >
                <h3
                  style={{
                    color: "#ffffff",
                    fontSize: isMd ? "20px" : "16px",
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                    whiteSpace: "pre-line",
                  }}
                >
                  {card.text}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
