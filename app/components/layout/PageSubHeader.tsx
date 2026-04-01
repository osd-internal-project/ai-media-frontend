"use client";

import React from "react";
import { Space, Tag, Typography } from "antd";
import useResponsive from "@/app/hooks/useResponsive";

type PageSubHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  count?: number;
  rightSlot?: React.ReactNode;
  background: string;
  borderColor: string;
  titleColor: string;
  subtitleColor: string;
  chipBg: string;
  chipText: string;
  compact?: boolean;
};

export default function PageSubHeader({
  title,
  subtitle,
  count,
  rightSlot,
  background,
  borderColor,
  titleColor,
  subtitleColor,
  chipBg,
  chipText,
  compact = true,
}: PageSubHeaderProps) {
  const { isMobile, isTablet } = useResponsive();
  const isStack = isMobile || isTablet;
  return (
    <div
      style={{
        minHeight: compact ? 56 : 64,
        padding: compact ? "12px 18px" : "16px 24px",
        backgroundColor: background,
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        flexDirection: isStack ? "column" : "row",
        alignItems: isStack ? "stretch" : "center",
        justifyContent: isStack ? "center" : "space-between",
        gap: 12,
        textAlign: isStack ? "center" : undefined,
      }}
    >
      <div style={{ minWidth: 0, width: isStack ? "100%" : undefined }}>
        <Space size={8} align="center" wrap style={{ justifyContent: isStack ? "center" : undefined, width: isStack ? "100%" : undefined }}>
          <Typography.Title
            level={3}
            style={{
              margin: 0,
              fontSize: compact ? 22 : undefined,
              color: titleColor,
            }}
          >
            {title}
          </Typography.Title>
          {typeof count === "number" ? (
            <Tag
              style={{
                marginInlineEnd: 0,
                border: "none",
                borderRadius: 999,
                backgroundColor: chipBg,
                color: chipText,
                fontWeight: 500,
                lineHeight: 1,
                padding: compact ? "3px 8px" : "4px 10px",
                fontSize: compact ? 12 : 14,
              }}
            >
              {count}
            </Tag>
          ) : null}
        </Space>

        {subtitle ? (
          <Typography.Text style={{ color: subtitleColor, display: "block", marginTop: 2 }}>
            {subtitle}
          </Typography.Text>
        ) : null}
      </div>

      {rightSlot ? <div style={isStack ? { width: "100%", marginTop: 8 } : {}}>{rightSlot}</div> : null}
    </div>
  );
}
