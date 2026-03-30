"use client";

import React, { useState } from "react";
import BrandKitItem from "./brand-kit-item";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Layout, Typography, Button, Space, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

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
};

export default function BrandKitSidebar({
  brandKits,
  activeIndex,
  onChangeIndex,
  onCreateKit,
  onEditKit,
  onDeleteKit,
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
          borderRight: `1px solid ${semantic.colorBorder}`, position: "sticky", top: 0,
        }}
       
      >
        {/* Header */}
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            
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
        <Divider style={{ margin: "16px 0 16px 0" }} />
        {/* Brand Kit List */}

        {brandKits.map((kit, index) => (
          <BrandKitItem
            key={index}
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
      </Sider>
    </>
  );
}