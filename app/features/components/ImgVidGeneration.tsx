"use client";

import React, { useEffect, useRef, useState } from "react";
import TwoCardCarousel from "./TwoCardCarousel";

export default function ImgVidGeneration() {
	const sectionRef = useRef<HTMLElement | null>(null);
	const [inView, setInView] = useState(false);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	useEffect(() => {
		if (!sectionRef.current) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		observer.observe(sectionRef.current);
		return () => observer.disconnect();
	}, []);

	const bullets = [
		"Generate high-resolution visuals from text or reference images",
		"Produce up to 10 images simultaneously",
		"Create multi-shot narrative videos with consistent characters and smooth motion",
		"Retain object and face details for professional-grade assets",
	];

	return (
		   <section
      ref={sectionRef}
      className={`
        w-full min-h-screen
        flex flex-col
        items-start justify-start
        pt-10 pb-10 md:pt-16 md:pb-16
        px-4 md:px-6
        overflow-hidden
        transition-all duration-700
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{
        backgroundImage: inView
          ? "url('/images/feature-page/img-vid-gen/bg.svg')"
          : "none",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left top",
        backgroundSize: "auto 25%",
          }}
		   >
			<div className="w-full max-w-[1600px] mx-auto px-2 md:px-6 mt-4 md:mt-8">
        <h2
          className={`
            font-bold
            text-[28px] md:text-[50px]
            leading-[120%]
            text-white
            tracking-tight
            text-left
            flex flex-col items-start
          `}
          style={{
            fontFamily: "Clash Display Variable",
            fontStyle: "Medium",
          }}
        >
          <span className="flex flex-row items-baseline">
            <span className="mr-3">4K</span>
            <span>Image &</span>
          </span>
          <span
            className="block md:ml-[66px]"
            style={{
              background: "linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Video Generation
          </span>
				</h2>
				
				{/* 2 Columns Section */}
				<div
          className={`
            flex flex-col md:flex-row
            gap-6 md:gap-12
            mt-6 md:mt-12
            w-full
          `}
        >
					{/* Left column: wide carousel */}
					 <div className="flex-1 min-w-0 flex items-center justify-center">
            <TwoCardCarousel />
          </div>
					{/* Right column: bullet list */}
					<div className="flex-1 min-w-0 flex flex-col gap-6 md:gap-8 justify-center">
            <ul className="list-none p-0 m-0">
              {bullets.map((text, idx) => (
                <li
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    flex items-start gap-4 mb-4 last:mb-0
                    transition-all duration-300
                    ${hoveredIndex === idx ? "translate-x-2" : ""}
                    ${hoveredIndex !== null && hoveredIndex !== idx ? "opacity-60" : "opacity-100"}
                  `}
                >
                  <span className="text-[#87DDDE] text-[22px] mt-[2px]">✔</span>
                  <span className="text-white text-[14px] md:text-[18px] leading-snug">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
		</section>
	);
}
