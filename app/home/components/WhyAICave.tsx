"use client";

import React, { useState, useEffect } from "react";

export default function WhyAICave() {
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
        paddingTop: "96px",
        paddingBottom: "128px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, #080a0f 0%, #11151e 50%, #080a0f 100%)", // Matches the deep dark tone
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background glow effects to match the reference */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "-10%",
        width: "50%",
        height: "50%",
        background: "radial-gradient(circle, rgba(122,115,255,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "-10%",
        width: "50%",
        height: "50%",
        background: "radial-gradient(circle, rgba(124,212,216,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Main Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          background: "linear-gradient(135deg, #444b55 0%, #3e6878 100%)",
          borderRadius: "48px",
          display: "flex",
          flexDirection: isMd ? "row" : "column",
          padding: isMd ? "24px" : "24px",
          gap: isMd ? "32px" : "32px",
          alignItems: "stretch", // Stretch to let image fill the height
          boxShadow: "0 30px 60px rgba(0, 0, 0, 0.6)",
          marginBottom: "160px", // Space before bottom CTA
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left Side: Text and List */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: isMd ? "48px" : "24px",
            paddingBottom: isMd ? "48px" : "0",
            paddingLeft: isMd ? "48px" : "16px",
            paddingRight: isMd ? "24px" : "16px",
            gap: "20px",
          }}
        >
          <h2
            style={{
              fontSize: isMd ? "44px" : "32px",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Why AI Cave?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "15px",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "380px",
              marginBottom: "12px",
            }}
          >
            Unlike generic AI tools in the market, AI Cave is purpose-built for true enterprise use.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {[
              "Built for business workflows",
              "Designed for brand governance",
              "Secure & compliant",
              "Scalable across departments",
              "Backed by enterprise AI infrastructure"
            ].map((item, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <svg width="12" height="12" viewBox="0 0 14 10" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M1 5L5 9L13 1" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: 400 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Image */}
        <div
          style={{
            flex: 1,
            width: "100%",
            borderRadius: "36px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            aspectRatio: isMd ? "1.1/1" : "1/1",
          }}
        >
          <img
            src="/images/why-ai-cave/1.jpg"
            alt="Why AI Cave cover"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          textAlign: "center",
          maxWidth: "800px",
          width: "100%",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h2
          style={{
            fontSize: isMd ? "36px" : "24px",
            fontWeight: 400,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          Ready to Accelerate Your Creative Workflow?
        </h2>
        <p
          style={{
            color: "#94a3b8",
            fontSize: isMd ? "16px" : "14px",
            margin: 0,
            marginBottom: "16px",
            fontWeight: 400,
          }}
        >
          Transform ideas into high-converting assets — securely, consistently, and at scale.
        </p>

        <div
          style={{
            display: "flex",
            gap: "24px",
            flexDirection: isMd ? "row" : "column",
            justifyContent: "center",
            width: isMd ? "auto" : "100%",
          }}
        >
          <button
            style={{
              padding: "16px 40px",
              borderRadius: "40px",
              background: "linear-gradient(#080a0f, #080a0f) padding-box, linear-gradient(90deg, #7cd4d8 0%, #7a73ff 100%) border-box",
              border: "1.5px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "linear-gradient(#11151e, #11151e) padding-box, linear-gradient(90deg, #7cd4d8 0%, #7a73ff 100%) border-box")}
            onMouseOut={(e) => (e.currentTarget.style.background = "linear-gradient(#080a0f, #080a0f) padding-box, linear-gradient(90deg, #7cd4d8 0%, #7a73ff 100%) border-box")}
          >
            <span
              style={{
                background: "linear-gradient(90deg, #7cd4d8 0%, #7a73ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                fontSize: "16px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              Book a Demo
            </span>
          </button>
          <button
            style={{
              padding: "16px 40px",
              borderRadius: "40px",
              background: "#6b7cff",
              border: "none",
              color: "#05070a",
              fontSize: "16px",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 10px 20px rgba(107, 124, 255, 0.2)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#5a6aee";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#6b7cff";
            }}
          >
            Contact Sales
          </button>
        </div>
      </div>
    </section >
  );
}
