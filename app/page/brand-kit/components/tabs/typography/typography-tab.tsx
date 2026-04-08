
import React, { useState } from "react";
import { Row, Col, Typography, Button, Space, Card, Form, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import TypoModal from "./typo-modal";
import useResponsive from "@/app/hooks/useResponsive";

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
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const { isMobile, isTablet } = useResponsive();

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
        <div className="typo-tab-shell">
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <span />
            <Button className="typo-tab-action" type="default" size={isMobile ? "small" : "middle"} icon={<PlusOutlined />} onClick={handleAddFont}>
              {isMobile ? "Add" : "Add Font"}
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
            <div style={{ fontSize: isMobile ? 16 : 18 }}>No typography yet</div>
            <div style={{ fontSize: isMobile ? 13 : 14, color: semantic.colorTextSecondary }}>Add your first brand font to get started.</div>
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
    <div className="typo-tab-shell">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Text style={{ color: "#94a3b8", fontSize: isMobile ? 12 : 13 }}>{fonts.length} fonts configured</Text>
        <Button className="typo-tab-action" type="default" size={isMobile ? "small" : "middle"} icon={<PlusOutlined />} onClick={handleAddFont}>
          {isMobile ? "Add" : "Add Font"}
        </Button>
      </Row>

      <div className="typo-list-scroll" style={{ maxHeight: isMobile ? "unset" : 620, overflowY: isMobile ? "visible" : "auto", paddingRight: isMobile ? 0 : 4 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={isMobile ? 12 : 16}>
        {fonts.map((font) => (
          <Card
            key={font.id}
            size="small"
            className="typo-card-hover-group typo-card-anim"
            styles={{ body: { display: "flex", alignItems: "center", gap: isMobile ? 10 : 16, padding: isMobile ? 10 : 16 } }}
            style={{ borderRadius: 12, background: semantic.colorBgContainer, border: `1px solid ${semantic.colorBorder}`, position: "relative" }}
            onMouseEnter={() => setHoveredId(font.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Font Icon */}
        <div
              style={{
                width: isMobile ? 44 : isTablet ? 52 : 60,
                height: isMobile ? 44 : isTablet ? 52 : 60,
                borderRadius: 8,
                background: semantic.colorBgTextActive,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: isMobile ? 26 : isTablet ? 32 : 38,
                border: `1px solid ${semantic.colorBorder}`
              }}
            >
              T
            </div>

            {/* Font Info */}
            <div style={{ flex: 1 }}>
              <Row align="middle" style={{ gap: 12 }}>
                <Title level={5} style={{ color: semantic.colorTextBase, margin: 0, fontSize: isMobile ? 15 : 18 }}>
                  {font.name}
                </Title>
                <Text
                  style={{
                    fontSize: isMobile ? 11 : 12,
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
              <Text style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 11 : 12 }}>
                Weight {font.weight} · {font.type }
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text
                  style={{
                    color: semantic.colorTextBase,
                    fontSize: isMobile ? 13 : isTablet ? 14 : 16,
                    fontFamily: `${font.name}, 'Segoe UI', 'Arial', sans-serif`,
                    fontWeight: font.weight,
                    background: 'rgba(0,0,0,0.04)',
                    borderRadius: 6,
                    padding: isMobile ? '2px 6px' : '2px 8px',
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
                gap: isMobile ? 6 : 8,
                zIndex: 10,
                opacity: isMobile || isTablet || hoveredId === font.id ? 1 : 0,
                pointerEvents: isMobile || isTablet || hoveredId === font.id ? 'auto' : 'none',
                transition: 'opacity 0.2s',
              }}
            >
              <Button
                className="typo-tab-action"
                type="text"
                icon={<EditOutlined style={{ fontSize: isMobile ? 14 : 18 }} />}
                style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: 18, color: semantic.colorTextSecondary, background: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                onClick={() => handleEditFont(font)}
                aria-label="Edit Font"
                tabIndex={-1}
              />
              <Button
                className="typo-tab-action"
                type="text"
                icon={<DeleteOutlined style={{ fontSize: isMobile ? 14 : 18 }} />}
                danger
                style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: 18, background: 'rgba(255,0,0,0.06)', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                onClick={() => handleDeleteFont(font.id)}
                aria-label="Delete Font"
                tabIndex={-1}
              />
            </div>

          </Card>
        ))}
      </Space>
      </div>

  
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
        destroyOnHidden
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

      <style jsx global>{`
        .typo-list-scroll {
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .typo-list-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .typo-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.3);
          border-radius: 999px;
        }

        .typo-card-anim {
          animation: typoCardIn 300ms ease;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .typo-card-anim:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        }

        .typo-tab-action {
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .typo-tab-action:hover {
          transform: translateY(-1px);
        }

        @keyframes typoCardIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TypographyTab;