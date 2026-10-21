"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Input,
  Button,
  Typography,
  Space,
  Tag,
  Flex,
  Spin,
  Empty,
} from "antd";
import { Search, Sparkles, X, ChevronRight, Plus, Music, ImageIcon } from "lucide-react";
import { TPromptGuide } from "@/app/common/prompt-guide.type";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";
import { useRouter } from "next/navigation";
import { isAudio, isVideo, mentionLabels } from "@/app/utils/prompt-guide-media";

const { Title, Text, Paragraph } = Typography;

/** omnihumen/dreamactor ใช้ช่องตายตัว ไม่มีการอ้าง @imageN ใน prompt */
const MENTION_TYPES = new Set(["image", "video"]);

interface Props {
  open: boolean;
  onClose: () => void;
  onUseTemplate: (prompt: TPromptGuide) => void;
  organizationId?: string;
  selectedModel?: string;
  modalZIndex?: number;
}


function MediaThumb({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  if (isAudio(url)) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1b1e] gap-1">
        <Music size={24} style={{ color: "rgba(255, 255, 255, 0.4)" }} />
        <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.3)" }}>Audio</span>
      </div>
    );
  }

  if (isVideo(url)) {
    return (
      <video
        src={url}
        className={`${className ?? "object-cover"} w-full h-full absolute inset-0`}
        muted
        playsInline
        loop
        autoPlay
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className ?? ""}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}

