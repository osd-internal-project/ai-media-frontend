"use client";

import React from "react";
import { Col, Row, Space, Tag, Typography, theme } from "antd";
import "./LayoutStyle.css";

type PageSubHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  count?: number;
  rightSlot?: React.ReactNode;
  titleColor: string;
  subtitleColor: string;
  compact?: boolean;
};

/** Page title row: sits on the page floor (no band) with the count chip in a primary tint (DESIGN.md Navigation). */
export default function PageSubHeader({
  title,
  subtitle,
  count,
  rightSlot,
  titleColor,
  subtitleColor,
  compact = true,
}: PageSubHeaderProps) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        minHeight: 54,
        height: "auto",
        padding: compact ? "16px 24px 8px" : "20px 24px 12px",
      }}
    >
      <Row
        align="middle"
        justify="space-between"
        gutter={[12, 8]}
        wrap={false}
        style={{ width: "100%" }}
      >
        <Col flex="1 1 auto" style={{ minWidth: 0 }}>
          <Space size={12} align="center" wrap>
            {/* The page's only h1. */}
            <Typography.Title
              level={1}
              style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 600,
                lineHeight: 1.2,
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
                  backgroundColor: `color-mix(in srgb, ${token.colorPrimary} 18%, ${token.colorBgContainer})`,
                  color: token.colorPrimaryText,
                  fontWeight: 600,
                  lineHeight: 1,
                  padding: "6px 12px",
                  fontSize: 14,
                  fontVariantNumeric: "tabular-nums",
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
        </Col>

        {rightSlot ? (
          <Col flex="none" style={{ textAlign: "right" }}>
            {rightSlot}
          </Col>
        ) : null}
      </Row>
    </div>
  );
}
