"use client";

import React, { useState } from "react";
import { Spin } from "antd";
import BrandKitItem from "./brand-kit-item";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Row, Col, Typography, Button, Space, Divider } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { PlusOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";

const { Text } = Typography;

export interface BrandKitSidebarItem {
  id?: string;
  name: string;
  industry: string;
  isDefault?: boolean;
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
  style = {},
  onClose,
}: BrandKitSidebarProps & { style?: React.CSSProperties; onClose?: () => void }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();

  // Merge style prop for mobile overlay, fallback to default for desktop
  const mergedStyle: React.CSSProperties = {
    width: isMobile ? "100vw" : isTablet ? 240 : 270,
    height:  '100%', // mobile overlay: 100vh, desktop: 100% of parent
    background: semantic.colorBgContainer,
    padding: isMobile ? 16 : isTablet ? 12 : 16,
    borderRight: !isMobile ? `1px solid ${semantic.colorBorder}` : undefined,
    position: isMobile ? "fixed" : "sticky",
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    zIndex: isMobile ? 1200 : undefined,
    transition: "transform 220ms ease, box-shadow 220ms ease, opacity 220ms ease",
    animation: isMobile || isTablet ? "brandkitSidebarSlideIn 240ms ease" : "none",
    ...style,
  };
  return (
    <div style={mergedStyle}>
      <Row align="middle" style={{ width: "100%", marginBottom: isMobile ? 6 : 0 }} justify="space-between">
        <Col>
          <Text style={{ color: semantic.colorTextBase, fontSize: isMobile ? 16 : isTablet ? 17 : 18 }}>
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
        </Col>
        <Col>
          <Space size={isMobile ? 4 : 8}>
            <Button
              className="brandkit-sidebar-action"
              type="text"
              icon={<PlusOutlined />}
              onClick={onCreateKit}
              style={{ color: semantic.colorTextSecondary, fontSize: "16px" , padding: isMobile ? 2 : 6 }}
            />
            {isMobile && onClose ? (
              <Button
                className="brandkit-sidebar-action"
                type="text"
                onClick={onClose}
                icon={<CloseOutlined style={{ color: semantic.colorTextBase, fontSize: 18 }} />}
                style={{
                  width: 32,
                  height: 32,
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${semantic.colorBorder}`,
                  borderRadius: 8,
                  background: semantic.colorBgContainer,
                }}
                aria-label="ปิดเมนู Brandkit"
              />
            ) : null}
          </Space>
        </Col>
      </Row>
      <Divider style={{ margin: isMobile ? "8px 0" : isTablet ? "12px 0" : "16px 0" }} />
      {/* Brand Kit List with loading and animation */}
      <div
        className="brandkit-sidebar-item-container"
        style={{
          minHeight: 80,
          position: "relative",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
          paddingRight: 2,
        }}
      >
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
              <div
                key={kit.id || index}
                className="brandkit-sidebar-item"
                style={{ animationDelay: `${Math.min(index * 36, 260)}ms` }}
              >
                <BrandKitItem
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
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fadeInSidebar {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }

        @keyframes brandkitSidebarSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .brandkit-sidebar-action {
          transition: all 180ms ease;
        }

        .brandkit-sidebar-action:hover {
          transform: translateY(-1px);
          background: rgba(0, 0, 0, 0.04);
        }

        .brandkit-sidebar-item {
          animation: brandkitSidebarItemIn 320ms ease both;
          transition: transform 180ms ease;
        }

        .brandkit-sidebar-item:hover {
          transform: translateY(-1px);
        }

        @keyframes brandkitSidebarItemIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brandkit-sidebar-item-container::-webkit-scrollbar {
          width: 8px;
        }

        .brandkit-sidebar-item-container::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.28);
          border-radius: 999px;
        }

        .brandkit-sidebar-item-container::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}