"use client";

import { Image } from "antd";
import React, { useEffect, useRef, useState } from "react";

const images = [
  "/images/feature-page/features-carousel/img1.webp",
  "/images/feature-page/features-carousel/img2.webp",
  "/images/feature-page/features-carousel/img3.webp",
];

export default function FeaturesCarousel() {
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  const sliderImages = [...images, ...images];

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
      className={`
        w-full flex flex-col items-center justify-center relative overflow-hidden
        min-h-[340px] md:min-h-screen h-[340px] md:h-screen pt-6 md:pt-0
        transition-all duration-700
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"}
      `}
    >
      {/* TITLE */}
      <div className="absolute left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-20 pointer-events-none">
        <Image
          src="/images/feature-page/features-carousel/title.svg"
          alt="Features"
          preview={false}
          className="w-[180px] md:w-[900px]"
        />
      </div>

      {/* DESKTOP */}
      {!isMobile && (
        <div
          className="flex gap-10 justify-center"
          style={{ perspective: "1000px" }}
        >
          {visibleImages.map((img, i) => {
            let baseTransform = "";

            if (i === 0) {
              baseTransform = "rotateY(35deg) translateX(50px)";
            } else if (i === 1) {
              baseTransform = "scale(0.8)";
            } else if (i === 2) {
              baseTransform = "rotateY(-35deg) translateX(-50px)";
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
                className="rounded-xl bg-cover bg-center shadow-lg transition-all duration-700"
                style={{
                  backgroundImage: `url(${img})`,
                  width: "32vw",
                  height: "420px",
                  transform: `${baseTransform} ${hoverTransform}`,
                  zIndex: isHover ? 10 : 1,
                }}
              />
            );
          })}
        </div>
      )}

      {/* MOBILE */}
      {isMobile && (
        <div className="relative w-full h-[180px]">
          {visibleImages.map((img, i) => {
            let style: React.CSSProperties = {
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              width: "42vw",
              height: "160px",
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "12px",
              transition: "all 0.7s",
            };

            if (i === 1) {
              // กลาง
              style.left = "50%";
              style.transform = "translate(-50%, -50%) scale(1)";
              style.zIndex = 3;
            }

            if (i === 0) {
              // ซ้าย (ดันออก)
              style.left = "0";
              style.transform =
                "translate(-15%, -50%) rotateY(35deg) scale(0.95)";
              style.zIndex = 1;
            }

            if (i === 2) {
              // ขวา (ดันออก)
              style.right = "0";
              style.transform =
                "translate(15%, -50%) rotateY(-35deg) scale(0.95)";
              style.zIndex = 1;
            }

            return <div key={i} style={style} />;
          })}
        </div>
      )}
    </div>
  );
}