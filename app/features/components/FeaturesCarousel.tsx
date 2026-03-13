"use client";

import { Image } from "antd";
import React, { useEffect, useState } from "react";

const images = [
  "/images/generate-smarter/1.png",
  "/images/generate-smarter/2.jpeg",
  "/images/generate-smarter/3.jpeg",
  "/images/generate-smarter/4.jpeg",
];

export default function FeaturesCarousel() {
  const [index, setIndex] = useState(0);
  const sliderImages = [...images, ...images];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // เลือก 3 รูปที่จะแสดง
  const getVisibleImages = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(sliderImages[(index + i) % sliderImages.length]);
    }
    return visible;
  };

  const visibleImages = getVisibleImages();

  return (
      <div style={styles.wrapper}>
      <Image
  src="/images/feature-page/features-carousel/title.svg"
  alt="Features Carousel"
  width={400}
  preview={false}
  className="carousel-title"
/>
      <div style={styles.track}>
        {visibleImages.map((img, i) => {
          let transform = "scale(1)";
          let zIndex = 1;
          if (i === 0) {
            // ซ้าย เอียงเข้ากลาง (ใหญ่ขึ้นเล็กน้อย)
            transform = "rotateY(35deg) translateX(50px) scale(1.0)";
            zIndex = 2;
          } else if (i === 1) {
            // กลาง เล็กลง
            transform = "scale(0.8)";
            zIndex = 3;
          } else if (i === 2) {
            // ขวา เอียงเข้ากลาง (ใหญ่ขึ้นเล็กน้อย)
            transform = "rotateY(-35deg) translateX(-50px) scale(1.0)";
            zIndex = 2;
          }
          return (
            <div
              key={i}
              style={{
                ...styles.card,
                transform,
                zIndex,
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
    width: "100vw",
    height: "100vh",
    minHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: "1000px", // สำคัญ
    position: "relative", // ✅ เพิ่มอันนี้
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
    boxShadow: "0 0 24px 16px rgba(255,255,255,0.25), 0 4px 24px 0 rgba(0,0,0,0.12)",
  },
};