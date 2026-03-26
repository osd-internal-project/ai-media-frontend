
import React, { useState } from "react";
import { Row, Col, Typography, Button, Space, Card, Form } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import TypoModal from "./typo-modal";

const { Title, Text } = Typography;

interface FontItem {
  name: string;
  weight: number;
  type: "heading" | "body";
  preview: string;
}

interface TypographyTabProps {
  fonts: FontItem[];
  onAddFont?: (values: Partial<FontItem>) => void;
  onDeleteFont?: (index: number) => void;
}

const TypographyTab: React.FC<TypographyTabProps> = ({
  fonts,
  onAddFont,
  onDeleteFont,
}) => {
     const { mode } = useThemeMode();
    const semantic = getThemeConfig(mode).token ?? {};
     const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Handler for opening modal
  const handleAddFont = () => {
    form.resetFields();
    setModalOpen(true);
  };

  // Handler for modal OK
  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Call parent handler if provided
        if (onAddFont) onAddFont(values);
        setModalOpen(false);
      })
      .catch(() => {});
  };

  // Handler for modal Cancel
  const handleModalCancel = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Text style={{ color: "#94a3b8" }}>{fonts.length} fonts configured</Text>
        <Button type="default" icon={<PlusOutlined />} onClick={handleAddFont}>
          Add Font
        </Button>
      </Row>

      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {fonts.map((font, index) => (
          <Card
            key={`${font.name}-${index}`}
            size="small"
            bodyStyle={{ display: "flex", alignItems: "center", gap: 16 }}
            style={{ borderRadius: 12, background: semantic.colorBgContainer, border: `1px solid ${semantic.colorBorder}` }}
          >
            {/* Font Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: semantic.colorBgTextActive,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                border: `1px solid ${semantic.colorBorder}`
              }}
            >
              T
            </div>

            {/* Font Info */}
            <div style={{ flex: 1 }}>
              <Row align="middle" justify="space-between">
                <Title level={5} style={{ color: "#e5e7eb", margin: 0 }}>
                  {font.name}
                </Title>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    textTransform: "capitalize",
                    border: "1px solid #334155",
                    padding: "2px 6px",
                    borderRadius: 6,
                  }}
                >
                  {font.type}
                </Text>
              </Row>
              <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                Weight {font.weight} · {font.type === "heading" ? "Heading" : "Body"}
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: 14 }}>
                {font.preview}
              </Text>
            </div>

            {/* Delete Button */}
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              onClick={() => onDeleteFont?.(index)}
            />
          </Card>
        ))}
      </Space>

      {/* TypoModal for adding font */}
      <TypoModal
        open={modalOpen}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default TypographyTab;