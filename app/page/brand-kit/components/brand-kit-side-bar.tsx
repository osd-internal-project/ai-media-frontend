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
  const { isMobile } = useResponsive();

  // Merge style prop for mobile overlay, fallback to default for desktop
  const mergedStyle: React.CSSProperties = {
    width: isMobile ? '100vw' : 270,
    height:  '100%', // mobile overlay: 100vh, desktop: 100% of parent
    background: semantic.colorBgContainer,
    padding:isMobile ? 24 : 16,
    borderRight: !isMobile ? `1px solid ${semantic.colorBorder}` : undefined,
    position: isMobile ? "fixed" : "sticky",
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    zIndex: isMobile ? 1200 : undefined,
    ...style,
  };
  return (
    <div style={mergedStyle}>
      {isMobile && onClose && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            background: semantic.colorBgContainer,
            zIndex: 1300,
          }}
        >
          <Button
            type="text"
            onClick={onClose}
            icon={<CloseOutlined style={{ color: semantic.colorTextBase, fontSize: 22 }} />}
            style={{
              width: 36,
              height: 36,
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
        </div>
      )}
      <Row align="middle" style={{ width: '100%', marginBottom: isMobile ? 8 : 0 }} justify="space-between">
        <Col>
          <Text style={{ color: semantic.colorTextBase, fontSize:  18  }}>
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
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onCreateKit}
            style={{ color: semantic.colorTextSecondary, fontSize: "16px" , padding: isMobile ? 2 : 6 }}
          />
        </Col>
      </Row>
      <Divider style={{ margin: isMobile ? "8px 0 8px 0" : "16px 0 16px 0" }} />
      {/* Brand Kit List with loading and animation */}
      <div style={{ minHeight: 80, position: 'relative', flex: 1, overflow: isMobile ? 'visible' : undefined }}>
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
              overflow: isMobile ? 'visible' : undefined,
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
    </div>
  );
}