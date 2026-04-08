"use client";

import React, { useState, useEffect, useRef } from "react";

const automations = [
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/automate-workflow/1.png",
    fallbackColor: "bg-orange-500",
    label: "Approval routing\nsystem",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/automate-workflow/2.png",
    fallbackColor: "bg-gray-800",
    label: "AI risk escalation",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/automate-workflow/3.png",
    fallbackColor: "bg-blue-100",
    label: "Multi-Platform\nContent Distribution",
  },
  {
    image: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/automate-workflow/4.png",
    fallbackColor: "bg-pink-300",
    label: "Campaign batch\ndeployment",
  },
];

export default function AutomateWorkflow() {
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
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "148px",
        // paddingBottom: "128px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, #05070a 0%, #0a0c10 50%, #0a0a0a 100%)", // Matches the deep dark tone
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
          left: "20%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 40% 50%, rgba(124,212,216,0.6) 0%, rgba(124,212,216,0.3) 30%, rgba(124,212,216,0.1) 55%, rgba(0,0,0,0) 70%),
            radial-gradient(circle at 70% 50%, rgba(150,230,235,0.5) 0%, rgba(150,230,235,0.2) 35%, rgba(0,0,0,0) 65%)
          `,
          filter: "blur(80px)",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Background Watermark Text */}
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
          width: "200%", // Stretch off-screen
        }}
      >
        <span
          style={{
            fontSize: isMd ? "120px" : "40px",
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.02)",
            letterSpacing: "-0.04em",
          }}
        >
          Automate Your
        </span>
        <span
          style={{
            fontSize: isMd ? "120px" : "40px",
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.02)",
            letterSpacing: "-0.04em",
          }}
        >
          Creative Workflow
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
          paddingTop: '32px'
        }}
      >
        {/* Title Text */}
        <h2
          style={{
            fontSize: isMd ? "36px" : "28px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            margin: 0,
            paddingLeft: isMd ? "16px" : "0",
          }}
        >
          Automate Your Creative Workflow
        </h2>
        <div style={{
          paddingBottom: "8px",
        }} />

        {/* 4-Column Image Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMd ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            gap: isMd ? "24px" : "16px",
            padding: isMd ? "0 16px" : "0",
          }}
        >
          {automations.map((auto, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {/* Square Image Box */}
              <div
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                }}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  position: "relative",
                  border: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  transition: "transform 0.35s ease, box-shadow 0.35s ease, border 0.35s ease",
                }}
              >
                <img
                  src={auto.image}
                  alt={auto.label.replace("\n", " ")}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    // Fallback to purely colored div if not found
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.className = `${parent.className} ${auto.fallbackColor}`;
                    }
                  }}
                />
              </div>

              {/* Caption */}
              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: isMd ? "18px" : "15px",
                  lineHeight: 1.4,
                  fontWeight: 400,
                  margin: 0,
                  whiteSpace: "pre-line", // Respects \n in the label string
                  letterSpacing: "-0.01em",
                }}
              >
                {auto.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
