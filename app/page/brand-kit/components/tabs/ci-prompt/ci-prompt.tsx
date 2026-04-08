import { Card, Typography, Input, Button, Space, Tag } from "antd";
import {
  ThunderboltOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import useResponsive from "@/app/hooks/useResponsive";

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  ciPrompt: string;
  negativePrompt: string;
  onChange: (ci: string, negative: string) => void;
  emptyState?: boolean;
  colors?: { name: string; hex: string; type: string }[];
  fonts?: { name: string; weight: number; type: string }[];
}


export default function CIPromptTab({
  ciPrompt,
  negativePrompt,
  onChange,
  emptyState,
  colors = [],
  fonts = [],
}: Props) {
  const [ci, setCi] = useState(ciPrompt);
  const [neg, setNeg] = useState(negativePrompt);

  const [isEditingCI, setIsEditingCI] = useState(false);
  const [isEditingNeg, setIsEditingNeg] = useState(false);
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setCi(ciPrompt);
    setNeg(negativePrompt);
    // Do not reset isEditingCI/isEditingNeg here to allow continuous editing
  }, [ciPrompt, negativePrompt]);

  const wordCount =
    ci.trim().length === 0 ? 0 : ci.trim().split(/\s+/).length;

  const handleCancelCI = () => {
    setCi(ciPrompt);
    setIsEditingCI(false);
  };

  // Auto-generate CI prompt from brand kit details
  const handleAutoGenerate = () => {
    // Colors description
    let colorDesc = "";
    if (colors.length > 0) {
      const colorList = colors.map(c => {
        const name = c.name && c.name.trim() ? c.name : c.type;
        const type = c.type ? `(${c.type})` : '';
        return `${name} ${type}: ${c.hex}`.replace(/ +/g, ' ');
      }).join(", ");
      colorDesc = `Brand colors: ${colorList}`;
    }
    // Fonts description (font-family, type, weight)
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
    // Combine
    const prompt = [colorDesc, fontDesc, "clean modern minimalist aesthetic, professional AI technology style, high-tech futuristic feel, crisp sharp edges, premium quality"].filter(Boolean).join(", ");
    setCi(prompt);
    setIsEditingCI(true);
  };

  const handleSaveCI = () => {
    onChange(ci, neg);
    setIsEditingCI(false);
  };

  const handleCancelNeg = () => {
    setNeg(negativePrompt);
    setIsEditingNeg(false);
  };
  const handleSaveNeg = () => {
    onChange(ci, neg);
    setIsEditingNeg(false);
  };

  // Remove the old emptyState return, instead show placeholder in TextArea below

  // Improved: also check ciPrompt string for 'Fonts:' or 'Brand colors:'
  let isBrandKitEmpty = colors.length === 0 && fonts.length === 0;
  if (isBrandKitEmpty && ciPrompt) {
    const hasFont = /Fonts:/i.test(ciPrompt);
    const hasColor = /Brand colors:/i.test(ciPrompt);
    isBrandKitEmpty = !(hasFont || hasColor);
  }

  return (
    <div className="ci-tab-shell" style={{ width: "100%" }}>
      {/* ...existing code... */}
      <div
        className="ci-tab-alert"
        style={{
          border: `1px solid ${semantic.colorBorder}`,
          background: "rgba(99,102,241,0.08)",
          padding: isMobile ? 12 : isTablet ? 14 : 16,
          borderRadius: 12,
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <Space align="start" size={isMobile ? 8 : 12}>
          <ThunderboltOutlined style={{ color: semantic.colorPrimary, marginTop: 4 }} />
          <div>
            <Text style={{ color: semantic.colorTextBase, fontSize: isMobile ? 13 : 14 }}>
              CI Prompt is automatically injected into every generation
            </Text>
            <div>
              <Text style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 12 : 13 }}>
                When Brand Kit is enabled in the generation workspace, this prompt is appended to your main prompt to enforce brand consistency.
              </Text>
            </div>
          </div>
        </Space>
      </div>
      {/* ...existing code... */}
      <div className="ci-tab-section" style={{ marginBottom: isMobile ? 20 : 28 }}>
        <Space style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap", rowGap: 8 }}>
          <Text style={{ color: semantic.colorTextBase, fontSize: isMobile ? 13 : 14 }}>Brand CI Prompt</Text>
          {isBrandKitEmpty ? (
            <Button className="ci-tab-action" size={isMobile ? "small" : "middle"} icon={<EditOutlined />} disabled>
              Edit
            </Button>
          ) : !isEditingCI ? (
            <Space size={isMobile ? 6 : 8} wrap>
              <Button className="ci-tab-action" size={isMobile ? "small" : "middle"} icon={<ThunderboltOutlined />} onClick={handleAutoGenerate}>
                {isMobile ? "Auto" : "Auto-Generate"}
              </Button>
              <Button className="ci-tab-action" size={isMobile ? "small" : "middle"} icon={<EditOutlined />} onClick={() => setIsEditingCI(true)}>
                Edit
              </Button>
            </Space>
          ) : (
            <Space size={isMobile ? 6 : 8}>
              <Button
                className="ci-tab-action"
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSaveCI}
                size={isMobile ? "small" : "middle"}
              />
              <Button
                className="ci-tab-action"
                danger
                icon={<CloseOutlined />}
                onClick={handleCancelCI}
                size={isMobile ? "small" : "middle"}
              />
            </Space>
          )}
        </Space>
        <TextArea
          className="ci-tab-textarea"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          rows={isMobile ? 5 : 4}
          disabled={isBrandKitEmpty || !isEditingCI}
          placeholder={
            isBrandKitEmpty
              ? "Add at least one color or font to your Brand Kit before creating a CI Prompt. Go to the Colors or Typography tab first."
              : (emptyState ? "No CI Prompt yet. Add your first CI prompt to get started." : undefined)
          }
          style={{
            marginTop: 8,
            background: semantic.colorBgContainer,
            border: `1px solid ${semantic.colorBorder}`,
            color: semantic.colorTextBase,
            borderRadius: 10,
            opacity: isBrandKitEmpty ? 0.5 : (isEditingCI ? 1 : 0.7),
            fontSize: isMobile ? 13 : 14,
          }}
        />
        {isBrandKitEmpty && (
          <div style={{ color: semantic.colorTextSecondary, marginTop: 8 }}>
            <b>Tip:</b> Add at least one color or font in your Brand Kit before creating a CI Prompt. <br />
            Go to the <b>Colors</b> or <b>Typography</b> tab first.
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <Tag color="green">
            {wordCount} words · injected into all generations when active
          </Tag>
        </div>
      </div>
      {/* ...existing code... */}
      <div className="ci-tab-section" style={{ marginBottom: isMobile ? 20 : 28 }}>
        <Space style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap", rowGap: 8 }}>
          <Text style={{ color: semantic.colorTextBase, fontSize: isMobile ? 13 : 14 }}>
            Negative Prompt <span style={{ color: semantic.colorTextSecondary }}>(what to avoid)</span>
          </Text>
          {!isEditingNeg ? (
            <Button className="ci-tab-action" size={isMobile ? "small" : "middle"} icon={<EditOutlined />} onClick={() => setIsEditingNeg(true)}>
              Edit
            </Button>
          ) : (
            <Space size={isMobile ? 6 : 8}>
              <Button
                className="ci-tab-action"
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleSaveNeg}
                size={isMobile ? "small" : "middle"}
              />
              <Button
                className="ci-tab-action"
                danger
                icon={<CloseOutlined />}
                onClick={handleCancelNeg}
                size={isMobile ? "small" : "middle"}
              />
            </Space>
          )}
        </Space>
        <TextArea
          className="ci-tab-textarea"
          value={neg}
          onChange={(e) => setNeg(e.target.value)}
          rows={isMobile ? 4 : 3}
          disabled={!isEditingNeg}
          style={{
            marginTop: 8,
            background: semantic.colorBgContainer,
            border: `1px solid ${semantic.colorBorder}`,
            color: semantic.colorTextBase,
            borderRadius: 10,
            opacity: isEditingNeg ? 1 : 0.7,
            fontSize: isMobile ? 13 : 14,
          }}
        />
      </div>
      {/* ...existing code... */}
      <div className="ci-tab-section">
        <Text style={{ color: "#64748b", fontSize: isMobile ? 12 : 13 }}>Combined Prompt Preview</Text>
        <Card
          className="ci-tab-preview-card"
          style={{
            marginTop: 8,
            background: semantic.colorBgContainer,
            border: `1px solid ${semantic.colorBorder}`,
            borderRadius: 12,
          }}
          bodyStyle={{ padding: isMobile ? 12 : 16 }}
        >
          <div style={{ marginBottom: 12 }}>
            <Text style={{ color: semantic.colorTextSecondary }}>Your prompt</Text>
            <div style={{ color: semantic.colorTextSecondary }}>
              "A hero image for our new product launch"
            </div>
          </div>
          <div
            style={{
              borderTop: `1px solid ${semantic.colorBorder}`,
              paddingTop: 12,
            }}
          >
            <Text style={{ color: semantic.colorTextSecondary }}>+ Brand Kit</Text>
            <div style={{ color: semantic.colorPrimary, marginTop: 4 }}>
              {ci}
            </div>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        .ci-tab-alert,
        .ci-tab-section {
          animation: ciTabFadeIn 300ms ease;
        }

        .ci-tab-action {
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .ci-tab-action:hover {
          transform: translateY(-1px);
        }

        .ci-tab-textarea {
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .ci-tab-preview-card {
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .ci-tab-preview-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        @keyframes ciTabFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}