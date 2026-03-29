import React, { useMemo, useState } from "react";
import { ByTypeItem } from "../types";



type ByTypeChartProps = {
	data: ByTypeItem[];
	colors: {
		tooltipBg: string;
		tooltipBorder: string;
		tooltipText: string;
	};
};

const polarToCartesian = (
	cx: number,
	cy: number,
	radius: number,
	angleDeg: number,
) => {
	const angleRad = ((angleDeg - 90) * Math.PI) / 180;
	return {
		x: cx + radius * Math.cos(angleRad),
		y: cy + radius * Math.sin(angleRad),
	};
};

const donutArc = (
	cx: number,
	cy: number,
	innerRadius: number,
	outerRadius: number,
	startAngle: number,
	endAngle: number,
) => {
	const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
	const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
	const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
	const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);
	const largeArc = endAngle - startAngle > 180 ? 1 : 0;

	return [
		`M ${startOuter.x} ${startOuter.y}`,
		`A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
		`L ${endInner.x} ${endInner.y}`,
		`A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
		"Z",
	].join(" ");
};

export default function ByTypeChart({ data, colors }: ByTypeChartProps) {
	const [hoveredName, setHoveredName] = useState<string | null>(null);
	const width = 260;
	const height = 180;
	const cx = 130;
	const cy = 90;
	const innerRadius = 54;
	const outerRadius = 84;
	const total = Math.max(data.reduce((sum, item) => sum + item.value, 0), 1);

	// Add gap between arcs
	const gapAngle = 2; // degrees
	let startAngle = 0;
	const arcs = data.map((item) => {
		const angle = (item.value / total) * 360;
		const arcStart = startAngle + gapAngle / 2;
		const arcEnd = startAngle + angle - gapAngle / 2;
		const arc = {
			...item,
			path: donutArc(cx, cy, innerRadius, outerRadius, arcStart, arcEnd),
		};
		startAngle += angle;
		return arc;
	});

	const hovered = useMemo(
		() => arcs.find((item) => item.name === hoveredName) || null,
		[arcs, hoveredName],
	);

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			width="100%"
			height={height}
			role="img"
			aria-label="Type distribution"
			onMouseLeave={() => setHoveredName(null)}
		>
			{arcs.map((arc) => (
				<path
					key={arc.name}
					d={arc.path}
					fill={arc.color}
					stroke="#fff"
					strokeWidth={2}
					onMouseEnter={() => setHoveredName(arc.name)}
					opacity={hoveredName && hoveredName !== arc.name ? 0.55 : 1}
				/>
			))}

			{hovered && (
				<g>
					<rect
						x={cx - 65}
						y={cy - 60}
						width={130}
						height={42}
						rx={8}
						fill={colors.tooltipBg}
						stroke={colors.tooltipBorder}
					/>
					<text x={cx} y={cy - 45} fill={colors.tooltipText} fontSize="12" fontWeight="bold" textAnchor="middle">
						{hovered.name}
					</text>
					<text x={cx} y={cy - 28} fill={hovered.color} fontSize="12" fontWeight="bold" textAnchor="middle">
						Value: {hovered.value}
					</text>
				</g>
			)}
		</svg>
	);
}
