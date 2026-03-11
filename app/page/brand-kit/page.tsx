"use client";

import React, { useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Tabs,
  message,
  Space,
} from "antd";
import {
  PlusOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  PictureOutlined,
  BranchesOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import BrandKitSidebar from "./components/brand-kit-side-bar";
import CreateBrandKitForm from "./components/create-brand-kit-form";

const { Content } = Layout;
const { Title, Text } = Typography;

interface ColorItem {
  name: string;
  hex: string;
  type: string;
}

interface BrandKit {
  name: string;
  industry: string;
  updatedAt: string;
  fonts: number;
  colors: ColorItem[];
}

export default function BrandKitPage() {
  const [messageApi, contextHolder] = message.useMessage();
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
    },
    {
      name: "OSD Corporate",
      industry: "Corporate / Finance",
      updatedAt: "2026-02-20",
      fonts: 2,
      colors: [
        { name: "Corporate Blue", hex: "#1B4FD8", type: "Primary" },
        { name: "Slate Gray", hex: "#334155", type: "Secondary" },
        { name: "Signal Amber", hex: "#A9740E", type: "Accent" },
        { name: "Mist", hex: "#D1D5DB", type: "Neutral" },
        { name: "Night", hex: "#020817", type: "Neutral" },
      ],
    },
    {
      name: "Demo_KTC — Retail",
      industry: "Retail / E-commerce",
      updatedAt: "2026-01-10",
      fonts: 2,
      colors: [
        { name: "Red Punch", hex: "#EF4444", type: "Primary" },
        { name: "Orange Burst", hex: "#F97316", type: "Accent" },
        { name: "Sun", hex: "#FACC15", type: "Accent" },
      ],
    },
  ]);

  const [selectedKitIndex, setSelectedKitIndex] = useState(1);

  const [openKitModal, setOpenKitModal] = useState(false);
  const [openColorModal, setOpenColorModal] = useState(false);

  const [kitForm] = Form.useForm();
  const [colorForm] = Form.useForm();

  const selectedKit = brandKits[selectedKitIndex];

  const copyColor = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    messageApi.success(`Copied ${hex}`);
  };

  const addBrandKit = () => {
    kitForm.validateFields().then((values) => {
      const newKit: BrandKit = {
        name: values.name,
        industry: values.industry,
        updatedAt: new Date().toISOString().slice(0, 10),
        fonts: 2,
        colors: [],
      };

      setBrandKits([...brandKits, newKit]);
      setSelectedKitIndex(brandKits.length);
      setOpenKitModal(false);
      kitForm.resetFields();
    });
  };

  const addColor = () => {
    colorForm.validateFields().then((values) => {
      const updated = [...brandKits];

      updated[selectedKitIndex].colors.push({
        name: values.name,
        hex: values.hex,
        type: values.type,
      });

      setBrandKits(updated);
      setOpenColorModal(false);
      colorForm.resetFields();
    });
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#020817" }}>
      {contextHolder}
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
        onCreateKit={() => setOpenKitModal(true)}
      />

      <Layout>
        <Content style={{ padding: 40 }}>
          <Row justify="space-between" align="middle">
            <div>
              <Title style={{ color: "#e5e7eb", margin: 0, fontSize: 28 }}>
                {selectedKit.name}
              </Title>
              <Text style={{ color: "#64748b" }}>
                {selectedKit.industry} · Updated {selectedKit.updatedAt}
              </Text>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpenColorModal(true)}
            >
              Add Color
            </Button>
          </Row>

          <Tabs
            style={{ marginTop: 30 }}
            defaultActiveKey="colors"
            tabBarStyle={{ color: "#94a3b8" }}
            items={[
              {
                key: "colors",
                label: (
                  <Space size={6}>
                    <BgColorsOutlined />
                    <span>Colors</span>
                  </Space>
                ),
                children: (
                  <div>
                    <Text style={{ color: "#64748b" }}>
                      {selectedKit.colors.length} colors defined · click swatch to copy hex
                    </Text>

                    <Row gutter={[24, 24]} style={{ marginTop: 18 }}>
                    {selectedKit.colors.map((color) => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={`${color.name}-${color.hex}`}>
                        <Tooltip title="Click to copy">
                          <Card
                            hoverable
                            onClick={() => copyColor(color.hex)}
                            style={{
                              background: "#0f172a",
                              border: "1px solid #1e293b",
                              borderRadius: 16,
                            }}
                          >
                            <div
                              style={{
                                height: 120,
                                borderRadius: 12,
                                background: color.hex,
                                marginBottom: 16,
                              }}
                            />

                              <Text style={{ color: "#64748b", fontSize: 12 }}>
                              {color.type.toUpperCase()}
                            </Text>

                            <Title
                              level={5}
                                style={{ margin: "4px 0", color: "#e5e7eb" }}
                            >
                              {color.name}
                            </Title>

                              <Text style={{ color: "#93c5fd" }}>
                              {color.hex}
                            </Text>
                          </Card>
                        </Tooltip>
                      </Col>
                    ))}
                      </Row>
                    </div>
                ),
              },

              {
                key: "typography",
                  label: (
                    <Space size={6}>
                      <FontSizeOutlined />
                      <span>Typography</span>
                    </Space>
                  ),
                  children: <div style={{ color: "#e5e7eb" }}>Typography Config</div>,
              },

              {
                key: "logos",
                  label: (
                    <Space size={6}>
                      <PictureOutlined />
                      <span>Logos</span>
                    </Space>
                  ),
                  children: <div style={{ color: "#e5e7eb" }}>Logo Assets</div>,
              },

                {
                  key: "ci",
                  label: (
                    <Space size={6}>
                      <BranchesOutlined />
                      <span>CI Prompt</span>
                    </Space>
                  ),
                  children: <div style={{ color: "#e5e7eb" }}>CI Prompt Template</div>,
                },

              {
                key: "voice",
                  label: (
                    <Space size={6}>
                      <MessageOutlined />
                      <span>Brand Voice</span>
                    </Space>
                  ),
                  children: <div style={{ color: "#e5e7eb" }}>Brand Voice Prompt</div>,
              },
            ]}
          />
        </Content>
      </Layout>

      <Modal
        open={openKitModal}
          title="New Brand Kit"
        onCancel={() => setOpenKitModal(false)}
        onOk={addBrandKit}
          okText="Create Kit"
          cancelText="Cancel"
          styles={{
            content: { background: "#111827", border: "1px solid #1f2937" },
            header: { background: "#111827" },
          }}
      >
          <CreateBrandKitForm form={kitForm} />
      </Modal>

      <Modal
        open={openColorModal}
        title="Add Color"
        onCancel={() => setOpenColorModal(false)}
        onOk={addColor}
        okText="Add"
          styles={{
            content: { background: "#111827", border: "1px solid #1f2937" },
            header: { background: "#111827" },
          }}
      >
        <Form form={colorForm} layout="vertical">
          <Form.Item
            label="Color Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Primary Purple" />
          </Form.Item>

          <Form.Item
            label="HEX"
            name="hex"
            rules={[{ required: true }]}
          >
            <Input placeholder="#6F6ADE" />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Primary", value: "Primary" },
                { label: "Secondary", value: "Secondary" },
                { label: "Accent", value: "Accent" },
                { label: "Neutral", value: "Neutral" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}