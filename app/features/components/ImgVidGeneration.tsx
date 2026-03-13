"use client";

import React from "react";
import TwoCardCarousel from "./TwoCardCarousel";

export default function ImgVidGeneration() {
	return (
		<section
			style={{
				width: "100%",
				minHeight: "100vh",
				height: "100vh",
				backgroundImage: "url('/images/feature-page/img-vid-gen/bg.svg')",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "left top",
				backgroundSize: "auto 48%",
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "flex-start",
				paddingTop: "64px",
				paddingBottom: "64px",
				paddingLeft: "16px",
				paddingRight: "16px",
				overflow: "hidden",
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
							<li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
								<span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
								<span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
									Generate high-resolution visuals from text or reference images
								</span>
							</li>
							<li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
								<span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
								<span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
									Produce up to 10 images simultaneously
								</span>
							</li>
							<li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
								<span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
								<span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
									Create multi-shot narrative videos with consistent characters and smooth motion
								</span>
							</li>
							<li style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
								<span style={{ color: '#87DDDE', fontSize: 22, marginTop: 2 }}>✔</span>
								<span style={{ color: '#fff', fontSize: 18, lineHeight: 1.5 }}>
									Retain object and face details for professional-grade assets
								</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
