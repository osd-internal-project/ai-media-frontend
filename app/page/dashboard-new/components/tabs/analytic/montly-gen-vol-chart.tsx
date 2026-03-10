import React, { useMemo, useState } from "react";
import type { MonthlyGenerationItem } from "./static";

type MonthlyGenVolChartProps = {
	data: MonthlyGenerationItem[];
	colors: {
		image: string;
		video: string;
		human: string;
		axis: string;
		grid: string;
		tooltipBg: string;
		tooltipBorder: string;
		tooltipText: string;
	};
};

export default function MontlyGenVolChart({
	data,
	colors,
}: MonthlyGenVolChartProps) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const yAxisTicks = [0, 250, 500, 750, 1000];
	const width = 720;
	const height = 280;
	const padding = { top: 12, right: 16, bottom: 30, left: 36 };
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;
	const maxY = 1000;

	const slotWidth = chartWidth / Math.max(data.length, 1);
	const barWidth = Math.max(slotWidth * 0.46, 20);

	const toY = (value: number) =>
		padding.top + chartHeight - (value / maxY) * chartHeight;

	const hoverItem = hoveredIndex !== null ? data[hoveredIndex] : null;
	const tooltipX = useMemo(() => {
		if (hoveredIndex === null) return 0;
		const x = padding.left + hoveredIndex * slotWidth + slotWidth * 0.72;
		return Math.min(Math.max(x, padding.left + 8), width - 170);
	}, [hoveredIndex, padding.left, slotWidth, width]);

	return (
		<svg viewBox={`0 0 ${width} ${height}`} width="100%" height={280}>
			{yAxisTicks.map((tick) => {
				const y = toY(tick);
				return (
					<g key={tick}>
						<line
							x1={padding.left}
							x2={padding.left + chartWidth}
							y1={y}
							y2={y}
							stroke={colors.grid}
							strokeDasharray="3 3"
						/>
						<text
							x={padding.left - 8}
							y={y + 4}
							textAnchor="end"
							fontSize="11"
							fill={colors.axis}
						>
							{tick}
						</text>
					</g>
				);
			})}

			{data.map((item, index) => {
				const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
				const imageH = (item.image / maxY) * chartHeight;
				const videoH = (item.video / maxY) * chartHeight;
				const humanH = (item.human / maxY) * chartHeight;

				const yImage = toY(item.image + item.video + item.human);
				const yVideo = yImage + imageH;
				const yHuman = yVideo + videoH;

				return (
					<g key={item.month}>
						{hoveredIndex === index && (
							<rect
								x={padding.left + index * slotWidth}
								y={padding.top}
								width={slotWidth}
								height={chartHeight}
								fill={colors.grid}
								opacity={0.24}
								rx={8}
							/>
						)}
						<rect
							x={padding.left + index * slotWidth}
							y={padding.top}
							width={slotWidth}
							height={chartHeight}
							fill="transparent"
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseMove={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						/>
						<rect x={x} y={yImage} width={barWidth} height={imageH} fill={colors.image} rx={4} />
						<rect x={x} y={yVideo} width={barWidth} height={videoH} fill={colors.video} />
						<rect x={x} y={yHuman} width={barWidth} height={humanH} fill={colors.human} rx={4} />

						<text
							x={x + barWidth / 2}
							y={height - 8}
							textAnchor="middle"
							fontSize="11"
							fill={colors.axis}
						>
							{item.month}
						</text>
					</g>
				);
			})}

			{hoverItem && (
				<g>
					<line
						x1={padding.left + hoveredIndex! * slotWidth + slotWidth / 2}
						x2={padding.left + hoveredIndex! * slotWidth + slotWidth / 2}
						y1={padding.top}
						y2={padding.top + chartHeight}
						stroke={colors.grid}
						strokeDasharray="4 3"
					/>
					<rect
						x={tooltipX}
						y={18}
						width={156}
						height={72}
						rx={8}
						fill={colors.tooltipBg}
						stroke={colors.tooltipBorder}
					/>
					<text x={tooltipX + 10} y={35} fontSize="11" fill={colors.tooltipText}>
						{hoverItem.month}
					</text>
					<text x={tooltipX + 10} y={50} fontSize="11" fill={colors.image}>
						Image: {hoverItem.image}
					</text>
					<text x={tooltipX + 10} y={65} fontSize="11" fill={colors.video}>
						Video: {hoverItem.video}
					</text>
					<text x={tooltipX + 10} y={80} fontSize="11" fill={colors.human}>
						Human: {hoverItem.human}
					</text>
				</g>
			)}
		</svg>
	);
}
