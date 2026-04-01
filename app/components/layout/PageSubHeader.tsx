"use client";

import React from "react";
import { Col, Row, Space, Tag, Typography } from "antd";
import "./LayoutStyle.css";

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
  return (
    <div
      style={{
        minHeight: 54 ,
        height: "auto",
        padding: compact ? "10px 18px" : "14px 24px",
        backgroundColor: background,
        borderBottom: `1px solid ${borderColor}`,
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
          <Space size={8} align="center" wrap>
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
