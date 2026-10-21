import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Typography, Button, Space, Card, Tag, Progress, Form, Input } from "antd";
import { PlusOutlined, SoundOutlined, EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import useResponsive from "@/app/hooks/useResponsive";

const { Title, Text, Paragraph } = Typography;

interface ToneProfile {
  formalCasual: number;
  professionalFriendly: number;
  conservativeBold: number;
  seriousPlayful: number;
}

interface BrandVoiceTabProps {
  initialPrompt?: string;
  saving?: boolean;
  onSaveVoice?: (payload: {
    prompt: string;
    toneProfile: ToneProfile;
    keywords: string[];
  }) => Promise<void> | void;
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const countMatches = (text: string, words: string[]) => {
  return words.reduce((total, word) => {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = text.match(pattern);
    return total + (matches ? matches.length : 0);
  }, 0);
};

const computeAxis = (text: string, leftWords: string[], rightWords: string[]) => {
  const leftScore = countMatches(text, leftWords);
  const rightScore = countMatches(text, rightWords);
  return clamp(Math.round(50 + (rightScore - leftScore) * 12));
};

const extractKeywords = (prompt: string) => {
  const stopwords = new Set([
    "the", "and", "for", "with", "that", "this", "from", "into", "your", "you", "about", "while",
    "are", "was", "were", "have", "has", "had", "will", "would", "should", "could", "can", "our",
    "their", "they", "them", "his", "her", "its", "not", "but", "without", "using", "use", "uses",
    "very", "more", "most", "less", "than", "into", "onto", "over", "under", "remain", "remaining",
    "clean", "direct", "language",
  ]);

  const tokens = (prompt.toLowerCase().match(/[a-z][a-z-]{2,}/g) || [])
    .filter((token) => !stopwords.has(token));

  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

const analyzePrompt = (prompt: string) => {
  const text = prompt.toLowerCase();

  const toneProfile: ToneProfile = {
    formalCasual: computeAxis(text, ["formal", "structured", "official", "precise"], ["casual", "relaxed", "conversational", "simple"]),
    professionalFriendly: computeAxis(text, ["professional", "expert", "corporate", "authoritative"], ["friendly", "warm", "approachable", "human"]),
    conservativeBold: computeAxis(text, ["conservative", "careful", "safe", "stable"], ["bold", "innovative", "cutting-edge", "daring"]),
    seriousPlayful: computeAxis(text, ["serious", "focused", "disciplined", "strict"], ["playful", "fun", "creative", "light"]),
  };

  return {
    toneProfile,
    keywords: extractKeywords(prompt),
  };
};

const BrandVoiceTab: React.FC<BrandVoiceTabProps> = ({
  initialPrompt,
  saving,
  onSaveVoice,
}) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile } = useResponsive();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      prompt: initialPrompt || "",
    });
  }, [initialPrompt, form]);

  const promptText = Form.useWatch("prompt", form) || "";
  const analysis = useMemo(() => analyzePrompt(String(promptText || "")), [promptText]);

  const handleSave = async () => {
    const values = await form.validateFields();
    await onSaveVoice?.({
      prompt: values.prompt,
      toneProfile: analysis.toneProfile,
      keywords: analysis.keywords,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.setFieldsValue({
      prompt: initialPrompt || "",
    });
    setIsEditing(false);
  };

return (
  <div className="brand-voice-shell">
    <Form form={form} layout="vertical">
      <Card
        className="brand-voice-card"
        styles={{
          body: {
            padding: isMobile ? 14 : 16,
          },
        }}
        style={{
          borderRadius: 18,
          border: "none",
          boxShadow: "none",
          background: "transparent",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 14 }}
        >
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: isMobile ? 15 : 16,
              color: semantic.colorTextBase,
            }}
          >
            Brand Voice & Tone
          </Title>

          {!isEditing ? (
            <Button
              className="brand-voice-action"
              size={isMobile ? "small" : "middle"}
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <Space size={8}>
              <Button
                className="brand-voice-action"
                type="primary"
                loading={saving}
                onClick={handleSave}
                icon={<CheckOutlined />}
                size={isMobile ? "small" : "middle"}
              />
              <Button
                className="brand-voice-action"
                danger
                onClick={handleCancel}
                icon={<CloseOutlined />}
                size={isMobile ? "small" : "middle"}
              />
            </Space>
          )}
        </Row>

        {/* Prompt Input */}
        <Form.Item
          name="prompt"
          style={{ marginBottom: 20 }}
          rules={[
            {
              required: true,
              message: "Please enter your brand voice prompt",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Innovative, professional, approachable. Speaks with confidence about cutting-edge AI technology while remaining accessible. Uses clean, direct language without jargon."
            disabled={!isEditing}
            style={{
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 14,
              background: semantic.colorBgContainer,
              color: semantic.colorTextBase,
              boxShadow: "none",
              opacity: isEditing ? 1 : 0.72,
            }}
          />
        </Form.Item>

        {/* Tone Profile */}
        <div
          style={{
            marginBottom: 20,
            border: `1px solid ${semantic.colorBorder}`,
            borderRadius: 14,
            padding: isMobile ? 12 : 14,
            background: mode === "dark" ? "rgba(255,255,255,0.02)" : semantic.colorBgContainer,
          }}
        >
          <Title
            level={5}
            style={{
              margin: 0,
              marginBottom: 14,
              fontSize: isMobile ? 14 : 15,
              color: semantic.colorTextBase,
            }}
          >
            Tone Profile
          </Title>

          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            {[
              {
                label: "Formal ⟶ Casual",
                value: analysis.toneProfile.formalCasual,
              },
              {
                label: "Professional ⟶ Friendly",
                value: analysis.toneProfile.professionalFriendly,
              },
              {
                label: "Conservative ⟶ Bold",
                value: analysis.toneProfile.conservativeBold,
              },
              {
                label: "Serious ⟶ Playful",
                value: analysis.toneProfile.seriousPlayful,
              },
            ].map((item) => (
              <div key={item.label}>
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 6 }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: semantic.colorTextSecondary,
                    }}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: mode === "dark" ? "#94a3b8" : semantic.colorTextSecondary,
                    }}
                  >
                    {item.value}%
                  </Text>
                </Row>

                <Progress
                  percent={item.value}
                  showInfo={false}
                  strokeColor="#7c6cf6"
                  trailColor={
                    mode === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.05)"
                  }
                  strokeWidth={6}
                />
              </div>
            ))}
          </Space>
        </div>

        {/* Keywords */}
        <div>
          <Title
            level={5}
            style={{
              margin: 0,
              marginBottom: 14,
              fontSize: isMobile ? 14 : 15,
              color: semantic.colorTextBase,
            }}
          >
            Brand Keywords
          </Title>

          <Space wrap size={[8, 8]}>
            {analysis.keywords.length > 0 ? (
              <>
                {analysis.keywords.map((keyword) => (
                  <Tag
                    key={keyword}
                    style={{
                      margin: 0,
                      borderRadius: 999,
                      padding: "4px 12px",
                      fontSize: 12,
                      background:
                        mode === "dark"
                          ? "rgba(99,102,241,0.12)"
                          : "rgba(79,70,229,0.08)",
                      border: "none",
                      color:
                        mode === "dark"
                          ? "#a78bfa"
                          : semantic.colorPrimary,
                    }}
                  >
                    {keyword}
                  </Tag>
                ))}

                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  style={{
                    borderRadius: 999,
                    height: 28,
                    paddingInline: 10,
                    fontSize: 12,
                    color: semantic.colorTextSecondary,
                    background: "transparent",
                  }}
                >
                  Add
                </Button>
              </>
            ) : (
              <Text style={{ color: semantic.colorTextSecondary }}>
                No keywords yet
              </Text>
            )}
          </Space>
        </div>
      </Card>
    </Form>


  </div>
);
};

export default BrandVoiceTab;