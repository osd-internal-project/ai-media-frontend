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
}


export default function CIPromptTab({
  ciPrompt,
  negativePrompt,
  onChange,
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
    setIsEditingCI(false);
    setIsEditingNeg(false);
  }, [ciPrompt, negativePrompt]);

  const wordCount =
    ci.trim().length === 0 ? 0 : ci.trim().split(/\s+/).length;

  const handleCancelCI = () => {
    setCi(ciPrompt);
    setIsEditingCI(false);
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

  return (
    <div>

      {/* 🔷 Info Banner */}
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

      {/* 🔷 CI Prompt */}

      <div style={{ marginBottom: 28 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text style={{ color: semantic.colorWhite }}>Brand CI Prompt</Text>
          {!isEditingCI ? (
            <Space>
              <Button icon={<ThunderboltOutlined />}>Auto-Generate</Button>
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
          disabled={!isEditingCI}
          style={{
            marginTop: 8,
            background: semantic.colorBgContainer,
            border: `1px solid ${semantic.colorBorder}`,
            color: semantic.colorWhite,
            borderRadius: 10,
            opacity: isEditingCI ? 1 : 0.7,
          }}
        />

        <div style={{ marginTop: 8 }}>
          <Tag color="green">
            {wordCount} words · injected into all generations when active
          </Tag>
        </div>
      </div>

      {/* 🔷 Negative Prompt */}
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

      {/* 🔷 Combined Preview */}
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
              borderTop:`1px solid ${semantic.colorBorder}`,
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