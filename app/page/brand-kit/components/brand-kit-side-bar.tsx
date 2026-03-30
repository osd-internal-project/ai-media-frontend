"use client";

import React, { useState } from "react";
import { Spin } from "antd";
import BrandKitItem from "./brand-kit-item";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Layout, Typography, Button, Space, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";

const { Sider } = Layout;
const { Text } = Typography;

export interface BrandKitSidebarItem {
  id?: string;
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
  onEditKit?: (index: number) => void;
  onDeleteKit?: (index: number) => void;
  loading?: boolean;
};

export default function BrandKitSidebar({
  brandKits,
  activeIndex,
  onChangeIndex,
  onCreateKit,
  onEditKit,
  onDeleteKit,
  loading = false,
}: BrandKitSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile } = useResponsive();

  return (
    <>
      <Sider
        width={isMobile ? 220 : 270}
        style={{
          background: semantic.colorBgContainer,
          padding: isMobile ? 10 : 20,
          borderRight: `1px solid ${semantic.colorBorder}`,
          position: isMobile ? "relative" : "sticky",
          top: 0,
          minHeight: isMobile ? "100vh" : undefined,
        }}
      >
        {/* Header */}
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: isMobile ? 8 : 0,
          }}
        >
          <Text style={{ color: semantic.colorTextBase, fontSize: isMobile ? 14 : 16 }}>
            Brand Kits
            <span
              style={{
                marginLeft: 8,
                background: semantic.colorBgTextActive,
                padding: isMobile ? "1px 6px" : "2px 8px",
                borderRadius: 20,
                fontSize: isMobile ? 11 : 12,
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
            style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 16 : 20, padding: isMobile ? 2 : 6 }}
          />
        </Space>
        <Divider style={{ margin: isMobile ? "8px 0 8px 0" : "16px 0 16px 0" }} />
        {/* Brand Kit List with loading and animation */}
        <div style={{ minHeight: 80, position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
              <Spin size="large" />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 6 : 12,
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.4s cubic-bezier(.4,0,.2,1)',
                animation: 'fadeInSidebar 0.5s',
              }}
            >
              {brandKits.map((kit: BrandKitSidebarItem, index: number) => (
                <BrandKitItem
                  key={kit.id || index}
                  kit={kit}
                  index={index}
                  activeIndex={activeIndex}
                  hoveredIndex={hoveredIndex}
                  semantic={semantic}
                  onChangeIndex={onChangeIndex}
                  setHoveredIndex={setHoveredIndex}
                  onEdit={() => onEditKit && onEditKit(index)}
                  onDelete={() => onDeleteKit && onDeleteKit(index)}
                />
              ))}
            </div>
          )}
        </div>
        <style jsx global>{`
          @keyframes fadeInSidebar {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </Sider>
    </>
  );
}