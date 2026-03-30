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

type Point = {
  x: number;
  y: number;
};

const svgPoint = (point: Point) => `${point.x},${point.y}`;

const smoothLinePath = (points: Point[]) => {
  if (points.length < 2) {
    return points.length ? `M${svgPoint(points[0])}` : "";
  }

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

  const width = 980;
  const height = 320;

  const padding = {
    top: 24,
    right: 24,
    bottom: 54,
    left: 52,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((item) => [
    item.image,
    item.video,
    item.omnihuman,
    item.dreamactor,
  ]);

  let yMin = Math.min(...allValues);
  let yMax = Math.max(...allValues);

  if (!isFinite(yMin)) yMin = 0;
  if (!isFinite(yMax)) yMax = 1;

  const yRange = Math.max(yMax - yMin, 10);

  yMin = Math.max(0, yMin - yRange * 0.15);
  yMax = yMax + yRange * 0.18;

  const niceTicks = (min: number, max: number, count: number) => {
    if (max === min) return [min];

    const rawStep = (max - min) / (count - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    let step = magnitude;

    if (normalized > 5) step = 10 * magnitude;
    else if (normalized > 2) step = 5 * magnitude;
    else if (normalized > 1) step = 2 * magnitude;

    const ticks: number[] = [];
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;

    for (let value = start; value <= end; value += step) {
      ticks.push(value);
    }

    return ticks;
  };

  const yTicks = niceTicks(yMin, yMax, 5);

  const xDomain = Math.max(data.length - 1, 1);
  const sidePad = 10;
  const xStep = (chartWidth - sidePad * 2) / xDomain;

  const toX = (index: number) =>
    padding.left + sidePad + index * xStep;

  const toY = (value: number) => {
    return (
      padding.top +
      chartHeight -
      ((value - yMin) / (yMax - yMin)) * chartHeight
    );
  };

  const baselineY = padding.top + chartHeight;

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

  const hoverItem = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoverX = hoveredIndex !== null ? toX(hoveredIndex) : 0;

  const tooltipX = useMemo(() => {
    if (hoveredIndex === null) return 0;

    const preferred = toX(hoveredIndex) + 18;
    return Math.min(preferred, width - 180);
  }, [hoveredIndex]);

  const tooltipY = useMemo(() => {
    if (!hoverItem) return 0;

    const highestPoint = Math.min(
      toY(hoverItem.image),
      toY(hoverItem.video),
      toY(hoverItem.omnihuman),
      toY(hoverItem.dreamactor),
    );

    return Math.max(12, highestPoint - 110);
  }, [hoverItem]);

  const series = [
    {
      key: "image",
      color: colors.image,
      points: imagePoints,
      label: "Image",
      values: data.map((item) => item.image),
      gradientId: "gImage",
      strokeDasharray: undefined,
    },
    {
      key: "video",
      color: colors.video,
      points: videoPoints,
      label: "Video",
      values: data.map((item) => item.video),
      gradientId: "gVideo",
      strokeDasharray: undefined,
    },
    {
      key: "human",
      color: colors.human,
      points: humanPoints,
      label: "Human",
      values: data.map((item) => item.omnihuman),
      gradientId: "gHuman",
      strokeDasharray: "6 4",
    },
    {
      key: "dreamactor",
      color: colors.dreamactor,
      points: dreamactorPoints,
      label: "Dream",
      values: data.map((item) => item.dreamactor),
      gradientId: "gDreamactor",
      strokeDasharray: "2 4",
    },
  ];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={320}
      role="img"
      aria-label="Generation trends"
      style={{
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="gImage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.image} stopOpacity="0.28" />
          <stop offset="100%" stopColor={colors.image} stopOpacity="0" />
        </linearGradient>

        <linearGradient id="gVideo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.video} stopOpacity="0.24" />
          <stop offset="100%" stopColor={colors.video} stopOpacity="0" />
        </linearGradient>

        <linearGradient id="gHuman" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.human} stopOpacity="0.18" />
          <stop offset="100%" stopColor={colors.human} stopOpacity="0" />
        </linearGradient>

        <linearGradient id="gDreamactor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.dreamactor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={colors.dreamactor} stopOpacity="0" />
        </linearGradient>

        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="8"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={padding.left}
            x2={padding.left + chartWidth}
            y1={toY(tick)}
            y2={toY(tick)}
            stroke={colors.grid}
            strokeWidth={1}
            strokeDasharray="4 6"
            opacity={0.7}
          />
          <text
            x={padding.left - 12}
            y={toY(tick) + 4}
            textAnchor="end"
            fontSize="11"
            fill={colors.axis}
            opacity={0.75}
          >
            {tick}
          </text>
        </g>
      ))}

      <line
        x1={padding.left}
        x2={padding.left + chartWidth}
        y1={baselineY}
        y2={baselineY}
        stroke={colors.grid}
        strokeWidth={1}
        opacity={0.9}
      />

      {series.map((item) => (
        <path
          key={`${item.key}-area`}
          d={smoothAreaPath(item.points, baselineY)}
          fill={`url(#${item.gradientId})`}
        />
      ))}

      {series.map((item) => (
        <path
          key={`${item.key}-line`}
          d={smoothLinePath(item.points)}
          stroke={item.color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={item.strokeDasharray}
          filter="url(#softShadow)"
        />
      ))}

      {data.map((item, index) => {
        const showLabel =
          data.length <= 10 ||
          index === 0 ||
          index === data.length - 1 ||
          index % Math.ceil(data.length / 8) === 0;

        return (
          <g key={`${item.month}-${index}`}>
            <rect
              x={toX(index) - xStep / 2}
              y={padding.top}
              width={Math.max(xStep, 40)}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />

            {showLabel && (
              <text
                x={toX(index)}
                y={height - 18}
                textAnchor="middle"
                fontSize="11"
                fill={colors.axis}
                opacity={0.85}
              >
                {item.month}
              </text>
            )}
          </g>
        );
      })}

      {hoverItem && (
        <>
          <line
            x1={hoverX}
            x2={hoverX}
            y1={padding.top}
            y2={baselineY}
            stroke={colors.grid}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          <rect
            x={tooltipX}
            y={tooltipY}
            width={160}
            height={102}
            rx={14}
            fill={colors.tooltipBg}
            stroke={colors.tooltipBorder}
            filter="url(#softShadow)"
          />

          <text
            x={tooltipX + 14}
            y={tooltipY + 22}
            fontSize="12"
            fontWeight="700"
            fill={colors.tooltipText}
          >
            {hoverItem.month}
          </text>

          <text
            x={tooltipX + 14}
            y={tooltipY + 42}
            fontSize="11"
            fill={colors.image}
          >
            Image: {hoverItem.image}
          </text>

          <text
            x={tooltipX + 14}
            y={tooltipY + 58}
            fontSize="11"
            fill={colors.video}
          >
            Video: {hoverItem.video}
          </text>

          <text
            x={tooltipX + 14}
            y={tooltipY + 74}
            fontSize="11"
            fill={colors.human}
          >
            Human: {hoverItem.omnihuman}
          </text>

          <text
            x={tooltipX + 14}
            y={tooltipY + 90}
            fontSize="11"
            fill={colors.dreamactor}
          >
            Dream: {hoverItem.dreamactor}
          </text>
        </>
      )}

      {series.map((item) =>
        item.points.map((point, index) => {
          const isActive = hoveredIndex === index;

          return (
            <g key={`${item.key}-${index}`}>
              {isActive && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={10}
                  fill={item.color}
                  opacity={0.15}
                />
              )}

              <circle
                cx={point.x}
                cy={point.y}
                r={isActive ? 5 : 3.5}
                fill="#fff"
                stroke={item.color}
                strokeWidth={isActive ? 3 : 2}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              />
            </g>
          );
        }),
      )}
    </svg>
  );
}