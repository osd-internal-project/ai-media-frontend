"use client";

import React, { useEffect, useRef, useState } from "react";

const blogPosts = [
  {
    title: "Create Faster",
    description: "Generate human video from a single reference image",
    image: "/images/feature-page/Benefits/img1.png",
  },
  {
    title: "Lower Costs",
    description: "Reduce spend on agencies and improve cost-per-asset",
    image: "/images/feature-page/Benefits/img2.png",
  },
  {
    title: "Boost Consistency",
    description: "Enforce brand identity across all visuals",
    image: "/images/feature-page/Benefits/img3.png",
  },
  {
    title: "Enhance Collaboration",
    description: "Transform siloed creativity into shared knowledge",
    image: "/images/feature-page/Benefits/img4.png",
  },
  {
    title: "Scale Securely",
    description: "Admin tools let you manage growth without losing control",
    image: "/images/feature-page/Benefits/img5.png",
  },
  {
    title: "Instant Campaign Testing",
    description: "Generate 20+ campaign variations in seconds",
    image: "/images/feature-page/Benefits/img6.png",
  },
];

export default function Benefits() {
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [visible, setVisible] = useState<boolean[]>(new Array(blogPosts.length).fill(false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-idx"));
          if (entry.isIntersecting && !visible[idx]) {
            setVisible((prev) => {
              if (prev[idx]) return prev;
              const next = [...prev];
              next[idx] = true;
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [visible]);

  return (
    <section
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "80px 24px",
        backgroundImage: "url('/images/feature-page/Benefits/bg.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        {/* TITLE */}
        <h2
          style={{
            fontFamily: "Clash Display Variable",
            fontWeight: 700,
            fontSize: "64px",
            lineHeight: "100%",
            letterSpacing: "-0.02em",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Benefits
        </h2>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "32px",
            width: "100%",
          }}
        >
          {blogPosts.map((post, idx) => {
            const isVisible = visible[idx];
            const baseTransform = isVisible ? "translateY(0)" : "translateY(28px)";

            return (
              <div
                key={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el as HTMLDivElement;
                }}
                data-idx={idx}
                className="benefit-card"
                style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  borderRadius: "32px",
                  padding: "32px",
                  background: `url(${post.image}) center/cover no-repeat`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  opacity: isVisible ? 1 : 0,
                  transform: baseTransform,
                  transition: `opacity 0.8s ease ${idx * 80}ms, transform 0.8s ease ${idx * 80}ms, box-shadow 0.4s cubic-bezier(.4,2,.6,1)`,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-16px) scale(1.045) rotateZ(-1.5deg)";
                  e.currentTarget.style.boxShadow = "0 12px 48px 0 rgba(0,0,0,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = baseTransform;
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)";
                }}
              >
                {/* overlay gradient */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Clash Display Variable",
                      fontWeight: 500,
                      fontSize: "32px",
                      marginBottom: "12px",
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "20px",
                      lineHeight: "140%",
                    }}
                  >
                    {post.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}