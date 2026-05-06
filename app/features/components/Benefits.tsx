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
  const [visible, setVisible] = useState<boolean[]>(
    new Array(blogPosts.length).fill(false)
  );

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
      className="w-full min-h-screen flex justify-center px-4 py-12 md:py-[80px]"
      style={{
        backgroundImage: "url('/images/feature-page/Benefits/bg.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundSize: "cover",
      }}
    >
      <div className="w-full max-w-[1400px] flex flex-col gap-8 md:gap-12">
        
        {/* TITLE */}
        <h2 className="text-white text-center font-bold leading-none text-[32px] md:text-[64px]">
          Benefits
        </h2>

        {/* 🔥 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full">
          
          {blogPosts.map((post, idx) => {
            const isVisible = visible[idx];
            const baseTransform = isVisible
              ? "translateY(0)"
              : "translateY(28px)";

            return (
              <div
                key={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el as HTMLDivElement;
                }}
                data-idx={idx}
                className="benefit-card relative flex flex-col justify-end text-white rounded-[20px] md:rounded-[32px] p-4 md:p-8 overflow-hidden cursor-pointer"
                style={{
                  aspectRatio: "4 / 5",
                  background: `url(${post.image}) center/cover no-repeat`,
                  opacity: isVisible ? 1 : 0,
                  transform: baseTransform,
                  transition: `opacity 0.8s ease ${
                    idx * 80
                  }ms, transform 0.8s ease ${idx * 80}ms`,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-16px) scale(1.045) rotateZ(-1.5deg)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 48px rgba(0,0,0,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = baseTransform;
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(0,0,0,0.07)";
                }}
              >
                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                <div className="relative z-10">
                  <h3 className="font-medium mb-2 md:mb-3 text-[20px] md:text-[32px]">
                    {post.title}
                  </h3>

                  <p className="text-[14px] md:text-[20px] leading-[140%]">
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