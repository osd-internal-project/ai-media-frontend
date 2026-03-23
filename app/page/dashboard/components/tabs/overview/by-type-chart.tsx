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
	const width = 220;
	const height = 150;
	const cx = 110;
	const cy = 75;
	const innerRadius = 42;
	const outerRadius = 68;
	const total = Math.max(data.reduce((sum, item) => sum + item.value, 0), 1);

	let startAngle = 0;
	const arcs = data.map((item) => {
		const angle = (item.value / total) * 360;
		const endAngle = startAngle + angle;
		const arc = {
			...item,
			path: donutArc(cx, cy, innerRadius, outerRadius, startAngle + 1, endAngle - 1),
		};
		startAngle = endAngle;
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
			height={140}
			role="img"
			aria-label="Type distribution"
			onMouseLeave={() => setHoveredName(null)}
		>
			{arcs.map((arc) => (
				<path
					key={arc.name}
					d={arc.path}
					fill={arc.color}
					onMouseEnter={() => setHoveredName(arc.name)}
					opacity={hoveredName && hoveredName !== arc.name ? 0.55 : 1}
				/>
			))}

			{hovered && (
				<g>
					<rect
						x={8}
						y={8}
						width={130}
						height={42}
						rx={8}
						fill={colors.tooltipBg}
						stroke={colors.tooltipBorder}
					/>
					<text x={16} y={25} fill={colors.tooltipText} fontSize="11">
						{hovered.name}
					</text>
					<text x={16} y={40} fill={hovered.color} fontSize="11">
						Value: {hovered.value}
					</text>
				</g>
			)}
		</svg>
	);
}
