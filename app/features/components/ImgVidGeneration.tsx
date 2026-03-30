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
			   style={{
				   width: "100%",
				   minHeight: "100vh",
				   height: "100vh",
				   backgroundImage: "url('/images/feature-page/img-vid-gen/bg.svg')",
				   backgroundRepeat: "no-repeat",
				   backgroundPosition: "left top",
				   backgroundSize: "auto 40%",
				   display: "flex",
				   alignItems: "flex-start",
				   justifyContent: "flex-start",
				   paddingTop: "64px",
				   paddingBottom: "64px",
				   paddingLeft: "16px",
				   paddingRight: "16px",
				   overflow: "hidden",
			   opacity: inView ? 1 : 0,
			   transform: inView ? "translateY(0)" : "translateY(32px)",
			   transition: "opacity 0.9s ease, transform 0.9s ease",
			   }}
		   >
			<div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 24px', marginTop: 32 }}>
				<h2
					style={{
						fontFamily: 'Clash Display Variable',
						fontWeight: 700,
						fontStyle: 'Medium',
						fontSize: '50px',
						lineHeight: '120%',
						color: '#fff',
						letterSpacing: '-2%',
						textAlign: 'left',
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
					}}
				>
					<span style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
						<span style={{ marginRight: 12 }}>4K</span>
						<span>Image &</span>
					</span>
					<span
						style={{
							display: 'block',
							marginLeft: 66, // ให้ตรงกับตำแหน่ง Image & (4K + marginRight)
							background: 'linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
						}}
					>
						Video Generation
					</span>
				</h2>
				{/* 2 Columns Section */}
				<div style={{ display: 'flex', flexDirection: 'row', gap: 48, marginTop: 48, width: '100%' }}>
					{/* Left column: wide carousel */}
					<div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<TwoCardCarousel />
					</div>
					{/* Right column: bullet list */}
					<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center' }}>
						<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
							{bullets.map((text, idx) => (
								<li
									key={idx}
									onMouseEnter={() => setHoveredIndex(idx)}
									onMouseLeave={() => setHoveredIndex(null)}
									style={{
										display: 'flex',
										alignItems: 'flex-start',
										gap: 16,
										marginBottom: idx === bullets.length - 1 ? 0 : 18,
										transform: hoveredIndex === idx ? 'translateX(8px)' : 'none',
										transition: 'transform 0.3s ease, opacity 0.3s ease',
										opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.6,
									}}
								>
									<span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
									<span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
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
