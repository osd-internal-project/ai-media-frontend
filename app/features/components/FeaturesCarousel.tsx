"use client";

import { Image } from "antd";
import React, { useEffect, useRef, useState } from "react";

const images = [
  "/images/generate-smarter/1.png",
  "/images/generate-smarter/2.jpeg",
  "/images/generate-smarter/3.jpeg",
  "/images/generate-smarter/4.jpeg",
];

export default function FeaturesCarousel() {
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const sliderImages = [...images, ...images];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const getVisibleImages = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(sliderImages[(index + i) % sliderImages.length]);
    }
    return visible;
  };

  const visibleImages = getVisibleImages();

  return (
    <div
      ref={wrapperRef}
      style={{
        ...styles.wrapper,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}
    >
      {/* OVERLAY TITLE */}
      <div style={styles.overlayTitle}>
        <Image
          src="/images/feature-page/features-carousel/title.svg"
          alt="Features"
          preview={false}
          width={900}
        />

       
      </div>

      {/* CAROUSEL */}
      <div style={styles.track}>
        {visibleImages.map((img, i) => {
          let transform = "scale(1)";
          let zIndex = 1;

          if (i === 0) {
            transform = "rotateY(35deg) translateX(50px) scale(1)";
            zIndex = 2;
          } else if (i === 1) {
            transform = "scale(0.8)";
            zIndex = 3;
          } else if (i === 2) {
            transform = "rotateY(-35deg) translateX(-50px) scale(1)";
            zIndex = 2;
          }

          const isHover = hovered === i;
          const hoverTransform = isHover
            ? "scale(1.08) translateY(-12px)"
            : "";

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.card,
                transform: `${transform} ${hoverTransform}`,
                zIndex: isHover ? 10 : zIndex,
                backgroundImage: `url(${img})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    width: "100%",
    height: "100vh",
    minHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: "1000px",
    position: "relative",
  },

  /* OVERLAY TITLE */
  overlayTitle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 20,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  titleText: {
    position: "absolute",
    fontSize: "72px",
    fontWeight: 700,
    letterSpacing: "10px",
    color: "#fff",
    fontFamily: "Clash Display Variable",
    textAlign: "center",
  },

  track: {
    display: "flex",
    gap: "40px",
    transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)",
    transformStyle: "preserve-3d",
  },

  card: {
    minWidth: "32vw",
    height: "420px",
    borderRadius: "16px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
    transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)",
    boxShadow:
      "0 0 24px 16px rgba(255,255,255,0.25), 0 4px 24px 0 rgba(0,0,0,0.12)",
  },
};