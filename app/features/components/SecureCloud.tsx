"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function SecureCloud() {
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

  const cardDelays = [0, 120, 240];

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "80px 24px",
        background: `url('/images/feature-page/secure-cloud/bg.png') left top no-repeat`,
        backgroundSize: 'auto 40%, auto, auto',
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
        >
          {/* LEFT COLUMN: TITLE + IMAGE */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            {/* TITLE */}
            <h2
              style={{
                fontFamily: "Clash Display Variable",
                fontWeight: 700,
                fontSize: "52px",
                lineHeight: "110%",
                marginBottom: "48px",
                color: "#fff",
              }}
            >
              Secure Cloud
              <span
                style={{
                  background: "linear-gradient(90deg,#6366F1,#87DDDE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Media Library
              </span>
            </h2>
            {/* IMAGE */}
            <div
              style={{
                borderRadius: "28px",
                overflow: "hidden",
                width: "100%",
                maxWidth: "640px",
              }}
            >
              <Image
                src="/images/feature-page/secure-cloud/img1.png"
                alt="Gallery"
                width={900}
                height={600}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>

        

{/* RIGHT CARDS */}
<div
  style={{
    position: "relative",
    width: "640px",
    height: "720px",
  }}
>
  {/* CARD 01 */}
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "345px",
      height: "346px",
      padding: "48px 60px 48px 48px",
      borderRadius: "32px",
      background: "#000000",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: "10px",
      zIndex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s ease ${cardDelays[0]}ms, transform 0.7s ease ${cardDelays[0]}ms, box-shadow 0.3s ease`,
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-12px) scale(1.03)";
      e.currentTarget.style.boxShadow = "0 14px 48px rgba(0,0,0,0.25)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(22px)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ fontSize: 48, fontWeight: 700, color: '#6366F1', marginBottom: '16px' }}>01</div>
    <div style={{
      fontFamily: 'Clash Display Variable',
      fontWeight: 400,
      fontStyle: 'Regular',
      fontSize: 32,
      lineHeight: '100%',
      letterSpacing: '-2%',
    }}>Store all generated content in the cloud</div>
  </div>

  {/* CARD 02 */}
  <div
    style={{
      position: "absolute",
      top: "65px",
      left: "292px",
      width: "345px",
      height: "346px",
      padding: "48px",
      borderRadius: "32px",
      background: "#6366F1",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: "10px",
      zIndex: 2,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s ease ${cardDelays[1]}ms, transform 0.7s ease ${cardDelays[1]}ms, box-shadow 0.3s ease`,
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-12px) scale(1.03)";
      e.currentTarget.style.boxShadow = "0 14px 48px rgba(0,0,0,0.25)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(22px)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ fontSize: 48, fontWeight: 700, color: '#87DDDE', marginBottom: '16px' }}>02</div>
    <div style={{
      fontFamily: 'Clash Display Variable',
      fontWeight: 400,
      fontStyle: 'Regular',
      fontSize: 32,
      lineHeight: '100%',
      letterSpacing: '-2%',
    }}>
      Maintain access for at <b style={{color:'#87DDDE'}}>least 3</b> months
    </div>
  </div>

  {/* CARD 03 */}
  <div
    style={{
      position: "absolute",
      top: "346px",
      left: "50px",
      width: "345px",
      height: "346px",
      padding: "48px",
      borderRadius: "32px",
      background: "#87DDDE",
      color: "#000",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: "10px",
      zIndex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.7s ease ${cardDelays[2]}ms, transform 0.7s ease ${cardDelays[2]}ms, box-shadow 0.3s ease`,
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-12px) scale(1.03)";
      e.currentTarget.style.boxShadow = "0 14px 48px rgba(0,0,0,0.25)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(22px)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ fontSize: 48, fontWeight: 700, marginBottom: '16px' }}>03</div>

    <div style={{
      fontFamily: 'Clash Display Variable',
      fontWeight: 400,
      fontStyle: 'Regular',
      fontSize: 32,
      lineHeight: '100%',
      letterSpacing: '-2%',
    }}>
      Easy retrieval and reuse for campaigns
    </div>
  </div>
</div>
        </div>
      </div>
    </section>
  );
}