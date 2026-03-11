"use client";

import React, { useState } from "react";
import { Layout, Typography, Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

const { Sider } = Layout;
const { Text } = Typography;

export interface BrandKitSidebarItem {
  name: string;
  industry: string;
  colors: Array<{ hex: string }>;
  fonts: number;
  colorCount: number;
}

type BrandKitSidebarProps = {
  brandKits: BrandKitSidebarItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onCreateKit: () => void;
};

export default function BrandKitSidebar({
  brandKits,
  activeIndex,
  onChangeIndex,
  onCreateKit,
}: BrandKitSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  return (
    <>
      <Sider
        width={270}
        style={{
          background: semantic.colorBgContainer,
          padding: 20,
          borderRight: `1px solid ${semantic.colorBorder}`,
        }}
      >
        {/* Header */}
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: semantic.colorTextBase, fontSize: 16 }}>
            Brand Kits
            <span
              style={{
                marginLeft: 8,
                background: semantic.colorBgTextActive,
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 12,
                color: semantic.colorTextSecondary,
              }}
            >
              {brandKits.length}
            </span>
          </Text>

          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onCreateKit}
            style={{ color: semantic.colorTextSecondary }}
          />
        </Space>

        {/* Brand Kit List */}

        {brandKits.map((kit, index) => (
          <div
            key={index}
            onClick={() => onChangeIndex(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              padding: 14,
              borderRadius: 14,
              marginBottom: 10,
              cursor: "pointer",
              background:
                activeIndex === index
                  ? semantic.colorBgTextActive
                  : hoveredIndex === index
                    ? semantic.colorPrimaryBg
                    : "transparent",
              border: `1px solid ${activeIndex === index ? semantic.colorPrimary : "transparent"}`,
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 2,
                }}
              >
                {kit.colors.slice(0, 3).map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: c.hex,
                      border: `1px solid ${semantic.colorBorder}`,
                    }}
                  />
                ))}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ color: semantic.colorTextBase, fontSize: 14 }}>{kit.name}</div>

                <div
                  style={{
                    color: semantic.colorTextSecondary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {kit.industry}
                </div>

                <div
                  style={{
                    color: semantic.colorTextSecondary,
                    opacity: 0.8,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {kit.colorCount} colors · {kit.fonts} fonts
                </div>
              </div>
            </div>
          </div>
        ))}
      </Sider>
    </>
  );
}