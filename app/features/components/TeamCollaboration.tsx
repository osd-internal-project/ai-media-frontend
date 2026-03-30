"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function TeamCollaboration() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const itemDelays = [0, 120, 240];

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage: "url('/images/feature-page/team-collab/bg.svg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left top",
        backgroundSize: "auto 40%",
        display: "flex",
        justifyContent: "center",
        padding: "98px 16px",
        boxSizing: "border-box",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* TITLE */}
        <h1
          style={{
            fontFamily: "Clash Display Variable",
            fontWeight: 700,
            fontSize: "64px",
            lineHeight: "110%",
            letterSpacing: "-0.02em",
            marginBottom: "48px",
            color: "#fff",
          }}
        >
          <span
            style={{
              background: "linear-gradient(90deg,#6366F1 0%,#87DDDE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Team
          </span>
          <span style={{ marginLeft: 8 }}>Collaboration Tools</span>
        </h1>

        {/* CONTENT */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* LEFT */}
          <div
            style={{
              flex: 1,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* 01 */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.7s ease ${itemDelays[0]}ms, transform 0.7s ease ${itemDelays[0]}ms, box-shadow 0.3s ease`,
                borderRadius: 24,
                padding: 24,
        
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(22px)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  color: "#6366F1",
                  fontWeight: 700,
                  fontSize: 48,
                  marginBottom: 12,
                }}
              >
                01
              </div>

              <div style={{ fontSize: 22 }}>
                Share prompts via one-click
              </div>

       
            </div>
   <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #6366F1",
                  marginTop: 24,
                }}
              />
            {/* 02 */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.7s ease ${itemDelays[1]}ms, transform 0.7s ease ${itemDelays[1]}ms, box-shadow 0.3s ease`,
                borderRadius: 24,
                padding: 24,
       
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(22px)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  color: "#6366F1",
                  fontWeight: 700,
                  fontSize: 48,
                  marginBottom: 12,
                }}
              >
                02
              </div>

              <div style={{ fontSize: 22 }}>
                Access shared team libraries and version history
              </div>

           
            </div>
   <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #6366F1",
                  marginTop: 24,
                }}
              />
            {/* 03 */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.7s ease ${itemDelays[2]}ms, transform 0.7s ease ${itemDelays[2]}ms, box-shadow 0.3s ease`,
                borderRadius: 24,
                padding: 24,
          
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(22px)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  color: "#6366F1",
                  fontWeight: 700,
                  fontSize: 48,
                  marginBottom: 12,
                }}
              >
                03
              </div>

              <div style={{ fontSize: 22 }}>
                Remix and repurpose content across departments
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(32px)",
              transition: `opacity 0.8s ease 360ms, transform 0.8s ease 360ms`,
            }}
          >
            <Image
              src="/images/feature-page/team-collab/img1.png"
              alt="Team Collaboration"
              width={1000}
              height={700}
              style={{
                width: "100%",
                maxWidth: "720px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}