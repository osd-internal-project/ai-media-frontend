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
			style={{
				width: "100vw",
				minHeight: "100vh",
				height: "100vh",
				background: "#171717",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: 0,
				margin: 0,
				overflow: "hidden",
				opacity: inView ? 1 : 0,
				transform: inView ? "translateY(0)" : "translateY(32px)",
				transition: "opacity 0.9s ease, transform 0.9s ease",
			}}
		>
			<div
				style={{
					width: "100vw",
					display: "flex",
					flexDirection: "row",
					alignItems: "stretch",
					justifyContent: "flex-start",
					padding: 0,
					margin: 0,
				}}
			>
				{/* Left column: Image */}
				<div style={{ width: "50vw", height: "100vh", display: "flex", padding: 0, margin: 0 }}>
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
							borderRadius: 0,
							objectFit: "cover",
							margin: 0,
							padding: 0,
							transform: isImageHovered ? "scale(1.03)" : "none",
							transition: "transform 0.3s ease",
						}}
					/>
				</div>
				{/* Right column: Content (add your content here) */}
				<div className={inView ? "role-token-content in-view" : "role-token-content"} style={{ width: "50vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "flex-start", color: "#fff", padding: 98, margin: 0, justifyContent: "flex-start" }}>
					<h1
						style={{
							fontFamily: 'Clash Display Variable',
							fontWeight: 700,
							fontStyle: 'Medium',
							fontSize: '64px',
							lineHeight: '110%',
							letterSpacing: '-2%',
							marginBottom: '40px',
							color: '#fff',
							textAlign: 'left',
						}}
					>
						<span
							style={{
								display: 'inline-block',
								background: 'linear-gradient(90deg, #6366F1 0%, #87DDDE 100%)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								backgroundClip: 'text',
							}}
						>Role & Token</span>
						<br />
						<span style={{ color: '#fff' }}>Management</span>
					</h1>
						{/* Content List */}
						<div style={{ width: '100%' }}>
							{bullets.map((text, idx) => {
								const baseTransform = inView ? "translateY(0)" : "translateY(22px)";
								const isHovered = hoveredBullet === idx;
								return (
									<React.Fragment key={idx}>
										<div
											style={{
												marginBottom: 0,
												display: 'flex',
												flexDirection: 'column',
												gap: 12,
												opacity: inView ? 1 : 0,
												transform: isHovered ? 'translateY(-10px) scale(1.02)' : baseTransform,
												transition: `opacity 0.7s ease ${idx * 120}ms, transform 0.7s ease ${idx * 120}ms, box-shadow 0.3s ease`,
												borderRadius: 24,
												padding: 24,
												cursor: 'pointer',
												boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.25)' : 'none',
											}}
											onMouseEnter={() => setHoveredBullet(idx)}
											onMouseLeave={() => setHoveredBullet(null)}
										>
											<div style={{ color: '#6366F1', fontWeight: 700, fontSize: 48, minWidth: 48, lineHeight: '1.1' }}>
												{String(idx + 1).padStart(2, '0')}
											</div>
											<div style={{ fontSize: 22, fontWeight: 500, color: '#fff' }}>{text}</div>
										</div>
										{idx !== bullets.length - 1 && (
											<hr
												style={{
													border: 'none',
													borderTop: '1px solid #6366F1',
													margin: '24px 0',
												}}
											/>
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
