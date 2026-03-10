import React, { useState } from "react";
import type { ProjectUsageItem } from "./static";

type ProjectImgQuotaUsageChartProps = {
	data: ProjectUsageItem[];
	colors: {
		used: string;
		limit: string;
		axis: string;
		grid: string;
		tooltipBg: string;
		tooltipBorder: string;
		tooltipText: string;
	};
};

export default function ProjectImgQoutaUsageChart({
	data,
	colors,
}: ProjectImgQuotaUsageChartProps) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const width = 720;
	const height = 280;
	const padding = { top: 16, right: 12, bottom: 30, left: 120 };
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;
	const rowH = chartHeight / Math.max(data.length, 1);
	const maxValue = Math.max(...data.map((item) => item.limit), 1);
	const xAxisTicks = 4;

	const toX = (value: number) =>
		padding.left + (Math.max(value, 0) / maxValue) * chartWidth;
	const hoverItem = hoveredIndex !== null ? data[hoveredIndex] : null;

	return (
		<svg viewBox={`0 0 ${width} ${height}`} width="100%" height={280}>
			{Array.from({ length: xAxisTicks + 1 }).map((_, index) => {
				const ratio = index / xAxisTicks;
				const x = padding.left + chartWidth * ratio;
				const value = Math.round(maxValue * ratio);
				return (
					<g key={ratio}>
						<line
							x1={x}
							x2={x}
							y1={padding.top}
							y2={padding.top + chartHeight}
							stroke={colors.grid}
							strokeDasharray="3 3"
						/>
						<text
							x={x}
							y={height - 8}
							textAnchor="middle"
							fontSize="11"
							fill={colors.axis}
						>
							{value}
						</text>
					</g>
				);
			})}

			{data.map((item, index) => {
				const rowY = padding.top + index * rowH;
				const barH = rowH * 0.28;
				const gap = rowH * 0.1;
				const yUsage = rowY + rowH * 0.16;
				const yLimit = yUsage + barH + gap;
				const usedW = toX(item.image) - padding.left;
				const limitW = toX(item.limit) - padding.left;

				return (
					<g key={item.name}>
						{hoveredIndex === index && (
							<rect
								x={padding.left}
								y={rowY}
								width={chartWidth}
								height={rowH}
								fill={colors.grid}
								opacity={0.24}
								rx={6}
							/>
						)}
						<rect
							x={padding.left}
							y={rowY}
							width={chartWidth}
							height={rowH}
							fill="transparent"
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseMove={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						/>
						<text
							x={padding.left - 8}
							y={rowY + rowH * 0.52}
							textAnchor="end"
							fontSize="11"
							fill={colors.axis}
						>
							{item.name}
						</text>
						<rect x={padding.left} y={yUsage} width={usedW} height={barH} fill={colors.used} rx={4} />
						<rect x={padding.left} y={yLimit} width={limitW} height={barH} fill={colors.limit} rx={4} />
					</g>
				);
			})}

			{hoverItem && (
				<g>
					<rect
						x={padding.left + 12}
						y={10}
						width={180}
						height={56}
						rx={8}
						fill={colors.tooltipBg}
						stroke={colors.tooltipBorder}
					/>
					<text x={padding.left + 22} y={28} fontSize="11" fill={colors.tooltipText}>
						{hoverItem.name}
					</text>
					<text x={padding.left + 22} y={44} fontSize="11" fill={colors.used}>
						Used: {hoverItem.image}
					</text>
					<text x={padding.left + 22} y={60} fontSize="11" fill={colors.axis}>
						Limit: {hoverItem.limit}
					</text>
				</g>
			)}
		</svg>
	);
}
