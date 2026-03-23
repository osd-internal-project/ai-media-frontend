import { IDashboardCreditPerMonthAndType } from "@/app/common/dashbaord";
import React, { useMemo, useState } from "react";

type GenerationTrendChartProps = {
  data: IDashboardCreditPerMonthAndType[];
  colors: {
    image: string;
    video: string;
    human: string;
    dreamactor: string;
    axis: string;
    grid: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipText: string;
  };
};

type Point = { x: number; y: number };

const svgPoint = (point: Point) => `${point.x},${point.y}`;

const smoothLinePath = (points: Point[]) => {
  if (points.length < 2) return points.length ? `M${svgPoint(points[0])}` : "";

  let path = `M${svgPoint(points[0])}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };
    const cp2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };

    path += ` C${svgPoint(cp1)} ${svgPoint(cp2)} ${svgPoint(p2)}`;
  }

  return path;
};

const smoothAreaPath = (points: Point[], baselineY: number) => {
  if (points.length < 2) {
    if (!points.length) return "";
    return `M${svgPoint(points[0])} L${points[0].x},${baselineY} Z`;
  }

  const line = smoothLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L${last.x},${baselineY} L${first.x},${baselineY} Z`;
};

export default function GenerationTrendChart({
  data,
  colors,
}: GenerationTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const width = 940;
  const height = 280;
  const padding = { top: 14, right: 8, bottom: 34, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xMax = 600;
  const yTicks = [0, 150, 300, 450, 600];

  const xStep = chartWidth / Math.max(data.length - 1, 1);
  const toX = (index: number) => padding.left + index * xStep;
  const toY = (value: number) =>
    padding.top +
    chartHeight -
    (Math.max(0, Math.min(xMax, value)) / xMax) * chartHeight;

  const imagePoints = data.map((item, index) => ({
    x: toX(index),
    y: toY(item.image),
  }));
  const videoPoints = data.map((item, index) => ({
    x: toX(index),
    y: toY(item.video),
  }));
  const humanPoints = data.map((item, index) => ({
    x: toX(index),
    y: toY(item.omnihuman),
  }));
  const dreamactorPoints = data.map((item, index) => ({
    x: toX(index),
    y: toY(item.dreamactor),
  }));
  const baselineY = padding.top + chartHeight;

  const hoverItem = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoverX = hoveredIndex !== null ? toX(hoveredIndex) : 0;
  
  const tooltipX = useMemo(() => {
    if (hoveredIndex === null) return 0;
    return Math.min(toX(hoveredIndex) + 14, width - 165);
  }, [hoveredIndex, width, xStep, padding.left]);

  const tooltipY = useMemo(() => {
    if (!hoverItem) return 0;
    const maxY = toY(Math.max(
      hoverItem.image,
      hoverItem.video,
      hoverItem.omnihuman,
      hoverItem.dreamactor
    ));
    return Math.max(8, maxY - 20);
  }, [hoverItem, toY]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={260}
      role="img"
      aria-label="Generation trends"
    >
      <defs>
        <linearGradient id="gImage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.image} stopOpacity="0.18" />
          <stop offset="95%" stopColor={colors.image} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gVideo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.video} stopOpacity="0.16" />
          <stop offset="95%" stopColor={colors.video} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gHuman" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.human} stopOpacity="0.12" />
          <stop offset="95%" stopColor={colors.human} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gDreamactor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors.dreamactor} stopOpacity="0.12" />
          <stop offset="95%" stopColor={colors.dreamactor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => (
        <line
          key={tick}
          x1={padding.left}
          x2={padding.left + chartWidth}
          y1={toY(tick)}
          y2={toY(tick)}
          stroke={colors.grid}
          strokeDasharray="3 3"
        />
      ))}

      <path d={smoothAreaPath(imagePoints, baselineY)} fill="url(#gImage)" />
      <path d={smoothAreaPath(videoPoints, baselineY)} fill="url(#gVideo)" />
      <path d={smoothAreaPath(humanPoints, baselineY)} fill="url(#gHuman)" />
      <path
        d={smoothAreaPath(dreamactorPoints, baselineY)}
        fill="url(#gDreamactor)"
      />

      <path
        d={smoothLinePath(imagePoints)}
        stroke={colors.image}
        strokeWidth={2}
        fill="none"
      />
      <path
        d={smoothLinePath(videoPoints)}
        stroke={colors.video}
        strokeWidth={2}
        fill="none"
      />
      <path
        d={smoothLinePath(humanPoints)}
        stroke={colors.human}
        strokeWidth={2}
        fill="none"
        strokeDasharray="4 2"
      />
      <path
        d={smoothLinePath(dreamactorPoints)}
        stroke={colors.dreamactor}
        strokeWidth={2}
        fill="none"
        strokeDasharray="2 2"
      />

      {data.map((item, index) => (
        <g key={item.month}>
          <rect
            x={toX(index) - xStep / 2}
            y={padding.top}
            width={Math.max(xStep, 30)}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseMove={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
          <text
            x={toX(index)}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill={colors.axis}
          >
            {item.month}
          </text>
        </g>
      ))}

      {yTicks.map((tick) => (
        <text
          key={`tick-${tick}`}
          x={padding.left - 10}
          y={toY(tick) + 4}
          textAnchor="end"
          fontSize="11"
          fill={colors.axis}
        >
          {tick}
        </text>
      ))}

      {[imagePoints, videoPoints, humanPoints, dreamactorPoints].map(
        (series, seriesIndex) => {
          const seriesColors = [
            colors.image,
            colors.video,
            colors.human,
            colors.dreamactor,
          ];
          return series.map((point, pointIndex) => (
            <circle
              key={`${seriesIndex}-${pointIndex}`}
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === pointIndex ? 4 : 3}
              fill={seriesColors[seriesIndex]}
              onMouseEnter={() => setHoveredIndex(pointIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ));
        },
      )}

      {hoverItem && (
        <g>
          <line
            x1={hoverX}
            x2={hoverX}
            y1={padding.top}
            y2={padding.top + chartHeight}
            stroke={colors.grid}
            strokeDasharray="4 3"
          />
          <rect
            x={tooltipX}
            y={tooltipY}
            width={150}
            height={96}
            rx={8}
            fill={colors.tooltipBg}
            stroke={colors.tooltipBorder}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          />
          <text
            x={tooltipX + 10}
            y={tooltipY + 20}
            fontSize="11"
            fontWeight="bold"
            fill={colors.tooltipText}
          >
            {hoverItem.month}
          </text>
          <text
            x={tooltipX + 10}
            y={tooltipY + 38}
            fontSize="11"
            fill={colors.image}
          >
            Image: {hoverItem.image}
          </text>
          <text
            x={tooltipX + 10}
            y={tooltipY + 53}
            fontSize="11"
            fill={colors.video}
          >
            Video: {hoverItem.video}
          </text>
          <text
            x={tooltipX + 10}
            y={tooltipY + 68}
            fontSize="11"
            fill={colors.human}
          >
            Human: {hoverItem.omnihuman}
          </text>
          <text
            x={tooltipX + 10}
            y={tooltipY + 83}
            fontSize="11"
            fill={colors.dreamactor}
          >
            Dream: {hoverItem.dreamactor}
          </text>
        </g>
      )}
    </svg>
  );
}
