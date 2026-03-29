"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

import BrandKitServices from "@/app/services/brand-kit.service";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import type { TBrandKit } from "@/app/common/brand-kit";
import BrandKitSidebar from "./components/brand-kit-side-bar";
import CreateBrandKitForm from "./components/brand-kit-form";
import { Modal, Form as AntForm } from "antd";
import ColorTab from "./components/tabs/color/color-tab";
import type { TBrandKitDetail } from "@/app/common/brand-kit";
import BrandKitDetailServices from "@/app/services/brand-kit-detail.service";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { Divide, Palette } from "lucide-react";
import TypographyTab from "./components/tabs/typography/typography-tab";

import CIPromptTab from "./components/tabs/ci-prompt/ci-prompt";
import BrandKitForm from "./components/brand-kit-form";

const { Header, Content } = Layout;
const { Title, Text } = Typography;



interface FontItem {
  name: string;
  type: "heading" | "body";
  weight: number;
  preview: string;
}



export default function BrandKitPage() {
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedTab, setSelectedTab] = useState<string>("colors");
  // Unified modal state for create/edit
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form] = AntForm.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  // ปรับ Layout ให้สูงเต็ม parent container (ไม่ fix 100vh)
  // ให้แน่ใจว่า parent container (layout.tsx) มี height: 100% หรือ min-h-screen

