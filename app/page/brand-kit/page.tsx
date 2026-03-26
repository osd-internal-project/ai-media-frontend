"use client";

import React, { useState } from "react";
import "./styles/style.css";
import { Layout, Row, Typography, Button, Space, Tabs, message, Divider } from "antd";
import {
  PlusOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  PictureOutlined,
  BranchesOutlined,
  MessageOutlined,
  StarOutlined,
} from "@ant-design/icons";

import BrandKitSidebar from "./components/brand-kit-side-bar";
import CreateBrandKitForm from "./components/create-brand-kit-form";
import { Modal, Form as AntForm } from "antd";
import ColorTab from "./components/tabs/color/color-tab";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { Divide } from "lucide-react";
import TypographyTab from "./components/tabs/typography/typography-tab";
import CIPromptPage from "./components/tabs/ci-prompt/ci-prompt";
import CIPromptTab from "./components/tabs/ci-prompt/ci-prompt";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface ColorItem {
  name: string;
  hex: string;
  type: string;
}

interface FontItem {
  name: string;
  type: "heading" | "body";
  weight: number;
  preview: string;
}

interface BrandKit {
  name: string;
  industry: string;
  updatedAt: string;
  fonts: number;
  colors: ColorItem[];
  fontsData: FontItem[];
  ciPrompt: string;
  negativePrompt: string;
}

export default function BrandKitPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedTab, setSelectedTab] = useState<string>("colors");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = AntForm.useForm();
   const { mode } = useThemeMode();
    const semantic = getThemeConfig(mode).token ?? {};

  // ปรับ Layout ให้สูงเต็ม parent container (ไม่ fix 100vh)
  // ให้แน่ใจว่า parent container (layout.tsx) มี height: 100% หรือ min-h-screen

const [brandKits, setBrandKits] = useState<BrandKit[]>([
  {
    name: "AI Cave — Main Brand",
    industry: "Technology / AI",
    updatedAt: "2026-02-20",
    fonts: 4,
    colors: [
      { name: "Brand Purple", hex: "#6F6ADE", type: "Primary" },
      { name: "Soft Lavender", hex: "#A8A4F0", type: "Secondary" },
      { name: "Mint Accent", hex: "#1ED6B4", type: "Accent" },
    ],
    fontsData: [
      { name: "Montserrat", type: "heading", weight: 900, preview: "The quick brown fox jumps over the lazy dog" },
      { name: "Open Sans", type: "body", weight: 400, preview: "The quick brown fox jumps over the lazy dog" },
    ],

    // ✅ เพิ่ม
    ciPrompt:
      "Vibrant energetic retail style, bold composition, purple futuristic tone (#6F6ADE), modern AI branding",
    negativePrompt:
      "dull colors, low contrast, boring layout, grayscale",
  },

  {
    name: "OSD Corporate",
    industry: "Corporate / Finance",
    updatedAt: "2026-02-20",
    fonts: 2,
    colors: [
      { name: "Corporate Blue", hex: "#1B4FD8", type: "Primary" },
      { name: "Slate Gray", hex: "#334155", type: "Secondary" },
    ],
    fontsData: [
      { name: "Roboto", type: "heading", weight: 700, preview: "The quick brown fox jumps over the lazy dog" },
      { name: "Lato", type: "body", weight: 400, preview: "The quick brown fox jumps over the lazy dog" },
    ],

    // ✅ เพิ่ม
    ciPrompt:
      "clean corporate style, blue professional tone (#1B4FD8), minimal layout, high readability",
    negativePrompt:
      "playful, colorful, chaotic, handwritten style",
  },

  {
    name: "Demo_KTC — Retail",
    industry: "Retail / E-commerce",
    updatedAt: "2026-01-10",
    fonts: 2,
    colors: [
      { name: "Red Punch", hex: "#EF4444", type: "Primary" },
      { name: "Orange Burst", hex: "#F97316", type: "Accent" },
    ],
    fontsData: [
      { name: "Poppins", type: "heading", weight: 700, preview: "The quick brown fox jumps over the lazy dog" },
      { name: "Nunito", type: "body", weight: 400, preview: "The quick brown fox jumps over the lazy dog" },
    ],

    // ✅ เพิ่ม
    ciPrompt:
      "vibrant retail style, red-orange palette (#EF4444, #F97316), energetic, promotional, bold layout",
    negativePrompt:
      "dark, luxury, monochrome, muted tones",
  },
]);

  const [selectedKitIndex, setSelectedKitIndex] = useState(0);
  const selectedKit = brandKits[selectedKitIndex];

  const updateCI = (ci: string, negative: string) => {
    const updated = [...brandKits];
    updated[selectedKitIndex] = {
      ...updated[selectedKitIndex],
      ciPrompt: ci,
      negativePrompt: negative,
    };
    setBrandKits(updated);
    messageApi.success("CI updated");
  };

  return (
    <Layout style={{ display: "flex", height: "100%" }}>
      {contextHolder}

      {/* Sidebar */}
      <BrandKitSidebar
        brandKits={brandKits.map((kit) => ({
          name: kit.name,
          industry: kit.industry,
          colors: kit.colors,
          fonts: kit.fonts,
          colorCount: kit.colors.length,
        }))}
        activeIndex={selectedKitIndex}
        onChangeIndex={setSelectedKitIndex}
        onCreateKit={() => setIsCreateModalOpen(true)}
      />

      <Modal
        title="New Brand Ki"
        open={isCreateModalOpen}
        onOk={() => {
          createForm.validateFields().then(values => {
            // TODO: handle create brand kit logic here
            messageApi.success("Brand kit created!");
            setIsCreateModalOpen(false);
            createForm.resetFields();
          });
        }}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        okText="Create Kit"
        cancelText="Cancel"
      >
        <CreateBrandKitForm form={createForm} />
      </Modal>

      {/* Main Layout: Header + Scrollable Content */}
      <Layout style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Header พร้อม Tabs */}
    <Header
  style={{
    
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    height: "auto",            // ✅ override default antd
    lineHeight: "normal",      // ✅ กัน Tabs เพี้ยน
    background: semantic.colorBgContainer,
    borderBottom: "1px solid " + semantic.colorBorder,
  }}
