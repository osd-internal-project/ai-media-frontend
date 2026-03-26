import React, { useState } from "react";
import { Row, Col, Typography, Tag, Button, message, Form } from "antd";
import { CopyOutlined, FileAddFilled } from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { Plus, PlusIcon } from "lucide-react";
import ColorModal from "./color-modal";

const { Title, Text } = Typography;

interface ColorItem {
  name: string;
  hex: string;
  type: string;
}

interface ColorTabProps {
  colors: ColorItem[];
}


const ColorTab: React.FC<ColorTabProps> = ({ colors }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();


  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    messageApi.success(`Copied: ${hex}`);
  };

  const handleAddColor = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      // TODO: handle add color logic here
      messageApi.success("Color added!");
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Group colors by type
  const colorsByType: Record<string, ColorItem[]> = {};
  colors.forEach((c) => {
    if (!colorsByType[c.type]) colorsByType[c.type] = [];
    colorsByType[c.type].push(c);
  });

  return (
    <div>
      {contextHolder}


      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text color={semantic.colorTextSecondary}>
          {colors.length} colors defined · click swatch to copy hex
        </Text>
        <Button type="default" icon={<PlusIcon />} onClick={handleAddColor}>
          Add Color
        </Button>
      </div>

      <ColorModal
        open={isModalOpen}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />

      {Object.entries(colorsByType).map(([type, groupColors]) => (
        <div key={type} style={{ marginTop: 24 }}>
          <Text style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>
            {type.toUpperCase()}
          </Text>

          <Row gutter={[24, 24]} style={{ marginTop: 8 }}>
            {groupColors.map((color, index) => {
              const hoverKey = `${type}-${index}`; // unique key per swatch
              return (
                <Col key={`${color.name}-${color.hex}`} flex="0 0 200px">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Swatch 1:1 with hover overlay */}
                    <div
                      style={{
                        position: "relative",
                        width: "200px",
                        aspectRatio: "1 / 1",
                        borderRadius: 12,
                        background: color.hex,
                        cursor: "pointer",
                        overflow: "hidden",
                        border: `1px solid ${semantic.colorBorder}`,
                      }}
                      onMouseEnter={() => setHoveredKey(hoverKey)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      {hoveredKey === hoverKey && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Button
                            type="primary"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopy(color.hex)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Name & Hex */}
                    <Title level={5} style={{ margin: 0, color: semantic.colorWhite }}>
                      {color.name}
                    </Title>
                    <Text>{color.hex}</Text>
                    <Tag
                      style={{
                        marginTop: 8,
                        color: color.hex,
                        width: "fit-content",
                        textAlign: "center",
                        borderRadius: 8,
                        border: `1px solid ${color.hex}`,
                        letterSpacing: 0.5,
                        display: "inline-block",
                      }}
                    >
                      {color.type}
                    </Tag>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}
    {/* Palette Section */}
    <div style={{ marginTop: 48 }}>
      <Text style={{ color: "#64748b", fontSize: 13, fontWeight: 500, marginBottom: 8, display: "block" }}>
        Palette
      </Text>
      <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px 0 #0001", minHeight: 36, border: `1px solid ${semantic.colorBorder}` }}>
        {colors.map((color, idx) => (
          <div
            key={color.hex + idx}
            style={{
              flex: 1,
              background: color.hex,
              minWidth: 0,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 500,
              fontSize: 12,
              borderRight: idx !== colors.length - 1 ? `1px solid ${semantic.colorBorder}` : undefined,
              transition: "background 0.2s",
            }}
            title={color.name + ' ' + color.hex}
          >
            {/* Optional: show nothing or color name/hex */}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default ColorTab;