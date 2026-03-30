"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import "./styles/style.css";
import { Layout, Row, Typography, Button, Space, Tabs, message, Divider, Spin } from "antd";
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

const { Header, Content } = Layout;
const { Title, Text } = Typography;



interface FontItem {
  name: string;
  type: "heading" | "body";
  weight: number;
  preview: string;
}



export default function BrandKitPage() {
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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


  // --- Type guards ---
  function isColorDetail(detail: any): detail is { hex: string; type: string } {
    return detail && typeof detail.hex === 'string' && typeof detail.type === 'string';
  }
  function isTypographyDetail(detail: any): detail is { weight?: number|string; type?: string } {
    return detail && (typeof detail.weight === 'number' || typeof detail.weight === 'string' || typeof detail.type === 'string');
  }

  // --- Auto-generate CI Prompt logic ---
  function autoGenerateCIPrompt({ colors, fonts }: { colors: { name: string; hex: string; type: string }[]; fonts: { name: string; weight: number; type: string }[] }) {
    let colorDesc = "";
    if (colors.length > 0) {
      const colorList = colors.map(c => {
        const name = c.name && c.name.trim() ? c.name : c.type;
        const type = c.type ? `(${c.type})` : '';
        return `${name} ${type}: ${c.hex}`.replace(/ +/g, ' ');
      }).join(", ");
      colorDesc = `Brand colors: ${colorList}`;
    }
    let fontDesc = "";
    if (fonts.length > 0) {
      const fontList = fonts.map(f => {
        const fam = f.name && f.name.trim() ? f.name : 'sans-serif';
        const type = f.type ? `(${f.type})` : '';
        const weight = f.weight || 400;
        return `${fam} ${type}, weight ${weight}`.replace(/ +/g, ' ');
      }).join(", ");
      fontDesc = `Fonts: ${fontList}`;
    }
    return [colorDesc, fontDesc, "clean modern minimalist aesthetic, professional AI technology style, high-tech futuristic feel, crisp sharp edges, premium quality"].filter(Boolean).join(", ");
  }

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

  // Utility: extract hex codes from prompt string
  function extractHexColors(prompt: string): {hex: string}[] {
    const hexMatches = [...prompt.matchAll(/#([0-9a-fA-F]{3,8})/g)];
    // Remove duplicates
    const uniqueHexes = Array.from(new Set(hexMatches.map(m => '#' + m[1].toLowerCase())));
    return uniqueHexes.map(hex => ({ hex }));
  }

  // Utility: extract font names from prompt string (from Fonts: ... section)
  function extractFontNames(prompt: string): {name: string}[] {
    const fontsSection = prompt.split('Fonts:')[1] || '';
    // Match: FontName (type, weight)
    const fontMatches = [...fontsSection.matchAll(/([^,\n]+)\s*\([^)]+\)/g)];
    // Remove duplicates and trim
    const uniqueNames = Array.from(new Set(fontMatches.map(m => m[1].trim())));
    return uniqueNames.map(name => ({ name }));
  }

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
    <Layout style={{ display: "flex", height: "100%", flexDirection: isMobile ? "column" : "row" }}>
      {contextHolder}

      {/* Sidebar Responsive */}
      {isMobile ? (
        <>
          <Button
            className="mobile-padding"
            type="primary"
            icon={<PlusOutlined />}
            style={{ margin: 12, width: 44, height: 44, borderRadius: 12, position: "fixed", left: 8, top: 8, zIndex: 1001 }}
            onClick={() => setSidebarOpen(true)}
          />
          <Drawer
            placement="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            width={220}
            bodyStyle={{ padding: 0 }}
            style={{ zIndex: 1002 }}
          >
               <BrandKitSidebar
          brandKits={brandKits.map((kit) => {
              // Parse brandCiPrompt for 3 main colors and color/font count
              let colors: { hex: string }[] = [];
              let colorCount = 0;
              let fonts = 0;
              if (typeof kit.brandCiPrompt === 'string' && kit.brandCiPrompt.includes('Brand colors:')) {/* Lines 457-464 omitted */}
              if (typeof kit.brandCiPrompt === 'string' && kit.brandCiPrompt.includes('Fonts:')) {/* Lines 466-472 omitted */}
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
            setFormMode('create');
            form.resetFields();
            setIsFormModalOpen(true);
          }}
          onEditKit={(index) => {
            setFormMode('edit');
            setEditIndex(index);
            const kit = brandKits
              .slice()
              .sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                return a.name.localeCompare(b.name);
              })[index];
            form.setFieldsValue({
              name: kit.name,
              description: kit.description,
              industry: kit.industryType,
            });
            setIsFormModalOpen(true);
          }}
          onDeleteKit={async (index) => {
            const kit = brandKits
              .slice()
              .sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                return a.name.localeCompare(b.name);
              })[index];
            if (!kit.id) return;
            try {
              const deleted = await brandKitService.del(kit.id);
              if (deleted) {
                const newKits = brandKits.filter((k) => k.id !== kit.id);
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
          </Drawer>
        </>
      ) : (
        <BrandKitSidebar
          brandKits={brandKits.map((kit) => {
            // Parse brandCiPrompt for 3 main colors and color/font count
            let colors: { hex: string }[] = [];
            let colorCount = 0;
            let fonts = 0;
            if (typeof kit.brandCiPrompt === 'string' && kit.brandCiPrompt.includes('Brand colors:')) {
              // Extract color hexes from brandCiPrompt
              // Accepts: Brand colors: primary color: #034562, secondary: #123456, accent: #abcdef, ...
              const colorSection = kit.brandCiPrompt.split('Brand colors:')[1]?.split('Fonts:')[0] || '';
              // Find all hex codes
              const hexMatches = [...colorSection.matchAll(/#([0-9a-fA-F]{3,8})/g)];
              colors = hexMatches.map(m => ({ hex: '#' + m[1] })).slice(0, 3);
              colorCount = hexMatches.length;
            }
            if (typeof kit.brandCiPrompt === 'string' && kit.brandCiPrompt.includes('Fonts:')) {
              // Extract font list from Fonts: ...
              // Match pattern: ชื่อ (type, weight)
              const fontSection = kit.brandCiPrompt.split('Fonts:')[1] || '';
              // Regex: match ชื่อ (type, weight) หรืออะไรก็ได้ที่อยู่ในวงเล็บหลังชื่อ
              const fontMatches = [...fontSection.matchAll(/([^,\n]+\([^\)]*\))/g)];
              fonts = fontMatches.length > 0 ? fontMatches.length : (fontSection.trim() ? 1 : 0);
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
      )}

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
      <Layout
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          ...(isMobile && { padding: 0, minHeight: "100vh" }),
        }}
      >
        {brandKits.length === 0 ? (
          // Empty State UI
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: semantic.colorBgBase,
              gap: 24,
              height: "100%",
              ...(isMobile && { padding: 16 }),
            }}
          >
            <Palette size={isMobile ? 32 : 48} color={semantic.colorTextSecondary} />
            <Title level={3} style={{ color: semantic.colorTextBase, margin: 0, fontSize: isMobile ? 20 : 28 }}>No Brand Kits</Title>
            <Text style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 13 : 16 }}>Select or create a Brand Kit</Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size={isMobile ? "middle" : "large"}
              style={isMobile ? { width: "100%", maxWidth: 240 } : {}}
              onClick={() => {
                setFormMode('create');
                form.resetFields();
                setIsFormModalOpen(true);
              }}
            >
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
                height: "auto",
                lineHeight: "normal",
                background: semantic.colorBgContainer,
                borderBottom: "1px solid " + semantic.colorBorder,
                ...(isMobile && { padding: "0 8px", minHeight: 0 }),
              }}
            >
              {/* Top Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "center" : "flex-end",
                  minHeight: isMobile ? 48 : 72,
                  padding: isMobile ? "8px 0 0 0" : "16px 40px 0 40px",
                  gap: isMobile ? 8 : 0,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Title
                    style={{
                      color: semantic.colorTextBase,
                      margin: 0,
                      fontSize: isMobile ? 18 : 28,
                      lineHeight: 1.2,
                    }}
                  >
                    {selectedKit.name || "-"}
                  </Title>
                  <Text style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 11 : 14 }}>
                    {(selectedKit.industryType || "-")} · Updated {(selectedKit.updatedAt || "-")}
                  </Text>
                </div>

                <Button
                  type="default"
                  icon={<StarOutlined />}
                  style={{ alignSelf: isMobile ? "center" : "flex-end", marginBottom: isMobile ? 0 : 8, fontSize: isMobile ? 12 : 16, height: isMobile ? 28 : 32 }}
                  size={isMobile ? "small" : "middle"}
                >
                  Default Kit
                </Button>
              </div>
              <Divider style={{ margin: isMobile ? "8px 0 0 0" : "16px 0 0 0", width: "100%", maxWidth: "100%" }} />
              {/* Tabs */}
              <Tabs
                activeKey={selectedTab}
                onChange={setSelectedTab}
                tabBarStyle={{
                  margin: 0,
                  paddingTop: isMobile ? 4 : 12,
                  paddingLeft: isMobile ? 0 : 40,
                  paddingRight: isMobile ? 0 : 40,
                  fontSize: isMobile ? 12 : 16,
                }}
                items={[
                  { key: "colors", label: <Space size={4}><BgColorsOutlined />Colors</Space> },
                  { key: "typography", label: <Space size={4}><FontSizeOutlined />Typography</Space> },
                  // { key: "logos", label: <Space size={4}><PictureOutlined />Logos</Space> },
                  { key: "ci", label: <Space size={4}><BranchesOutlined />CI Prompt</Space> },
                  // { key: "voice", label: <Space size={4}><MessageOutlined />Brand Voice</Space> },
                ]}
              />
            </Header>

            {/* Scrollable Content */}
            <Content
              style={{
                flex: 1,
                overflowY: "auto",
                padding: isMobile ? 12 : 40,
                background: semantic.colorBgBase,
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 12 : 24,
                height: "100%",
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
            </Content>
          </>
        )}
      </Layout>
    </Layout>
        
  );
}