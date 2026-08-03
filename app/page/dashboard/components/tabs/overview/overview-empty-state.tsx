"use client";

import React from "react";
import { Button, Space, Typography, theme } from "antd";

type OverviewEmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Vertical padding; use "compact" inside a chart card. */
  size?: "default" | "compact";
};

/**
 * Empty state for Overview panels that would otherwise render a chart full of zeroes.
 *
 * Colours come from the theme token rather than fixed Tailwind classes so this stays legible
 * in both light and dark mode (unlike the existing SectionEmptyState, which is dark-only).
 */
export default function OverviewEmptyState({
  icon,
  title,
  description,
  action,
  size = "default",
}: OverviewEmptyStateProps) {
  const { token } = theme.useToken();

  return (
    <div
      className="flex flex-col items-center justify-center text-center w-full"
      style={{ paddingBlock: size === "compact" ? 28 : 48 }}
    >
      <Space direction="vertical" size={10} align="center">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: token.colorFillTertiary,
            color: token.colorTextTertiary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>

        <Typography.Text strong>{title}</Typography.Text>

        <Typography.Text
          type="secondary"
          style={{ fontSize: 12, maxWidth: 320, display: "block" }}
        >
          {description}
        </Typography.Text>

        {action && (
          <Button type="primary" size="small" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Space>
    </div>
  );
}
