
import React, { useState } from "react";
import { Row, Col, Typography, Button, Space, Card, Form, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import TypoModal from "./typo-modal";

const { Title, Text } = Typography;



// FontItem is only for UI, not for API
interface FontItem {
  id: string; // เพิ่ม id สำหรับแต่ละ font
  name: string;
  weight: number;
  type: string; // allow heading1-6, body, caption, paragraph
  preview: string;
}

interface TypographyTabProps {
  fonts: FontItem[];
  onAddFont?: (payload: Partial<import("@/app/common/brand-kit").TBrandKitDetail>, editId?: string | null) => void;
  onDeleteFont?: (id: string) => void;
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
    const [editIndex, setEditIndex] = useState<string | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    // Handler for opening modal (add)
    const handleAddFont = () => {
      form.resetFields();
      setEditIndex(null);
      setModalOpen(true);
    };

    // Handler for opening modal (edit)
    const handleEditFont = (font: FontItem) => {
      form.setFieldsValue({
        name: font.name,
        weight: font.weight,
        type: font.type,
        preview: font.preview,
      });
      setEditIndex(font.id);
      setModalOpen(true);
    };

    // Handler for modal OK
    const handleModalOk = async () => {
      try {
        const values = await form.validateFields();
        const payload: Partial<import("@/app/common/brand-kit").TBrandKitDetail> = {
          name: values.name,
          type: "typography",
          detail: {
            weight: values.weight,
            type: values.type,
            preview: values.preview || "",
          },
        };
        if (onAddFont) onAddFont(payload, editIndex);
        setModalOpen(false);
        setEditIndex(null);
      } catch {
        // validation error
      }
    };

    // Handler for modal Cancel
    const handleModalCancel = () => {
      setModalOpen(false);
      setEditIndex(null);
    };

    // Handler for delete
    const handleDeleteFont = (id: string) => {
      setDeleteTarget(id);
      setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
      if (onDeleteFont && deleteTarget !== null) {
        onDeleteFont(deleteTarget);
      }
      setDeleteModalVisible(false);
      setDeleteTarget(null);
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
            mode={editIndex ? 'edit' : 'add'}
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
        {fonts.map((font) => (
          <Card
            key={font.id}
            size="small"
            className="typo-card-hover-group"
            bodyStyle={{ display: "flex", alignItems: "center", gap: 16 }}
            style={{ borderRadius: 12, background: semantic.colorBgContainer, border: `1px solid ${semantic.colorBorder}` }}
          >
            {/* Font Icon */}
        <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                background: semantic.colorBgTextActive,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 38,
                border: `1px solid ${semantic.colorBorder}`
              }}
            >
              T
            </div>

            {/* Font Info */}
            <div style={{ flex: 1 }}>
              <Row align="middle" style={{ gap: 12 }}>
                <Title level={5} style={{ color: semantic.colorText, margin: 0 }}>
                  {font.name}
                </Title>
                <Text
                  style={{
                    fontSize: 12,
                    color: semantic.colorTextSecondary,
                    textTransform: "capitalize",
                    border: `1px solid ${semantic.colorBorder}`,
                    padding: "2px 6px",
                    borderRadius: 6,
                  }}
                >
                  {font.type}
                </Text>
              </Row>
              <Text style={{ color: semantic.colorTextSecondary, fontSize: 12 }}>
                Weight {font.weight} · {font.type }
              </Text>
              <Text style={{ color: semantic.colorTextSecondary, fontSize: 12, marginLeft: 12 }}>
                {font.type}
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text
                  style={{
                    color: semantic.colorText,
                    fontSize: 16,
                    fontFamily: `${font.name}, 'Segoe UI', 'Arial', sans-serif`,
                    fontWeight: font.weight,
                    background: 'rgba(0,0,0,0.04)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    display: 'inline-block',
                  }}
                >
                  &quot;{font.preview}&quot;
                </Text>
              </div>
            </div>

            {/* Action Buttons - top right, vertical, show on hover, float above content */}
            <div
              className="typo-action-btns"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                zIndex: 10,
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              <Button
                type="text"
                icon={<EditOutlined style={{ fontSize: 18 }} />}
                style={{ width: 36, height: 36, borderRadius: 18, color: semantic.colorTextSecondary, background: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                onClick={() => handleEditFont(font)}
                aria-label="Edit Font"
                tabIndex={-1}
              />
              <Button
                type="text"
                icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                danger
                style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,0,0,0.06)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                onClick={() => handleDeleteFont(font.id)}
                aria-label="Delete Font"
                tabIndex={-1}
              />
            </div>

          </Card>
        ))}
      </Space>

  
      <Modal
        open={deleteModalVisible}
        title={
          deleteTarget !== null
            ? `Delete font "${fonts.find(f => f.id === deleteTarget)?.name || ''}"?`
            : ''
        }
        onOk={handleConfirmDelete}
        onCancel={() => { setDeleteModalVisible(false); setDeleteTarget(null); }}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        destroyOnClose
      >
        Are you sure you want to delete this font? This action cannot be undone.
      </Modal>

      {/* TypoModal for add/edit font */}
      <TypoModal
        open={modalOpen}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        mode={editIndex ? 'edit' : 'add'}
      />
    </div>
  );
};

export default TypographyTab;