const [brandKits, setBrandKits] = useState<TBrandKit[]>([]);
  
 const brandKitService = BrandKitServices(axiosCore);
      // Fetch all brand kits on mount
            useEffect(() => {
              const fetchBrandKits = async () => {
                const kits = await brandKitService.findAll();
                if (kits) setBrandKits(kits);
              };
              fetchBrandKits();
            }, []);
  
  const [selectedKitIndex, setSelectedKitIndex] = useState(0);
  const selectedKit = brandKits[selectedKitIndex] || {};


  // State for all details of selected kit
  const [colors, setColors] = useState<TBrandKitDetail[]>([]);
  const [typography, setTypography] = useState<TBrandKitDetail[]>([]);
  const [logos, setLogos] = useState<TBrandKitDetail[]>([]);
  const [ci, setCi] = useState<TBrandKitDetail[]>([]);
  const [voice, setVoice] = useState<TBrandKitDetail[]>([]);
  const brandKitDetailService = BrandKitDetailServices(axiosCore);

  // Fetch all details when selectedKit changes
  useEffect(() => {
    if (!selectedKit.id) {
      setColors([]);
      setTypography([]);
      setLogos([]);
      setCi([]);
      setVoice([]);
      return;
    }
    const fetchAll = async () => {
      const [colorRes, typoRes, logoRes, ciRes, voiceRes] = await Promise.all([
        brandKitDetailService.findByTypeAndBrandKitId("color", selectedKit.id),
        brandKitDetailService.findByTypeAndBrandKitId("typography", selectedKit.id),
        brandKitDetailService.findByTypeAndBrandKitId("logo", selectedKit.id),
        brandKitDetailService.findByTypeAndBrandKitId("ci", selectedKit.id),
        brandKitDetailService.findByTypeAndBrandKitId("voice", selectedKit.id),
      ]);
      setColors(colorRes || []);
      setTypography(typoRes || []);
      setLogos(logoRes || []);
      setCi(ciRes || []);
      setVoice(voiceRes || []);
    };
    fetchAll();
  }, [selectedKit.id]);

  // Handler to refresh colors after add
  const handleColorAdded = async () => {
    if (!selectedKit.id) return;
    const res = await brandKitDetailService.findByTypeAndBrandKitId("color", selectedKit.id);
    setColors(res || []);
  };

  const updateCI = (ci: string, negative: string) => {
    const updated = [...brandKits];
    updated[selectedKitIndex] = {
      ...updated[selectedKitIndex],
      brandCiPrompt: ci,
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
          id: kit.id,
          name: kit.name,
          industry: kit.industryType, // Map industryType to industry
          colors: [], // No color data in TBrandKit, fallback to empty array
          fonts: 0, // No font count in TBrandKit, fallback to 0
          colorCount: 0, // No color count in TBrandKit, fallback to 0
        }))}
        activeIndex={selectedKitIndex}
        onChangeIndex={setSelectedKitIndex}
        onCreateKit={() => {
          setFormMode('create');
          form.resetFields();
          setIsFormModalOpen(true);
        }}
        onEditKit={(index) => {
          setFormMode('edit');
          setEditIndex(index);
          const kit = brandKits[index];
          form.setFieldsValue({
            name: kit.name,
            description: kit.description,
            industry: kit.industryType,
          });
          setIsFormModalOpen(true);
        }}
        onDeleteKit={async (index) => {
          const kit = brandKits[index];
          if (!kit.id) return;
          try {
            const deleted = await brandKitService.del(kit.id);
            if (deleted) {
              const newKits = brandKits.filter((_, i) => i !== index);
              setBrandKits(newKits);
              if (selectedKitIndex === index) {
                setSelectedKitIndex(0);
              } else if (selectedKitIndex > index) {
                setSelectedKitIndex(selectedKitIndex - 1);
              }
              messageApi.success('Brand kit deleted!');
            } else {
              messageApi.error('Failed to delete brand kit');
            }
          } catch (e) {
            messageApi.error('Failed to delete brand kit');
          }
        }}
      />

      {/* Shared Create/Edit Brand Kit Modal */}
      <Modal
        title={formMode === 'edit' ? 'Edit Brand Kit' : 'New Brand Kit'}
        open={isFormModalOpen}
        confirmLoading={formLoading}
        onOk={async () => {
          if (formMode === 'edit' && editIndex === null) return;
          try {
            setFormLoading(true);
            const values = await form.validateFields();
            if (formMode === 'create') {
              const created = await brandKitService.create({
                name: values.name,
                description: values.description,
                industryType: values.industry,
                organizationId: session?.user?.organizationId ?? undefined,
              });
              if (created) {
                setBrandKits([created, ...brandKits]);
                messageApi.success("Brand kit created!");
                setIsFormModalOpen(false);
                form.resetFields();
              } else {
                messageApi.error("Failed to create brand kit");
              }
            } else if (formMode === 'edit' && editIndex !== null) {
              const kit = brandKits[editIndex];
              const updated = await brandKitService.update(kit.id, {
                name: values.name,
                description: values.description,
                industryType: values.industry,
              });
              if (updated) {
                const newKits = [...brandKits];
                newKits[editIndex] = { ...newKits[editIndex], ...updated };
                setBrandKits(newKits);
                messageApi.success('Brand kit updated!');
                setIsFormModalOpen(false);
                setEditIndex(null);
              } else {
                messageApi.error('Failed to update brand kit');
              }
            }
          } catch (e) {
            messageApi.error(formMode === 'create' ? 'Failed to create brand kit' : 'Failed to update brand kit');
          } finally {
            setFormLoading(false);
          }
        }}
        onCancel={() => {
          setIsFormModalOpen(false);
          setEditIndex(null);
        }}
        okText={formMode === 'edit' ? 'Save' : 'Create Kit'}
        cancelText="Cancel"
      >
        <BrandKitForm form={form} mode={formMode} />
      </Modal>

      {/* Main Layout: Header + Scrollable Content */}
      <Layout style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {brandKits.length === 0 ? (
          // Empty State UI
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: semantic.colorBgBase,
            gap: 24,
            height: "100%",
          }}>
            <Palette size={48} color={semantic.colorTextSecondary} />
            <Title level={3} style={{ color: semantic.colorTextBase, margin: 0 }}>No Brand Kits</Title>
            <Text style={{ color: semantic.colorTextSecondary }}>Select or create a Brand Kit

</Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setFormMode('create'); form.resetFields(); setIsFormModalOpen(true); }}>
              New Brand Kit
            </Button>
          </div>
        ) : (
          <>
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
                    {selectedKit.name || "-"}
                  </Title>
                  <Text style={{ color: semantic.colorTextSecondary, fontSize: 14 }}>
                    {(selectedKit.industryType || "-")} · Updated {(selectedKit.updatedAt || "-")}
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
              {/* Determine if all details are empty for this kit */}
              {(() => {
                const allEmpty =
                  colors.length === 0 &&
                  typography.length === 0 &&
                  logos.length === 0 &&
                  ci.length === 0 &&
                  voice.length === 0;
                if (selectedTab === "colors") {
                  return (
                    <ColorTab
                      colors={colors.map((c) => ({
                        name: c.name,
                        hex: c.detail && 'hex' in c.detail ? c.detail.hex : '',
                        type: c.detail && 'type' in c.detail ? c.detail.type : '',
                      }))}
                      brandKitId={selectedKit.id}
                      axiosCore={axiosCore}
                      onColorAdded={handleColorAdded}
                      emptyState={allEmpty}
                    />
                  );
                }
                if (selectedTab === "typography") {
                  return (
                    <TypographyTab
                      fonts={typography.map((t) => {
                        const detail = t.detail && t.type === "typography" ? t.detail as import("@/app/common/brand-kit").TBrandKitDetailTypography : undefined;
                        return {
                          name: t.name,
                          weight: detail?.weight ? Number(detail.weight) : 400,
                          type: detail?.type?.toLowerCase?.() || "body",
                          preview: detail?.preview || "Creativity is intelligence having fun.",
                        };
                      })}
                      emptyState={allEmpty}
                      onAddFont={async (payload) => {
                        if (!selectedKit.id) return;
                        // Attach brandKitId
                        const toCreate = { ...payload, brandKitId: selectedKit.id };
                        const created = await brandKitDetailService.create(toCreate);
                        if (created) {
                          // Refresh typography list
                          const typoRes = await brandKitDetailService.findByTypeAndBrandKitId("typography", selectedKit.id);
                          setTypography(typoRes || []);
                          messageApi.success("Font added!");
                        } else {
                          messageApi.error("Failed to add font");
                        }
                      }}
                    />
                  );
                }
                if (selectedTab === "logos") {
                  return allEmpty ? (
                    <div style={{ color: "#e5e7eb", textAlign: "center", padding: 48, fontSize: 20 }}>
                      🥣 No logos yet
                    </div>
                  ) : (
                    <div style={{ color: "#e5e7eb" }}>logo</div>
                  );
                }
                if (selectedTab === "ci") {
                  return (
                    <CIPromptTab
                      ciPrompt={selectedKit.brandCiPrompt || ""}
                      negativePrompt={selectedKit.negativePrompt || ""}
                      onChange={updateCI}
                      colors={colors.map((c) => ({
                        name: c.name,
                        hex: c.detail && 'hex' in c.detail ? c.detail.hex : '',
                        type: c.detail && 'type' in c.detail ? c.detail.type : '',
                      }))}
                      fonts={typography.map((t) => {
                        const detail = t.detail && t.type === "typography" ? t.detail as import("@/app/common/brand-kit").TBrandKitDetailTypography : undefined;
                        return {
                          name: t.name,
                          weight: detail?.weight ? Number(detail.weight) : 400,
                          type: detail?.type?.toLowerCase?.() || "body",
                        };
                      })}
                    />
                  );
                }
                if (selectedTab === "voice") {
                  return allEmpty ? (
                    <div style={{ color: "#e5e7eb", textAlign: "center", padding: 48, fontSize: 20 }}>
                      🥣 No Brand Voice yet
                    </div>
                  ) : (
                    <div style={{ color: "#e5e7eb" }}>Brand Voice Prompt</div>
                  );
                }
                return null;
              })()}
            </Content>
          </>
        )}
      </Layout>
    </Layout>
        
  );
}