>
  {/* Top Section */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
              minHeight: 72,
              padding: "16px 40px 0 40px",
       
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Title
        style={{
          color: semantic.colorTextBase,
          margin: 0,
          fontSize: 28,
          lineHeight: 1.2,
        }}
      >
        {selectedKit.name}
      </Title>
      <Text style={{ color: semantic.colorTextSecondary, fontSize: 14 }}>
        {selectedKit.industry} · Updated {selectedKit.updatedAt}
      </Text>
    </div>

    <Button
      type="default"
      icon={<StarOutlined />}
      style={{ alignSelf: "flex-end", marginBottom: 8 }}
    >
      Default Kit
    </Button>
  </div>
<Divider style={{ margin: "16px 0 0 0", width: "100%", maxWidth: "100%" }} />
  {/* Tabs */}
  <Tabs
    activeKey={selectedTab}
    onChange={setSelectedTab}
    tabBarStyle={{
      margin: 0,                 // ✅ เอา margin ออก
      paddingTop: 12,            // ✅ ใช้ padding แทน
      paddingLeft: 40,
      paddingRight: 40,
    }}
    items={[
      { key: "colors", label: <Space size={6}><BgColorsOutlined />Colors</Space> },
      { key: "typography", label: <Space size={6}><FontSizeOutlined />Typography</Space> },
      { key: "logos", label: <Space size={6}><PictureOutlined />Logos</Space> },
      { key: "ci", label: <Space size={6}><BranchesOutlined />CI Prompt</Space> },
      { key: "voice", label: <Space size={6}><MessageOutlined />Brand Voice</Space> },
    ]}
  />
</Header>

        {/* Scrollable Content */}
        <Content
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 40,
            background: semantic.colorBgBase,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            height: "100%",
          }}
        >
          {/* Content ตาม Tab */}
          {selectedTab === "colors" && <ColorTab colors={selectedKit.colors} />}
          {selectedTab === "typography" && <TypographyTab fonts={selectedKit.fontsData} />}
          {selectedTab === "logos" &&  <div style={{ color: "#e5e7eb" }}>logo</div>}  
          {selectedTab === "ci" && <CIPromptTab
              ciPrompt={selectedKit.ciPrompt}
              negativePrompt={selectedKit.negativePrompt}
              onChange={updateCI}
            />}
          {selectedTab === "voice" && <div style={{ color: "#e5e7eb" }}>Brand Voice Prompt</div>}
        </Content>
      </Layout>
    </Layout>
  );
}