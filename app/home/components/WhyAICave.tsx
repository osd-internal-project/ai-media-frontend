"use client";

import React, { useState, useEffect, useRef } from "react";

export default function WhyAICave() {
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isImageHovered, setIsImageHovered] = useState(false);

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
        paddingTop: "96px",
        paddingBottom: "128px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, #080a0f 0%, #11151e 50%, #080a0f 100%)", // Matches the deep dark tone
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
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
          zIndex: 11,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "65%",
          left: "80%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "400px",
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 40% 50%, rgba(124,212,216,0.6) 0%, rgba(124,212,216,0.3) 30%, rgba(124,212,216,0.1) 55%, rgba(0,0,0,0) 70%),
            radial-gradient(circle at 70% 50%, rgba(150,230,235,0.5) 0%, rgba(150,230,235,0.2) 35%, rgba(0,0,0,0) 65%)
          `,
          filter: "blur(80px)",
          opacity: 1,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
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
              <li
                key={index}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(6px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
                style={{ display: "flex", alignItems: "center", gap: "12px", transition: "transform 0.25s ease", cursor: "pointer" }}
              >
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
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
          style={{
            flex: 1,
            width: "100%",
            borderRadius: "36px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            aspectRatio: isMd ? "1.1/1" : "1/1",
            cursor: "pointer",
            transform: isImageHovered ? "translateY(-8px) scale(1.02)" : "none",
            transition: "transform 0.35s ease, box-shadow 0.35s ease",
          }}
        >
          <img
            src="https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/why-ai-cave/1.jpg"
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
          paddingBottom: '128px'
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
          <button disabled
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
          <a href="/contact-sale" 
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
          </a>
        </div>
      </div>
      <footer style={{
        width: "100%",
        paddingTop: "32px",
        paddingBottom: "64px",
        paddingLeft: "16px",
        paddingRight: "16px",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      }}>
        <div
          style={{
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "grid",
            gridTemplateColumns: isMd ? "2fr 1fr 1fr" : "1fr",
            gap: "16px",
          }}
        >
          {/* Left Column: Brand and Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Brand Logo & Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/images/logo.png" alt="Ai Cave Logo" style={{ height: "32px", width: "auto" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                OSD OFFICE
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6, margin: 0, maxWidth: "320px" }}>
                24 Soi Ramintra 20, Ramintra Road Tharang Subdistrict,<br />
                Bangkhen District Bangkok 10230, Thailand
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <a href="tel:+6620801111" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none" }}>+66 2 080 1111</a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <a href="mailto:AiCave@osd.co.th" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none" }}>AiCave@osd.co.th</a>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: PAGES */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600, margin: 0, letterSpacing: "0.02em" }}>
              PAGES
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <a href="#" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                  Home
                </a>
              </li>
              <li>
                <a href="#" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                  Features
                </a>
              </li>
              <li>
                <a href="#" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                  Contact Sales
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column: SOCIALS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600, margin: 0, letterSpacing: "0.02em" }}>
              SOCIALS
            </h3>
            <div style={{ display: "flex", gap: "16px" }}>
              {/* Facebook */}
              <a href="#" style={{ color: "#cbd5e1", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" style={{ color: "#cbd5e1", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" style={{ color: "#cbd5e1", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6, margin: 0, maxWidth: "250px" }}>
              Copyright © My Company. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </section >
  );
}
