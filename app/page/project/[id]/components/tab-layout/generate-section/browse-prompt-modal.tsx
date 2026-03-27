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
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onUseTemplate: (prompt: TPromptGuide) => void;
  organizationId?: string;
  selectedModel?: string;
}

function isAudio(url: string) {
  return /\.(mp3|wav|ogg|aac|flac|m4a)(\?|$)/i.test(url);
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov|qt)(\?|$)/i.test(url);
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

export default function BrowsePromptModal({
  open,
  onClose,
  onUseTemplate, 
  organizationId,
  selectedModel,
}: Props) {
  const [promptGuides, setPromptGuides] = useState<TPromptGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
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
      closeIcon={<X size={20} style={{ color: "rgba(255, 255, 255, 0.45)" }} />}
      styles={{
        content: {
          background: "#121214",
          padding: 0,
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.08)",
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
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)",
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
                  color: "white",
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                Prompt Guide Templates
              </Title>
              <Text
                style={{ color: "rgba(255, 255, 255, 0.45)", fontSize: 13 }}
              >
                Click any template to instantly apply it — or create your own
              </Text>
            </Space>
           
          </Flex>

          <Input
            prefix={
              <Search
                size={18}
                style={{ color: "rgba(255, 255, 255, 0.25)", marginRight: 8 }}
              />
            }
            placeholder="Search by name, description, or prompt content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              height: 48,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              color: "white",
              fontSize: 14,
            }}
            className="custom-search-input"
          />

          <div
            style={{
              marginTop: 20,
              color: "rgba(255, 255, 255, 0.35)",
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
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
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
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "#818cf8",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
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
                          color: "rgba(255, 255, 255, 0.2)",
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
                      style={{ color: "white", margin: 0, fontWeight: 700 }}
                    >
                      {guide.title}
                    </Title>
                    <Paragraph
                      style={{
                        color: "rgba(255, 255, 255, 0.45)",
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
                      background: "rgba(0, 0, 0, 0.4)",
                      borderRadius: 12,
                      aspectRatio: "3/2",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    {guide.images && guide.images.length > 0 ? (
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
                        <ImageIcon size={32} style={{ color: "rgba(255, 255, 255, 0.1)" }} />
                        <Text style={{ color: "rgba(255, 255, 255, 0.2)", fontSize: 10 }}>No Preview</Text>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      borderRadius: 12,
                      padding: 16,
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                      flex: 1,
                    }}
                  >
                    <Paragraph
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
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
                      background: "rgba(99, 102, 241, 0.1)",
                      color: "#818cf8",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
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
                  <Text style={{ color: "rgba(255,255,255,0.2)" }}>
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
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .guide-card:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-2px);
        }
        .use-template-btn:hover {
          background: #6366f1 !important;
          color: white !important;
          border-color: #6366f1 !important;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }
        .custom-search-input input::placeholder {
          color: rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
    </Modal>
  );
}
