
import React, { useState } from "react";
import { Row, Col, Typography, Button, Space, Card, Form } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import TypoModal from "./typo-modal";

const { Title, Text } = Typography;



// FontItem is only for UI, not for API
interface FontItem {
  name: string;
  weight: number;
  type: string; // allow heading1-6, body, caption, paragraph
  preview: string;
}

interface TypographyTabProps {
  fonts: FontItem[];
  onAddFont?: (payload: Partial<import("@/app/common/brand-kit").TBrandKitDetail>) => void;
  onDeleteFont?: (index: number) => void;
  emptyState?: boolean;
}

const TypographyTab: React.FC<TypographyTabProps> = ({
  fonts,
  onAddFont,
  onDeleteFont,
  emptyState,
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
    const handleModalOk = async () => {
      try {
        const values = await form.validateFields();
        // Compose payload for API (if onAddFont expects API shape)
        const payload: Partial<import("@/app/common/brand-kit").TBrandKitDetail> = {
          name: values.name,
          type: "typography",
          detail: {
            weight: values.weight,
            type: values.type,
            preview: values.preview || "",
          },
          // brandKitId should be injected by parent if needed
        };
        if (onAddFont) onAddFont(payload);
        setModalOpen(false);
      } catch {
        // validation error
      }
    };

    // Handler for modal Cancel
    const handleModalCancel = () => {
      setModalOpen(false);
    };

    // Always show Add Font button, even in empty state
    if (emptyState) {
      return (
        <div>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <span />
            <Button type="default" icon={<PlusOutlined />} onClick={handleAddFont}>
              Add Font
            </Button>
          </Row>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              color: semantic.colorTextSecondary,
              gap: 12,
            }}
          >
            <div style={{ fontSize: 48, opacity: 0.2 }}>🥣</div>
            <div style={{ fontSize: 18 }}>No typography yet</div>
            <div style={{ fontSize: 14, color: semantic.colorTextSecondary }}>Add your first brand font to get started.</div>
          </div>
          <TypoModal
            open={modalOpen}
            form={form}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
          />
        </div>
      );
    }

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