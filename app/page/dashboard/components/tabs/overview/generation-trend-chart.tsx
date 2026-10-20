import { IGenerationSeriesPoint } from "@/app/common/dashbaord";
import React, { useMemo, useState } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import {
  GENERATION_SERIES_KEYS,
  GENERATION_SERIES_LABEL,
  type GenerationSeriesKey,
} from "@/app/common/generation-type";

/** Dash pattern per series, so overlapping lines stay distinguishable. */
const STROKE_DASH: Readonly<Record<GenerationSeriesKey, string | undefined>> = {
  image: undefined,
  video: undefined,
  omnihuman: "6 4",
  dreamactor: "2 4",
  audio: "8 3 2 3",
  other: "1 3",
};

/** Most x-axis labels drawn before they start colliding; the rest are skipped. */
const MAX_X_LABELS_DESKTOP = 12;
const MAX_X_LABELS_MOBILE = 5;

type GenerationTrendChartProps = {
  data: IGenerationSeriesPoint[];
  /** Which series to draw. Driven by the type multi-select in the filter bar. */
  visibleTypes: GenerationSeriesKey[];
  colors: {
    /** Colour per series, shared with the legend so they cannot disagree. */
    types: Record<GenerationSeriesKey, string>;
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
  // A spline through two points is just a line; draw it straight.
  if (points.length === 2) {
    return `M${svgPoint(points[0])} L${svgPoint(points[1])}`;
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
  visibleTypes,
  colors,
}: GenerationTrendChartProps) {

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { isMobile } = useResponsive();

  // Keep the canonical display order regardless of the order the user picked them in.
  const activeTypes = GENERATION_SERIES_KEYS.filter((key) =>
    visibleTypes.includes(key),
  );

  // Responsive chart size
  const width = isMobile ? 340 : 980;
  const height = isMobile ? 220 : 320;

  // Responsive padding
  const padding = {
    top: isMobile ? 12 : 24,
    right: isMobile ? 8 : 24,
    bottom: isMobile ? 32 : 54,
    left: isMobile ? 32 : 52,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;


  // Every bucket is drawn: trimming leading empty buckets made a 3-month range show 2 points.
  const displayData = data;

  const allValues = displayData
    .flatMap((item) => activeTypes.map((key) => item[key]))
    .filter((value) => Number.isFinite(value));

  const hasActiveData = allValues.some((v) => v > 0);

  // Counts and credits are never negative, so the axis always starts at 0.
  const yMin = 0;
  const dataMax = allValues.length ? Math.max(...allValues) : 0;

  const niceTicks = (max: number, count: number) => {
    const rawStep = Math.max(max, 1) / (count - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    let step = magnitude;
    if (normalized > 5) step = 10 * magnitude;
    else if (normalized > 2) step = 5 * magnitude;
    else if (normalized > 1) step = 2 * magnitude;
    // Generation counts are whole numbers; a 0.5 tick would be meaningless.
    step = Math.max(1, step);

    const ticks: number[] = [0];
    while (ticks[ticks.length - 1] < max || ticks.length < 2) {
      ticks.push(ticks[ticks.length - 1] + step);
    }
    return ticks;
  };

  const yTicks = niceTicks(dataMax, 5);
  // Top tick is always >= the largest value, so no point can sit above the axis.
  const yMax = yTicks[yTicks.length - 1];

  const xDomain = Math.max(displayData.length - 1, 1);
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


  const hoverItem = hoveredIndex !== null ? displayData[hoveredIndex] : null;
  const hoverX = hoveredIndex !== null ? toX(hoveredIndex) : 0;

  const maxLabels = isMobile ? MAX_X_LABELS_MOBILE : MAX_X_LABELS_DESKTOP;
  const labelEvery = Math.max(1, Math.ceil(displayData.length / maxLabels));
  const showLabel = (index: number) =>
    index % labelEvery === 0 || index === displayData.length - 1;


  const tooltipX = useMemo(() => {
    if (hoveredIndex === null) return 0;

    const preferred = toX(hoveredIndex) + 18;
    return Math.min(preferred, width - 180);
  }, [hoveredIndex, displayData]);

  // One series per visible type, all labels and colours from the shared type module.
  const series = activeTypes.map((key) => ({
    key,
    color: colors.types[key],
    label: GENERATION_SERIES_LABEL[key],
    values: displayData.map((item) => item[key]),
    points: displayData.map((item, index) => ({
      x: toX(index),
      y: toY(item[key]),
    })),
    gradientId: `gradient-${key}`,
    strokeDasharray: STROKE_DASH[key],
  }));

  const tooltipY = useMemo(() => {
    if (!hoverItem) return 0;

    const highestPoint = Math.min(
      ...activeTypes.map((key) => toY(hoverItem[key])),
    );

    return Math.max(12, highestPoint - 110);
  }, [hoverItem, activeTypes]);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Generation trends"
      style={{
        overflow: "visible",
      }}
    >
      <defs>
        {series.map((item) => (
          <linearGradient
            key={item.gradientId}
            id={item.gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={item.color} stopOpacity="0.24" />
            <stop offset="100%" stopColor={item.color} stopOpacity="0" />
          </linearGradient>
        ))}

        <clipPath id="trendPlotArea">
          <rect
            x={padding.left}
            y={padding.top - 8}
            width={chartWidth}
            height={chartHeight + 16}
          />
        </clipPath>

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
            x={padding.left - (isMobile ? 6 : 12)}
            y={toY(tick) + (isMobile ? 2 : 4)}
            textAnchor="end"
            fontSize={isMobile ? 9 : 11}
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


      {hasActiveData && (
        <g clipPath="url(#trendPlotArea)">
          {series.map((item) => {
            // ไม่วาดถ้าค่าทุกจุดเป็น 0 หรือค่าทุกจุดเท่ากันหมด (กรณี flat line)
            // An all-zero series would sit on the baseline and hide the axis line.
            if (item.values.every((v) => v === 0)) return null;
            return (
              <path
                key={`${item.key}-area`}
                d={smoothAreaPath(item.points, baselineY)}
                fill={`url(#${item.gradientId})`}
              />
            );
          })}
          {series.map((item) => {
            // An all-zero series would sit on the baseline and hide the axis line.
            if (item.values.every((v) => v === 0)) return null;
            return (
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
            );
          })}
        </g>
      )}

     

      {displayData.map((item, index) => (
        <g key={`${item.bucket}-${index}`}>
          <rect
            x={toX(index) - xStep / 2}
            y={padding.top}
            width={Math.max(xStep, 40)}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onTouchStart={() => setHoveredIndex(index)}
            onTouchEnd={() => setHoveredIndex(null)}
          />
          {showLabel(index) && (
            <text
              x={toX(index)}
              y={height - (isMobile ? 10 : 18)}
              textAnchor="middle"
              fontSize={isMobile ? 9 : 11}
              fill={colors.axis}
              opacity={0.85}
            >
              {item.bucket}
            </text>
          )}
        </g>
      ))}

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
            width={170}
            height={30 + series.length * 16}
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
            {hoverItem.bucket}
          </text>

          {/* One row per visible series — previously two rows were both labelled "Human". */}
          {series.map((item, index) => (
            <text
              key={`tooltip-${item.key}`}
              x={tooltipX + 14}
              y={tooltipY + 42 + index * 16}
              fontSize="11"
              fill={item.color}
            >
              {item.label}: {hoverItem[item.key]}
            </text>
          ))}
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
                onTouchStart={() => setHoveredIndex(index)}
                onTouchEnd={() => setHoveredIndex(null)}
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