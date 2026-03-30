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
    <div>
      {/* ...existing code... */}
      <div
        style={{
          border: `1px solid ${semantic.colorBorder}`,
          background: "rgba(99,102,241,0.08)",
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <Space align="start">
          <ThunderboltOutlined style={{ color: semantic.colorPrimary, marginTop: 4 }} />
          <div>
            <Text style={{ color: semantic.colorWhite }}>
              CI Prompt is automatically injected into every generation
            </Text>
            <div>
              <Text style={{ color: semantic.colorTextSecondary }}>
                When Brand Kit is enabled in the generation workspace, this prompt is appended to your main prompt to enforce brand consistency.
              </Text>
            </div>
          </div>
        </Space>
      </div>
      {/* ...existing code... */}
      <div style={{ marginBottom: 28 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text style={{ color: semantic.colorWhite }}>Brand CI Prompt</Text>
          {isBrandKitEmpty ? (
            <Button icon={<EditOutlined />} disabled>
              Edit
            </Button>
          ) : !isEditingCI ? (
            <Space>
              <Button icon={<ThunderboltOutlined />} onClick={handleAutoGenerate}>
                Auto-Generate
              </Button>
              <Button icon={<EditOutlined />} onClick={() => setIsEditingCI(true)}>
                Edit
              </Button>
            </Space>
          ) : (
            <Space>
              <Button
                color="green"
                icon={<CheckOutlined />}
                onClick={handleSaveCI}
              />
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleCancelCI}
              />
            </Space>
          )}
        </Space>
        <TextArea
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          rows={4}
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
            color: semantic.colorWhite,
            borderRadius: 10,
            opacity: isBrandKitEmpty ? 0.5 : (isEditingCI ? 1 : 0.7),
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
      <div style={{ marginBottom: 28 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text style={{ color: semantic.colorWhite }}>
            Negative Prompt <span style={{ color: semantic.colorTextSecondary }}>(what to avoid)</span>
          </Text>
          {!isEditingNeg ? (
            <Button icon={<EditOutlined />} onClick={() => setIsEditingNeg(true)}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button
                color="green"
                icon={<CheckOutlined />}
                onClick={handleSaveNeg}
              />
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleCancelNeg}
              />
            </Space>
          )}
        </Space>
        <TextArea
          value={neg}
          onChange={(e) => setNeg(e.target.value)}
          rows={3}
          disabled={!isEditingNeg}
          style={{
            marginTop: 8,
            background: semantic.colorBgContainer,
            border: `1px solid ${semantic.colorBorder}`,
            color: semantic.colorWhite,
            borderRadius: 10,
            opacity: isEditingNeg ? 1 : 0.7,
          }}
        />
      </div>
      {/* ...existing code... */}
      <div>
        <Text style={{ color: "#64748b" }}>Combined Prompt Preview</Text>
        <Card
          style={{
            marginTop: 8,
            background: semantic.colorBgContainer,
            border: `1px solid ${semantic.colorBorder}`,
            borderRadius: 12,
          }}
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
    </div>
  );
}