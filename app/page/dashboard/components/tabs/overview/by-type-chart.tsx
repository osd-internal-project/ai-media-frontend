import React, { useEffect, useMemo, useState } from "react";
import { ByTypeItem } from "../types";
import useResponsive from "@/app/hooks/useResponsive";
import { formatNumber } from "@/app/utils/format";

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
  const [animationProgress, setAnimationProgress] = useState(0);
  const { isMobile, isTablet } = useResponsive();

  const width = isMobile ? 320 : isTablet ? 360 : 260;
  const height = isMobile ? 220 : isTablet ? 220 : 180;
  const cx = width / 2;
  const cy = isMobile ? 108 : 96;
  const innerRadius = isMobile ? 56 : 54;
  const outerRadius = isMobile ? 88 : 84;
  const realTotal = data.reduce((sum, item) => sum + item.value, 0);
  const hasPositiveValue = realTotal > 0;
  const total = Math.max(realTotal, 1);

  useEffect(() => {
    let raf = 0;
    let start = 0;
    setAnimationProgress(0);

    const animate = (time: number) => {
      if (!start) start = time;
      const elapsed = time - start;
      const duration = 420;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(1 - Math.pow(1 - progress, 3));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [data]);

  // Add gap between arcs.
  // With no data we render no arcs at all — previously every slice was given an equal
  // synthetic value, which drew a full, colourful donut labelled "Total 0".
  const gapAngle = 2; // degrees
  let startAngle = 0;
  const arcs = (hasPositiveValue ? data : []).map((item) => {
    const angle = (item.value / total) * 360;
    const arcStart = startAngle + gapAngle / 2;
    const arcEnd = startAngle + angle - gapAngle / 2;
    const animatedEnd = arcStart + (arcEnd - arcStart) * animationProgress;
    const arc = {
      ...item,
      path: donutArc(cx, cy, innerRadius, outerRadius, arcStart, animatedEnd),
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
      onTouchEnd={() => setHoveredName(null)}
    >
      <circle
        cx={cx}
        cy={cy}
        r={outerRadius + 2}
        fill="none"
        stroke={colors.tooltipBorder}
        strokeOpacity={0.25}
        strokeWidth={1}
      />

      {arcs.map((arc) => (
        <path
          key={arc.name}
          d={arc.path}
          fill={arc.color}
          stroke="#fff"
          strokeWidth={2}
          onMouseEnter={() => setHoveredName(arc.name)}
          onTouchStart={() => setHoveredName(arc.name)}
          opacity={hoveredName && hoveredName !== arc.name ? 0.55 : 1}
          style={{ transition: "opacity 180ms ease" }}
        />
      ))}

      <text
        x={cx}
        y={cy - 4}
        fill={colors.tooltipText}
        fontSize={isMobile ? 11 : 10}
        textAnchor="middle"
        opacity={0.7}
      >
        Total
      </text>
      <text
        x={cx}
        y={cy + 14}
        fill={colors.tooltipText}
        fontSize={isMobile ? 18 : 16}
        fontWeight="700"
        textAnchor="middle"
      >
        {formatNumber(realTotal || 0)}
      </text>

      {hovered && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={cx - 72}
            y={cy - 74}
            width={144}
            height={42}
            rx={8}
            fill={colors.tooltipBg}
            stroke={colors.tooltipBorder}
          />
          <text
            x={cx}
            y={cy - 45}
            fill={colors.tooltipText}
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            {hovered.name}
          </text>
          <text
            x={cx}
            y={cy - 28}
            fill={hovered.color}
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            Value: {hovered.value}
          </text>
        </g>
      )}
    </svg>
  );
}
