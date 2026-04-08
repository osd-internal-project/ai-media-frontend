"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

export default function HeroSection() {
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMd = windowWidth >= 768;
  const isLg = windowWidth >= 1024;

  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [carouselItems, setCarouselItems] = useState([
    { id: 1, src: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/herosection/5.jpeg", color: "rgba(37, 99, 235, 0.1)", alt: "Hero 5" },
    { id: 2, src: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/herosection/2.mp4", color: "rgba(34, 211, 238, 0.1)", alt: "Hero 2" },
    { id: 3, src: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/herosection/1.jpg", color: "rgba(245, 158, 11, 0.1)", alt: "Hero 1" },
    { id: 4, src: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/herosection/3.mp4", color: "rgba(99, 102, 241, 0.1)", alt: "Hero 3" },
    { id: 5, src: "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/herosection/4.mp4", color: "rgba(168, 85, 247, 0.1)", alt: "Hero 4" },
  ]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCarouselItems((prev) => {
        const newArr = [...prev];
        const first = newArr.shift();
        if (first) newArr.push(first);
        return newArr;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleItemClick = (index: number) => {
    if (index === 2) return;
    setCarouselItems((prev) => {
      const newArr = [...prev];
      const shiftCount = index - 2;
      if (shiftCount > 0) {
        for (let i = 0; i < shiftCount; i++) newArr.push(newArr.shift()!);
      } else {
        for (let i = 0; i < -shiftCount; i++) newArr.unshift(newArr.pop()!);
      }
      return newArr;
    });
  };

  const getSlotStyle = (slotIndex: number, isHovered: boolean, isMd: boolean): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      overflow: "hidden",
      border: "1px solid rgba(168, 85, 247, 0.2)",
      boxShadow: "0 0 25px rgba(168, 85, 247, 0.15)",
      backgroundColor: "#14141d",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
    };

    switch (slotIndex) {
      case 0:
        return { ...baseStyle, left: isMd ? "3%" : "2%", width: isMd ? "15%" : "18%", aspectRatio: "3 / 4.4", borderRadius: isMd ? "24px" : "16px", zIndex: isHovered ? 40 : 10, transform: `translateX(0) ${isHovered ? "rotateY(30deg) scale(0.9)" : "rotateY(30deg) scale(0.85)"}` };
      case 1:
        return { ...baseStyle, left: isMd ? "16%" : "22%", width: isMd ? "22%" : "25%", aspectRatio: "3 / 4.2", borderRadius: isMd ? "28px" : "18px", zIndex: isHovered ? 40 : 20, transform: `translateX(0) ${isHovered ? "rotateY(16deg) scale(0.97)" : "rotateY(16deg) scale(0.92)"}` };
      case 2:
        return { ...baseStyle, left: "50%", width: isMd ? "28%" : "32%", aspectRatio: "3 / 4", borderRadius: isMd ? "32px" : "20px", zIndex: isHovered ? 40 : 30, transform: `translateX(-50%) ${isHovered ? "translateZ(50px) scale(1.02)" : "translateZ(30px)"}` };
      case 3:
        return { ...baseStyle, left: isMd ? "84%" : "78%", width: isMd ? "22%" : "25%", aspectRatio: "3 / 4.2", borderRadius: isMd ? "28px" : "18px", zIndex: isHovered ? 40 : 20, transform: `translateX(-100%) ${isHovered ? "rotateY(-16deg) scale(0.97)" : "rotateY(-16deg) scale(0.92)"}` };
      case 4:
        return { ...baseStyle, left: isMd ? "97%" : "98%", width: isMd ? "15%" : "18%", aspectRatio: "3 / 4.4", borderRadius: isMd ? "24px" : "16px", zIndex: isHovered ? 40 : 10, transform: `translateX(-100%) ${isHovered ? "rotateY(-30deg) scale(0.9)" : "rotateY(-30deg) scale(0.85)"}` };
      default:
        return baseStyle;
    }
  };

  return (
    <>
    <style>{`
      @keyframes heroFadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "112px",
        paddingBottom: "40px",
        paddingLeft: "16px",
        paddingRight: "16px",
        overflow: "hidden",
        backgroundColor: "#0a0a0f",
        backgroundImage: 'url("/images/herosection/bg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar />
      {/* Background Collage representing Image 2 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 0,
          opacity: 0.25,
          overflow: "hidden",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mixBlendMode: "screen",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMd ? "repeat(7, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
            gap: isMd ? "16px" : "12px",
            transform: "rotate(-15deg) scale(1.7)",
            width: "180vw",
            height: "180vh",
          }}
        >
          {Array.from({ length: 56 }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1 / 1",
                backgroundColor: "rgba(26, 26, 46, 0.6)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
            >
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.2)",
                  fontWeight: 600,
                  fontSize: "14px",
                  letterSpacing: "0.1em",
                }}
              >
                image
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays to match Hero image 1 dark fading */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 0,
          background: "linear-gradient(to bottom, rgba(10, 10, 15, 0.8), rgba(10, 10, 15, 0.6), rgba(10, 10, 15, 1))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 0,
          background: "radial-gradient(circle at center, transparent 0%, #0a0a0f 90%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "center",
          marginTop: "32px",
        }}
      >
        <h1
          style={{
            fontSize: isLg ? "48px" : isMd ? "32px" : "18px",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "#ffffff",
            marginBottom: "24px",
            lineHeight: 1.15,
            display: "flex",
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
            justifyContent: "center",
            alignItems: "center",
            columnGap: isMd ? "12px" : "6px",
            animation: "heroFadeUp 0.9s ease forwards",
            opacity: 0,
          }}
        >
          <span>Enterprise AI for</span>
          <span style={{ color: "#60e0ff" }}>Image & Video</span>
          <span style={{ display: "flex", alignItems: "flex-start" }}>
            Generation
            <svg
              style={{
                marginLeft: "8px",
                marginTop: isMd ? "6px" : "4px",
                width: isMd ? "40px" : "24px",
                height: isMd ? "40px" : "24px",
                color: "#ffffff",
                opacity: 0.9,
              }}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M19 2L20 4.5L22.5 5.5L20 6.5L19 9L18 6.5L15.5 5.5L18 4.5L19 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </h1>

        <p
          style={{
            color: "rgba(209, 213, 219, 0.9)",
            fontSize: isMd ? "17px" : "15px",
            maxWidth: "42rem",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "20px",
            letterSpacing: "0.025em",
            fontWeight: 300,
            lineHeight: 1.625,
            paddingLeft: "16px",
            paddingRight: "16px",
            animation: "heroFadeUp 0.9s ease 0.2s forwards",
            opacity: 0,
          }}
        >
          Create commercial-grade visuals in minutes — with full brand control, team governance, and enterprise security.
        </p>

        <p
          style={{
            background: "linear-gradient(90deg, #7c8aff 0%, #8ae9ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: isMd ? "17px" : "15px",
            fontWeight: 400,
            marginBottom: "40px",
            letterSpacing: "0.01em",
            animation: "heroFadeUp 0.9s ease 0.35s forwards",
            opacity: 0,
          }}
        >
          Built for businesses. Powered by advanced AI.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "96px",
            width: "100%",
            paddingLeft: "16px",
            paddingRight: "16px",
            animation: "heroFadeUp 0.9s ease 0.5s forwards",
            opacity: 0,
          }}
        >
          <button
            onMouseEnter={() => setHoveredBtn(1)}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: "14px 32px",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#6c72ff",
              backgroundColor: hoveredBtn === 1 ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.4)",
              transition: "background-color 0.15s ease-in-out",
              fontSize: isMd ? "16px" : "14px",
              fontWeight: 400,
              minWidth: "160px",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              cursor: "pointer",
            }}
          >
            Book a Demo
          </button>
          <button
            onMouseEnter={() => setHoveredBtn(2)}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: "14px 32px",
              borderRadius: "9999px",
              backgroundColor: hoveredBtn === 2 ? "#5b61e0" : "#6c72ff",
              color: "#000000",
              border: "none",
              transition: "background-color 0.15s ease-in-out",
              fontSize: isMd ? "16px" : "14px",
              fontWeight: 400,
              minWidth: "160px",
              cursor: "pointer",
            }}
          >
            Contact Sales
          </button>
        </div>

        {/* 5 Bottom Images Carousel */}
        <div
          style={{
            width: isMd ? "100%" : "98%",
            maxWidth: "1200px",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: isMd ? "480px" : "280px",
            marginLeft: "auto",
            animation: "heroFadeUp 0.9s ease 0.65s forwards",
            opacity: 0,
            marginRight: "auto",
            perspective: "1200px",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {carouselItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(index)}
              onMouseEnter={(e) => { setHoveredImg(item.id); const v = e.currentTarget.querySelector("video"); if (v) v.play(); }}
              onMouseLeave={(e) => { setHoveredImg(null); const v = e.currentTarget.querySelector("video"); if (v) v.pause(); }}
              style={getSlotStyle(index, hoveredImg === item.id, isMd)}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  background: hoveredImg === item.id ? "transparent" : `linear-gradient(to top right, ${item.color}, transparent)`,
                  mixBlendMode: "screen",
                  transition: "background 0.3s ease-in-out",
                  zIndex: 2,
                }}
              ></div>
              {item.src.endsWith(".mp4") ? (
                <video
                  src={item.src}
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 1, borderRadius: "inherit" }}
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 1, borderRadius: "inherit" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
