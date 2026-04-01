"use client";

import React, { useEffect, useState } from "react";
import { isColorDetail } from "./helpers/isColorDetail";
import { isTypographyDetail } from "./helpers/isTypographyDetail";
import { autoGenerateCIPrompt } from "./helpers/autoGenerateCIPrompt";
import { extractHexColors } from "./helpers/extractHexColors";
import { extractFontNames } from "./helpers/extractFontNames";
import { useSession } from "next-auth/react";
import "./styles/style.css";
import { Layout, Row, Typography, Button, Space, Tabs, message, Divider, Spin, Tooltip, Col } from "antd";
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
import useResponsive from "@/app/hooks/useResponsive";
import { Drawer } from "antd";
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
import BrandKitHeader from "./components/BrandKitHeader";

const { Header, Content } = Layout;
const { Title, Text } = Typography;



interface FontItem {
  name: string;
  type: "heading" | "body";
  weight: number;
  preview: string;
}



export default function BrandKitPage() {
  const { isMobile, isTablet } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarColumnVisible, setIsSidebarColumnVisible] = useState(true);
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
  // CI Prompt state (from brand kit, not detail)
  const [ciPrompt, setCiPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [voice, setVoice] = useState<TBrandKitDetail[]>([]);
  // Loading state for tab content
  const [tabLoading, setTabLoading] = useState(false);
  const brandKitDetailService = BrandKitDetailServices(axiosCore);


  // Fetch data only for the selected tab and kit
  useEffect(() => {
    if (!selectedKit.id) {
      setTypography([]);
      setLogos([]);
      setVoice([]);
      setColors([]);
      setTabLoading(false);
      setCiPrompt("");
      setNegativePrompt("");
      return;
    }
    const fetchData = async () => {
      setTabLoading(true);
      try {
        if (selectedTab === "colors") {
          const colorRes = await brandKitDetailService.findByTypeAndBrandKitId("colors", selectedKit.id);
          setColors(colorRes || []);
        } else if (selectedTab === "typography") {
          const typoRes = await brandKitDetailService.findByTypeAndBrandKitId("typography", selectedKit.id);
          setTypography(typoRes || []);
        } else if (selectedTab === "logos") {
          const logoRes = await brandKitDetailService.findByTypeAndBrandKitId("logo", selectedKit.id);
          setLogos(logoRes || []);
        } else if (selectedTab === "ci") {
          // fetch brand kit for CI Prompt
          const kit = await brandKitService.findById(selectedKit.id);
          setCiPrompt(kit?.brandCiPrompt || "");
          setNegativePrompt(kit?.negativePrompt || "");
        } else if (selectedTab === "voice") {
          const voiceRes = await brandKitDetailService.findByTypeAndBrandKitId("voice", selectedKit.id);
          setVoice(voiceRes || []);
        }
      } finally {
        setTabLoading(false);
      }
    };
    fetchData();
  }, [selectedKit.id, selectedTab]);

  // (removed: now handled in the unified effect above)


  // Handler to refresh colors after add, and auto-update CI Prompt
  const handleColorAdded = async () => {
    if (!selectedKit.id) return;
    const res = await brandKitDetailService.findByTypeAndBrandKitId("colors", selectedKit.id);
    setColors(res || []);
    // auto-generate and PATCH CI Prompt
    const prompt = autoGenerateCIPrompt({
      colors: (res || []).map(c => {
        return isColorDetail(c.detail)
          ? { name: c.name, hex: c.detail.hex, type: c.detail && typeof c.detail.type === 'string' ? c.detail.type : '' }
          : { name: c.name, hex: '', type: '' };
      }),
      fonts: typography.map(t => {
        const detail = t.detail && t.type === "typography" ? t.detail : undefined;
        return isTypographyDetail(detail)
          ? { name: t.name, weight: detail.weight ? Number(detail.weight) : 400, type: detail.type?.toLowerCase?.() || "body" }
          : { name: t.name, weight: 400, type: "body" };
      })
    });
    await brandKitService.update(selectedKit.id, { brandCiPrompt: prompt });
    setCiPrompt(prompt);
    // Smoothly refresh all brand kits for sidebar
    const kits = await brandKitService.findAll();
    if (kits) {
      kits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBrandKits(kits);
    }
  };

  // Handler to add or edit font (if editId is provided, update; else, create)
  const handleFontAdded = async (payload: any, editId?: string | null) => {
    if (!selectedKit.id) return;
    let success = false;
    if (editId) {
      // Edit font
      const updated = await brandKitDetailService.update(editId, payload);
      if (updated) {
        success = true;
        messageApi.success("Font updated!");
      } else {
        messageApi.error("Failed to update font");
      }
    } else {
      // Add font
      const created = await brandKitDetailService.create({ ...payload, brandKitId: selectedKit.id });
      if (created) {
        success = true;
        messageApi.success("Font added!");
      } else {
        messageApi.error("Failed to add font");
      }
    }
    if (success) {
      const typoRes = await brandKitDetailService.findByTypeAndBrandKitId("typography", selectedKit.id);
      setTypography(typoRes || []);
      // auto-generate and PATCH CI Prompt
      const prompt = autoGenerateCIPrompt({
        colors: colors.map(c => {
          return isColorDetail(c.detail)
            ? { name: c.name, hex: c.detail.hex, type: c.detail && typeof c.detail.type === 'string' ? c.detail.type : '' }
            : { name: c.name, hex: '', type: '' };
        }),
        fonts: (typoRes || []).map(t => {
          const detail = t.detail && t.type === "typography" ? t.detail : undefined;
          return isTypographyDetail(detail)
            ? { name: t.name, weight: detail.weight ? Number(detail.weight) : 400, type: detail.type?.toLowerCase?.() || "body" }
            : { name: t.name, weight: 400, type: "body" };
        })
      });
      await brandKitService.update(selectedKit.id, { brandCiPrompt: prompt });
      setCiPrompt(prompt);
      // Smoothly refresh all brand kits for sidebar
      const kits = await brandKitService.findAll();
      if (kits) setBrandKits(kits);
    }
  };

  // Handler to delete font
  const handleDeleteFont = async (id: string) => {
    if (!selectedKit.id) return;
    const deleted = await brandKitDetailService.del(id);
    if (deleted) {
      const typoRes = await brandKitDetailService.findByTypeAndBrandKitId("typography", selectedKit.id);
      setTypography(typoRes || []);
      messageApi.success("Font deleted!");
      // auto-generate and PATCH CI Prompt
      const prompt = autoGenerateCIPrompt({
        colors: colors.map(c => {
          return isColorDetail(c.detail)
            ? { name: c.name, hex: c.detail.hex, type: c.detail && typeof c.detail.type === 'string' ? c.detail.type : '' }
            : { name: c.name, hex: '', type: '' };
        }),
        fonts: (typoRes || []).map(t => {
          const detail = t.detail && t.type === "typography" ? t.detail : undefined;
          return isTypographyDetail(detail)
            ? { name: t.name, weight: detail.weight ? Number(detail.weight) : 400, type: detail.type?.toLowerCase?.() || "body" }
            : { name: t.name, weight: 400, type: "body" };
        })
      });
      await brandKitService.update(selectedKit.id, { brandCiPrompt: prompt });
      setCiPrompt(prompt);
      // Smoothly refresh all brand kits for sidebar
      const kits = await brandKitService.findAll();
      if (kits) setBrandKits(kits);
    } else {
      messageApi.error("Failed to delete font");
    }
  };

  // ...helpers moved to ./helpers/index.ts...

  // Update CI Prompt/NegativePrompt from CI tab (manual edit)
  const updateCI = async (ci: string, negative: string) => {
    if (!selectedKit.id) return;
    await brandKitService.update(selectedKit.id, { brandCiPrompt: ci, negativePrompt: negative });
    setCiPrompt(ci);
    setNegativePrompt(negative);

    // Extract color/font from prompt and compare with current
    const extractedColors = extractHexColors(ci);
    const extractedFonts = extractFontNames(ci);
    const currentColors = await brandKitDetailService.findByTypeAndBrandKitId("colors", selectedKit.id) || [];
    const currentFonts = await brandKitDetailService.findByTypeAndBrandKitId("typography", selectedKit.id) || [];
    function isColorDetail(detail: any): detail is import("@/app/common/brand-kit").TBrandKitDetailColor {
      return detail && typeof detail.hex === 'string';
    }
    const currentHexes = new Set(currentColors.map(c => isColorDetail(c.detail) ? c.detail.hex.toLowerCase() : ''));
    const promptHexes = new Set(extractedColors.map(c => c.hex.toLowerCase()));
    const currentFontNames = new Set(currentFonts.map(f => f.name.trim().toLowerCase()));
    const promptFontNames = new Set(extractedFonts.map(f => f.name.trim().toLowerCase()));

    // Check if color/font in prompt is different from current
    const colorChanged =
      extractedColors.length !== currentColors.length ||
      [...promptHexes].some(hex => !currentHexes.has(hex)) ||
      [...currentHexes].some(hex => !promptHexes.has(hex));
    const fontChanged =
      extractedFonts.length !== currentFonts.length ||
      [...promptFontNames].some(name => !currentFontNames.has(name)) ||
      [...currentFontNames].some(name => !promptFontNames.has(name));

    if (colorChanged || fontChanged) {
      // --- SYNC COLORS ---
      // Add new colors from prompt
      for (const hex of promptHexes) {
        if (!currentHexes.has(hex)) {
          await brandKitDetailService.create({
            name: '',
            type: 'colors',
            detail: { hex, type: 'primary' },
            brandKitId: selectedKit.id
          });
        }
      }
      // Delete colors not in prompt
      for (const c of currentColors) {
        const hex = isColorDetail(c.detail) ? c.detail.hex.toLowerCase() : '';
        if (hex && !promptHexes.has(hex)) {
          await brandKitDetailService.del(c.id);
        }
      }
      // --- SYNC FONTS ---
      for (const f of extractedFonts) {
        const name = f.name.trim().toLowerCase();
        if (!currentFontNames.has(name)) {
          await brandKitDetailService.create({
            name: f.name,
            type: 'typography',
            detail: { weight: '400', type: 'Body', preview: '' },
            brandKitId: selectedKit.id
          });
        }
      }
      for (const f of currentFonts) {
        const name = f.name.trim().toLowerCase();
        if (!promptFontNames.has(name)) {
          await brandKitDetailService.del(f.id);
        }
      }
      // Refresh state from backend
      const newColors = await brandKitDetailService.findByTypeAndBrandKitId("colors", selectedKit.id);
      setColors(newColors || []);
      const newFonts = await brandKitDetailService.findByTypeAndBrandKitId("typography", selectedKit.id);
      setTypography(newFonts || []);
      // Smoothly refresh all brand kits for sidebar
      const kits = await brandKitService.findAll();
      if (kits) {
        kits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBrandKits(kits);
      }
      messageApi.success("CI updated and synced");
    } else {
      // Only update CI/negativePrompt and sidebar
      const kits = await brandKitService.findAll();
      if (kits) {
        kits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBrandKits(kits);
      }
      messageApi.success("CI updated");
    }
  };

 return (
  <>
    {contextHolder}

    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "hidden",
        background: semantic.colorBgBase,
      }}
    >
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="brandkit-mobile-backdrop"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 1000,
            }}
          />

          {/* Sidebar Panel */}
         
           <BrandKitSidebar
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1200,
                boxShadow: "0 0 24px rgba(0,0,0,0.18)",
                overflow: "hidden",
                animation: "brandkitMobilePanelIn 260ms ease",
              }}
              onClose={() => setSidebarOpen(false)}
              brandKits={brandKits.map((kit) => {
                let colors: { hex: string }[] = [];
                let colorCount = 0;
                let fonts = 0;

                if (
                  typeof kit.brandCiPrompt === "string" &&
                  kit.brandCiPrompt.includes("Brand colors:")
                ) {
                  const colorSection =
                    kit.brandCiPrompt.split("Brand colors:")[1]?.split("Fonts:")[0] || "";

                  const hexMatches = [
                    ...colorSection.matchAll(/#([0-9a-fA-F]{3,8})/g),
                  ];

                  colors = hexMatches.map((m) => ({ hex: "#" + m[1] })).slice(0, 3);
                  colorCount = hexMatches.length;
                }

                if (
                  typeof kit.brandCiPrompt === "string" &&
                  kit.brandCiPrompt.includes("Fonts:")
                ) {
                  const fontSection = kit.brandCiPrompt.split("Fonts:")[1] || "";
                  const fontMatches = [
                    ...fontSection.matchAll(/([^,\n]+\([^\)]*\))/g),
                  ];
                  fonts =
                    fontMatches.length > 0
                      ? fontMatches.length
                      : fontSection.trim()
                      ? 1
                      : 0;
                }

                return {
                  id: kit.id,
                  name: kit.name,
                  industry: kit.industryType,
                  colors,
                  fonts,
                  colorCount,
                };
              })}
              activeIndex={selectedKitIndex}
              onChangeIndex={(idx) => {
                setSelectedKitIndex(idx);
                // Do not close sidebar automatically on select
              }}
              onCreateKit={() => {
                setFormMode("create");
                form.resetFields();
                setIsFormModalOpen(true);
                // Do not close sidebar automatically
              }}
              onEditKit={(index) => {
                setFormMode("edit");
                setEditIndex(index);

                const kit = brandKits[index];

                form.setFieldsValue({
                  name: kit.name,
                  description: kit.description,
                  industry: kit.industryType,
                });

                setIsFormModalOpen(true);
                // Do not close sidebar automatically
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

                    messageApi.success("Brand kit deleted!");
                  } else {
                    messageApi.error("Failed to delete brand kit");
                  }
                } catch {
                  messageApi.error("Failed to delete brand kit");
                }
              }}
            />
        
        </>
      )}

      {/* Floating Sidebar Button */}
      {isMobile && (
        <Tooltip title="Brand Kit ทั้งหมด" placement="left">
          <Button
            className="brandkit-fab"
            type="primary"
            shape="circle"
            icon={<Palette size={20} color={semantic.colorWhite} />}
            onClick={() => setSidebarOpen(true)}
            style={{
              position: "fixed",
              right: 20,
              bottom: 24,
              zIndex: 999,
              width: 56,
              height: 56,
              boxShadow: "0 6px 24px rgba(0,0,0,0.16)",
            }}
          />
        </Tooltip>
      )}

      <Row
        gutter={0}
        wrap={false}
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          margin: 0,
        }}
      >
        {/* Desktop/Tablet Sidebar */}
        {!isMobile && isSidebarColumnVisible && (
          <Col
            flex={isTablet ? "240px" : "270px"}
            style={{
              height: "100%",
              borderRight: `1px solid ${semantic.colorBorder}`,
              background: semantic.colorBgContainer,
              overflow: "hidden",
            }}
          >
            <BrandKitSidebar
              brandKits={brandKits.map((kit) => {
                let colors: { hex: string }[] = [];
                let colorCount = 0;
                let fonts = 0;

                if (
                  typeof kit.brandCiPrompt === "string" &&
                  kit.brandCiPrompt.includes("Brand colors:")
                ) {
                  const colorSection =
                    kit.brandCiPrompt.split("Brand colors:")[1]?.split("Fonts:")[0] || "";

                  const hexMatches = [
                    ...colorSection.matchAll(/#([0-9a-fA-F]{3,8})/g),
                  ];

                  colors = hexMatches.map((m) => ({ hex: "#" + m[1] })).slice(0, 3);
                  colorCount = hexMatches.length;
                }

                if (
                  typeof kit.brandCiPrompt === "string" &&
                  kit.brandCiPrompt.includes("Fonts:")
                ) {
                  const fontSection = kit.brandCiPrompt.split("Fonts:")[1] || "";
                  const fontMatches = [
                    ...fontSection.matchAll(/([^,\n]+\([^\)]*\))/g),
                  ];
                  fonts =
                    fontMatches.length > 0
                      ? fontMatches.length
                      : fontSection.trim()
                      ? 1
                      : 0;
                }

                return {
                  id: kit.id,
                  name: kit.name,
                  industry: kit.industryType,
                  colors,
                  fonts,
                  colorCount,
                };
              })}
              activeIndex={selectedKitIndex}
              onChangeIndex={setSelectedKitIndex}
              onCreateKit={() => {
                setFormMode("create");
                form.resetFields();
                setIsFormModalOpen(true);
              }}
              onEditKit={(index) => {
                setFormMode("edit");
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

                    messageApi.success("Brand kit deleted!");
                  } else {
                    messageApi.error("Failed to delete brand kit");
                  }
                } catch {
                  messageApi.error("Failed to delete brand kit");
                }
              }}
            />
          </Col>
        )}

        {/* Main Content */}
        <Col
          flex="auto"
          style={{
            minWidth: 0,
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: semantic.colorBgBase,
          }}
        >
          {brandKits.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                padding: 24,
              }}
            >
              <Palette size={48} color={semantic.colorTextSecondary} />
              <Title level={3} style={{ margin: 0 }}>
                No Brand Kits
              </Title>
              <Text style={{ color: semantic.colorTextSecondary }}>
                Select or create a Brand Kit
              </Text>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setFormMode("create");
                  form.resetFields();
                  setIsFormModalOpen(true);
                }}
              >
                New Brand Kit
              </Button>
            </div>
          ) : (
            <>
              <BrandKitHeader
                selectedKit={selectedKit}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                isMobile={isMobile}
                isTablet={isTablet}
                isSidebarVisible={isMobile ? sidebarOpen : isSidebarColumnVisible}
                semantic={semantic}
                onToggleSidebar={() => {
                  if (isMobile) {
                    setSidebarOpen(true);
                    return;
                  }
                  setIsSidebarColumnVisible((prev) => !prev);
                }}
              />

              <div
                className="brandkit-main-scroll"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  touchAction: "pan-y",
                  padding: isMobile ? 12 : isTablet ? 20 : 32,
                  paddingBottom: isMobile ? 90 : isTablet ? 24 : 32,
                  boxSizing: "border-box",
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                }}
              >
            
              {tabLoading ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
                  <Spin size="large" />
                </div>
              ) : (() => {
                const allEmpty =
                  colors.length === 0 &&
                  typography.length === 0 &&
                  logos.length === 0 &&
                  ciPrompt.length === 0 &&
                  voice.length === 0;
                if (selectedTab === "colors") {
                  // Type guard for color detail
                  function isColorDetail(detail: any): detail is { hex: string; type: string } {
                    return detail && typeof detail.hex === 'string' && typeof detail.type === 'string';
                  }
                  return (
                    <ColorTab
                      colors={colors.map((c) => ({
                        id: c.id,
                        name: c.name,
                        hex: isColorDetail(c.detail) ? c.detail.hex : '',
                        type: c.detail && typeof c.detail.type === 'string' ? c.detail.type : '',
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
                          id: t.id,
                          name: t.name,
                          weight: (detail && isTypographyDetail(detail) && detail.weight) ? Number(detail.weight) : 400,
                          type: detail && isTypographyDetail(detail) && detail.type ? detail.type.toLowerCase() : "body",
                          preview: detail && isTypographyDetail(detail) && detail.preview ? detail.preview : "Creativity is intelligence having fun.",
                        };
                      })}
                      emptyState={allEmpty}
                      onAddFont={handleFontAdded}
                      onDeleteFont={handleDeleteFont}
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
                  // Type guard for color detail
                  function isColorDetail(detail: any): detail is { hex: string; type: string } {
                    return detail && typeof detail.hex === 'string' && typeof detail.type === 'string';
                  }
                  // Parse colors/fonts from ciPrompt string for smooth editing
                  const parsedColors = (() => {
                    const arr: { name: string; hex: string; type: string }[] = [];
                    if (typeof ciPrompt === 'string' && ciPrompt.includes('Brand colors:')) {
                      const colorSection = ciPrompt.split('Brand colors:')[1]?.split('Fonts:')[0] || '';
                      const hexMatches = [...colorSection.matchAll(/#([0-9a-fA-F]{3,8})/g)];
                      hexMatches.forEach((m, i) => {
                        arr.push({ name: '', hex: '#' + m[1], type: '' });
                      });
                    }
                    return arr;
                  })();
                  const parsedFonts = (() => {
                    const arr: { name: string; weight: number; type: string }[] = [];
                    if (typeof ciPrompt === 'string' && ciPrompt.includes('Fonts:')) {
                      const fontSection = ciPrompt.split('Fonts:')[1] || '';
                      const fontMatches = [...fontSection.matchAll(/([^,\n]+)\s*\(([^)]*)\)/g)];
                      fontMatches.forEach((m) => {
                        // m[1]=name, m[2]=type, weight
                        let type = 'body', weight = 400;
                        if (m[2]) {
                          const typeMatch = m[2].match(/(heading\d?|body|caption|paragraph)/i);
                          if (typeMatch) type = typeMatch[1].toLowerCase();
                          const weightMatch = m[2].match(/weight\s*(\d+)/i);
                          if (weightMatch) weight = Number(weightMatch[1]);
                        }
                        arr.push({ name: m[1].trim(), type, weight });
                      });
                    }
                    return arr;
                  })();
                  return (
                    <CIPromptTab
                      ciPrompt={ciPrompt}
                      negativePrompt={negativePrompt}
                      onChange={updateCI}
                      colors={parsedColors}
                      fonts={parsedFonts}
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
         
              </div>
            </>
          )}
        </Col>
      </Row>

       <Modal
        zIndex={1500}
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

      <style jsx global>{`
        .brandkit-mobile-backdrop {
          animation: brandkitBackdropFadeIn 220ms ease;
        }

        .brandkit-fab {
          transition: transform 180ms ease, box-shadow 180ms ease;
          animation: brandkitFabIn 320ms ease;
        }

        .brandkit-fab:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22) !important;
        }

        .brandkit-main-scroll::-webkit-scrollbar {
          width: 9px;
        }

        .brandkit-main-scroll::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.3);
          border-radius: 999px;
        }

        .brandkit-main-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        @keyframes brandkitBackdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes brandkitMobilePanelIn {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes brandkitFabIn {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  </>
);
}