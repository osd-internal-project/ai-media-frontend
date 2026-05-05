"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function RoleAndToken() {
	const sectionRef = useRef<HTMLElement | null>(null);
	const [inView, setInView] = useState(false);
	const [hoveredBullet, setHoveredBullet] = useState<number | null>(null);
	const [isImageHovered, setIsImageHovered] = useState(false);

	const bullets = [
		"Role-based access with admin control",
		"Assign or restrict token usage by user, project, or department",
		"Includes SSO login, MFA, and full user management suite",
	];

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

	return (
		<section
			ref={sectionRef}
			className={`w-screen min-h-screen flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
				inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
			}`}
			style={{ background: "#171717" }}
		>
			{/* 🔥 KEY: column ใน mobile / row ใน desktop */}
			<div className="w-screen flex flex-col md:flex-row items-stretch justify-start">
				
				{/* IMAGE */}
				<div className="w-full md:w-1/2 h-[40vh] md:h-screen flex">
					<Image
						src="/images/feature-page/RoleAndToken/img1.png"
						alt="Role And Token Image"
						width={1920}
						height={1080}
						onMouseEnter={() => setIsImageHovered(true)}
						onMouseLeave={() => setIsImageHovered(false)}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							transform: isImageHovered ? "scale(1.03)" : "none",
							transition: "transform 0.3s ease",
						}}
					/>
				</div>

				{/* CONTENT */}
				<div className="w-full md:w-1/2 flex flex-col items-start justify-start text-white px-6 md:px-[98px] py-10 md:py-[98px]">
					
					<h1 className="font-bold leading-[110%] tracking-[-2%] text-left mb-6 md:mb-10 text-[32px] md:text-[64px]">
						<span className="bg-gradient-to-r from-indigo-500 to-cyan-300 bg-clip-text text-transparent">
							Role & Token
						</span>
						<br />
						<span>Management</span>
					</h1>

					<div className="w-full">
						{bullets.map((text, idx) => {
							const baseTransform = inView ? "translateY(0)" : "translateY(22px)";
							const isHovered = hoveredBullet === idx;

							return (
								<React.Fragment key={idx}>
									<div
										className="flex flex-col gap-2 md:gap-3 rounded-2xl p-4 md:p-6 cursor-pointer transition-all"
										style={{
											opacity: inView ? 1 : 0,
											transform: isHovered
												? "translateY(-10px) scale(1.02)"
												: baseTransform,
											boxShadow: isHovered
												? "0 20px 40px rgba(0,0,0,0.25)"
												: "none",
											transition: `opacity 0.7s ease ${idx * 120}ms, transform 0.7s ease ${idx * 120}ms`,
										}}
										onMouseEnter={() => setHoveredBullet(idx)}
										onMouseLeave={() => setHoveredBullet(null)}
									>
										<div className="text-indigo-500 font-bold text-[28px] md:text-[48px]">
											{String(idx + 1).padStart(2, "0")}
										</div>

										<div className="text-white font-medium text-[16px] md:text-[22px]">
											{text}
										</div>
									</div>

									{idx !== bullets.length - 1 && (
										<hr className="border-t border-indigo-500 my-4 md:my-6" />
									)}
								</React.Fragment>
							);
						})}
					</div>

				</div>
			</div>
		</section>
	);
}