/** ผลลัพธ์เต็มกรอบ + reference เป็น thumbnail เล็ก (เฉพาะแสดงผล — Use แนบแค่ reference) */
function ResultPreview({ guide }: { guide: TPromptGuide }) {
  const result = guide.results?.[0];
  if (!result) return null;
  const refs = guide.images ?? [];
  const labels = MENTION_TYPES.has(guide.generateType)
    ? mentionLabels(refs)
    : [];
  return (
    <>
      <MediaThumb url={result.url} alt={guide.title || "Result"} />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
      <Tag
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          margin: 0,
          background: "rgba(0, 0, 0, 0.55)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 6,
          fontSize: 10,
        }}
      >
        Result
      </Tag>
      {refs.length > 0 && (
        <div className="absolute bottom-2 left-2 flex items-end gap-1.5">
          <span
            style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.6)" }}
            className="mr-0.5"
          >
            Reference
          </span>
          {refs.slice(0, 4).map((ref, i) => (
            <div
              key={ref.uid}
              className="relative h-10 w-10 overflow-hidden rounded-md border border-white/25"
            >
              <MediaThumb url={ref.url} alt={labels[i] ?? ref.name} />
              {labels[i] && (
                <span className="absolute inset-x-0 bottom-0 bg-black/65 text-center text-[9px] leading-3 text-white">
                  @{labels[i]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function BrowsePromptModal({
  open,
  onClose,
  onUseTemplate, 
  organizationId,
  selectedModel,
  modalZIndex = 1200,
}: Props) {
  const [promptGuides, setPromptGuides] = useState<TPromptGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  // Dark keeps the original hand-tuned values; light reads theme tokens.
  const c =
    mode === "dark"
      ? {
          surface: "#121214",
          border: "rgba(255, 255, 255, 0.08)",
          divider: "rgba(255, 255, 255, 0.06)",
          headerBg: "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)",
          text: "white",
          text2: "rgba(255, 255, 255, 0.45)",
          text3: "rgba(255, 255, 255, 0.35)",
          text4: "rgba(255, 255, 255, 0.25)",
          text5: "rgba(255, 255, 255, 0.2)",
          promptText: "rgba(255, 255, 255, 0.7)",
          field: "rgba(255, 255, 255, 0.03)",
          card: "rgba(255, 255, 255, 0.02)",
          cardBorder: "rgba(255, 255, 255, 0.05)",
          cardHover: "rgba(255, 255, 255, 0.04)",
          cardHoverBorder: "rgba(255, 255, 255, 0.1)",
          well: "rgba(0, 0, 0, 0.4)",
          promptBox: "rgba(0, 0, 0, 0.2)",
          wellBorder: "rgba(255, 255, 255, 0.04)",
          emptyIcon: "rgba(255, 255, 255, 0.1)",
          accentBg: "rgba(99, 102, 241, 0.1)",
          accent: "#818cf8",
          accentBorder: "rgba(99, 102, 241, 0.2)",
          accentSolid: "#6366f1",
          scrollThumb: "rgba(255, 255, 255, 0.05)",
        }
      : {
          surface: semantic.colorBgContainer,
          border: semantic.colorBorder,
          divider: semantic.colorBorder,
          headerBg: semantic.colorBgContainer,
          text: semantic.colorTextBase,
          text2: semantic.colorTextSecondary,
          text3: semantic.colorTextSecondary,
          text4: semantic.colorTextTertiary,
          text5: semantic.colorTextTertiary,
          promptText: semantic.colorTextSecondary,
          field: semantic.colorBgContainer,
          card: semantic.colorBgContainer,
          cardBorder: semantic.colorBorder,
          cardHover: semantic.colorBgLayout,
          cardHoverBorder: semantic.colorPrimary,
          well: semantic.colorFillSecondary,
          promptBox: semantic.colorBgLayout,
          wellBorder: semantic.colorBorder,
          emptyIcon: semantic.colorTextTertiary,
          accentBg: semantic.colorPrimaryBg,
          accent: aiCaveColors.primaryDark,
          accentBorder: semantic.colorPrimaryBg,
          accentSolid: semantic.colorPrimary,
          scrollThumb: semantic.colorBorder,
        };
  const router = useRouter();

  const promptGuideService = PromptGuideServices(axiosCore);

  const fetchPromptGuides = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await promptGuideService.findByOrganization(organizationId, {
        model: selectedModel,
      });
      setPromptGuides(data || []);
    } catch (error) {
      console.error("Failed to fetch prompt guides:", error);
    } finally {
      setLoading(false);
    }
  };
 // Debugging modal open state and zIndex
  console.log('[BrowsePromptModal] open:', open, 'modalZIndex:', modalZIndex);
  useEffect(() => {
    if (open && organizationId) {
      fetchPromptGuides();
    }
  }, [open, organizationId, selectedModel]);

  const filteredGuides = promptGuides.filter((pg) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pg.title?.toLowerCase().includes(searchLower) ||
      pg.description?.toLowerCase().includes(searchLower) ||
      pg.textPrompt?.toLowerCase().includes(searchLower)
    );
  });
  

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      closeIcon={<X size={20} style={{ color: c.text2 }} />}
      zIndex={modalZIndex}
      styles={{
        content: {
          background: c.surface,
          padding: 0,
          borderRadius: 24,
          border: `1px solid ${c.border}`,
          overflow: "hidden",
        },
        mask: {
          backdropFilter: "blur(8px)",
          background: "rgba(0, 0, 0, 0.6)",
        },
      }}
    >
      <Flex vertical style={{ height: "85vh" }}>
        {/* Header */}
        <div
          style={{
            padding: "32px 40px",
            borderBottom: `1px solid ${c.divider}`,
            background: c.headerBg,
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 24 }}
          >
            <Space direction="vertical">
              <Title
                level={4}
                style={{
                  color: c.text,
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                Prompt Guide Templates
              </Title>
              <Text
                style={{ color: c.text2, fontSize: 13 }}
              >
                Click any template to instantly apply it — or create your own
              </Text>
            </Space>
           
          </Flex>

          <Input
            prefix={
              <Search
                size={18}
                style={{ color: c.text4, marginRight: 8 }}
              />
            }
            placeholder="Search by name, description, or prompt content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              height: 48,
              background: c.field,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              color: c.text,
              fontSize: 14,
            }}
            className="custom-search-input"
          />

          <div
            style={{
              marginTop: 20,
              color: c.text3,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {filteredGuides.length} templates
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "40px" }}
          className="custom-scrollbar"
        >
          {loading ? (
            <Flex align="center" justify="center" style={{ height: "100%" }}>
              <Spin size="large" />
            </Flex>
          ) : filteredGuides.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 24,
              }}
            >
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  style={{
                    background: c.card,
                    border: `1px solid ${c.cardBorder}`,
                    borderRadius: 20,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    transition: "all 0.3s ease",
                  }}
                  className="guide-card"
                >
                  <Flex justify="space-between" align="start">
                    <Tag
                      style={{
                        margin: 0,
                        background: c.accentBg,
                        color: c.accent,
                        border: `1px solid ${c.accentBorder}`,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "2px 8px",
                      }}
                    >
                      <Sparkles size={12} />
                      {guide.generateType?.toUpperCase() || "TEMPLATE"}
                    </Tag>
                    {guide.model && (
                      <Text
                        style={{
                          color: c.text5,
                          fontSize: 10,
                          fontFamily: "monospace",
                        }}
                      >
                        {guide.model}
                      </Text>
                    )}
                  </Flex>

                  <Flex vertical gap={4}>
                    <Title
                      level={5}
                      style={{ color: c.text, margin: 0, fontWeight: 700 }}
                    >
                      {guide.title}
                    </Title>
                    <Paragraph
                      style={{
                        color: c.text2,
                        margin: 0,
                        fontSize: 12,
                      }}
                      ellipsis={{ rows: 2 }}
                    >
                      {guide.description || "No description provided"}
                    </Paragraph>
                  </Flex>

                  <div
                    style={{
                      background: c.well,
                      borderRadius: 12,
                      aspectRatio: guide.results?.length ? "16/9" : "3/2",
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid ${c.wellBorder}`,
                    }}
                  >
                    {guide.results && guide.results.length > 0 ? (
                      <ResultPreview guide={guide} />
                    ) : guide.images && guide.images.length > 0 ? (
                      <>
                        {/* 1 image: Show full */}
                        {guide.images.length === 1 && (
                          <MediaThumb
                            url={guide.images[0].url}
                            alt={guide.title || "Template"}
                          />
                        )}

                        {/* 2 images: Split side by side */}
                        {guide.images.length === 2 && (
                          <div className="flex h-full w-full">
                            <div className="relative w-1/2 h-full border-r border-black/20">
                              <MediaThumb
                                url={guide.images[0].url}
                                alt="Image 1"
                              />
                            </div>
                            <div className="relative w-1/2 h-full">
                              <MediaThumb
                                url={guide.images[1].url}
                                alt="Image 2"
                              />
                            </div>
                          </div>
                        )}

                        {/* 3+ images: Grid layout */}
                        {guide.images.length >= 3 && (
                          <div className="flex flex-col h-full w-full">
                            <div className="flex h-1/2 border-b border-black/20">
                              <div className="relative w-1/2 h-full border-r border-black/20">
                                <MediaThumb
                                  url={guide.images[0].url}
                                  alt="Image 1"
                                />
                              </div>
                              <div className="relative w-1/2 h-full">
                                <MediaThumb
                                  url={guide.images[1].url}
                                  alt="Image 2"
                                />
                              </div>
                            </div>
                            <div className="relative w-full h-1/2">
                              <MediaThumb
                                url={guide.images[2].url}
                                alt="Image 3"
                              />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <ImageIcon size={32} style={{ color: c.emptyIcon }} />
                        <Text style={{ color: c.text5, fontSize: 10 }}>No Preview</Text>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: c.promptBox,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${c.wellBorder}`,
                      flex: 1,
                    }}
                  >
                    <Paragraph
                      style={{
                        color: c.promptText,
                        margin: 0,
                        fontSize: 12,
                        lineHeight: 1.6,
                        fontStyle: "italic",
                      }}
                      ellipsis={{ rows: 3 }}
                    >
                      {guide.textPrompt}
                    </Paragraph>
                  </div>

                  <Button
                    type="primary"
                    block
                    onClick={() => onUseTemplate(guide)}
                    style={{
                      background: c.accentBg,
                      color: c.accent,
                      border: `1px solid ${c.accentBorder}`,
                      borderRadius: 12,
                      height: 44,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    className="use-template-btn"
                  >
                    Use Template
                    <ChevronRight size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Flex align="center" justify="center" style={{ height: "100%" }}>
              <Empty
                description={
                  <Text style={{ color: c.text5 }}>
                    No templates found
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Flex>
          )}
        </div>
      </Flex>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${c.scrollThumb};
          border-radius: 10px;
        }
        .guide-card:hover {
          background: ${c.cardHover} !important;
          border-color: ${c.cardHoverBorder} !important;
          transform: translateY(-2px);
        }
        .use-template-btn:hover {
          background: ${c.accentSolid} !important;
          color: white !important;
          border-color: ${c.accentSolid} !important;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }
        .custom-search-input input::placeholder {
          color: ${c.text5} !important;
        }
      `}</style>
    </Modal>
  );
}
