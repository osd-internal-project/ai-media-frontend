import React, { useState } from "react";
import { Row, Col, Typography, Tag, Button, message, Form, Modal } from "antd";
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { PlusIcon } from "lucide-react";
import ColorModal from "./color-modal";
import BrandKitDetailServices from "@/app/services/brand-kit-detail.service";
import useResponsive from "@/app/hooks/useResponsive";

const { Title, Text } = Typography;

interface ColorItem {
  id: string;
  name: string;
  hex: string;
  type: string;
}



interface ColorTabProps {
  colors: ColorItem[];
  brandKitId?: string;
  axiosCore: any;
  onColorAdded: () => void;
  emptyState?: boolean;
}




const ColorTab: React.FC<ColorTabProps> = ({ colors, brandKitId, axiosCore, onColorAdded, emptyState }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { isMobile, isTablet } = useResponsive();


  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    messageApi.success(`Copied: ${hex}`);
  }
  // ต้องอยู่ตรงนี้เพื่อให้ทุกฟังก์ชันใน component เห็น
  const [editColor, setEditColor] = useState<ColorItem | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleAddColor = () => {
    setEditColor(null);
    setEditIndex(null);
    setIsModalOpen(true);
  };

  // Modal state for delete confirmation
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ color: ColorItem; index: number } | null>(null);

  const handleDeleteColor = (color: ColorItem, index: number) => {
    setDeleteTarget({ color, index });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { color, index } = deleteTarget;
    try {
      const colorDetail = (colors as any[])[index];
      const id = colorDetail?.id;
      if (!id) {
        messageApi.error("Cannot find color id to delete");
        setDeleteModalVisible(false);
        setDeleteTarget(null);
        return;
      }
      const brandKitDetailService = BrandKitDetailServices(axiosCore);
      await brandKitDetailService.del(id);
      messageApi.success("Color deleted");
      onColorAdded(); // refresh
    } catch (err) {
      messageApi.error("Failed to delete color");
    } finally {
      setDeleteModalVisible(false);
      setDeleteTarget(null);
    }
  };



  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (!brandKitId) {
        messageApi.error("No Brand Kit selected");
        return;
      }
      const brandKitDetailService = BrandKitDetailServices(axiosCore);
      const payload: Partial<import("@/app/common/brand-kit").TBrandKitDetail> = {
        name: values.name,
        type: "colors",
        detail: {
          hex: values.hex,
          type: values.type,
        },
        brandKitId,
      };
      console.log("[DEBUG] BrandKitDetail payload:", payload);
      try {
        // ถ้า editColor มีค่า ให้เรียก update
        if (editColor && editIndex !== null) {
          // หา id ของสีที่จะแก้ไข
          const colorId = editColor.id;
          const updatePayload: Partial<import("@/app/common/brand-kit").TBrandKitDetail> = {
            name: values.name,
            type: "colors",
            detail: {
              hex: values.hex,
              type: values.type,
            },
            brandKitId,
          };
          const res = await brandKitDetailService.update(colorId, updatePayload);
          if (res) {
            messageApi.success("Color updated!");
            setIsModalOpen(false);
            form.resetFields();
            setEditColor(null);
            setEditIndex(null);
            onColorAdded();
          } else {
            messageApi.error("Failed to update color");
          }
          return;
        }
        // create ปกติ
        const res = await brandKitDetailService.create(payload);
        console.log("[DEBUG] BrandKitDetail response:", res);
        if (res) {
          messageApi.success("Color added!");
          setIsModalOpen(false);
          form.resetFields();
          setEditColor(null);
          setEditIndex(null);
          onColorAdded();
        } else {
          messageApi.error("Failed to add color");
        }
      } catch (err) {
        console.error("[DEBUG] BrandKitDetail error:", err);
        messageApi.error("Failed to add color (see console)");
      }
    } catch (e) {
      // validation error
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };


  // กำหนดลำดับความสำคัญของประเภทสี
  const COLOR_TYPE_PRIORITY = [
    "primary",
    "secondary",
    "accent",
    "neutral",
    "success",
    "warning",
    "error",
    "info",
    "other"
  ];

  // Group colors by type
  const colorsByType: Record<string, ColorItem[]> = {};
  colors.forEach((c) => {
    if (!colorsByType[c.type]) colorsByType[c.type] = [];
    colorsByType[c.type].push(c);
  });

  // สร้างลำดับประเภทตาม priority เสมอ (ถ้าไม่มีสีใน type นั้นจะข้าม)
  const orderedTypes = COLOR_TYPE_PRIORITY.filter(type => colorsByType[type] && colorsByType[type].length > 0)
    .concat(
      Object.keys(colorsByType)
        .filter(type => !COLOR_TYPE_PRIORITY.includes(type))
    );

  return (
    <div
      className="color-tab-root"
      style={{
        width: "100%",
        overflow: "visible",
        touchAction: "pan-y",
        paddingBottom: isMobile ? 8 : 12,
      }}
    >
      {contextHolder}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
        <Text style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 12 : 13 }}>
          {colors.length} colors defined · click swatch to copy hex
        </Text>
        <Button className="color-tab-action" type="default" size={isMobile ? "small" : "middle"} icon={<PlusIcon size={isMobile ? 14 : 16} />} onClick={handleAddColor}>
          {isMobile ? "Add" : "Add Color"}
        </Button>
      </div>

      <ColorModal
        open={isModalOpen}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />

      {(emptyState || colors.length === 0) ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 220,
          color: semantic.colorTextSecondary,
          gap: 12,
        }}>
          <div style={{ fontSize: 48, opacity: 0.2 }}>🥣</div>
          <div style={{ fontSize: 18 }}>No colors yet</div>
          <div style={{ fontSize: 14, color: semantic.colorTextSecondary }}>Add your first brand color to get started.</div>
        </div>
      ) : (
        <div
          className="color-tab-scroll-shell"
          style={{
            overflowY: "visible",
            overflowX: "visible",
            paddingBottom: 0,
          }}
        >
          {orderedTypes.map((type) => {
            const groupColors = colorsByType[type];
            return (
              <div key={type} className="color-tab-group" style={{ marginTop: 24 }}>
                <Text style={{ color: semantic.colorTextSecondary, fontSize: 12, fontWeight: 500 }}>
                  {type.toUpperCase()}
                </Text>

                <Row
                  gutter={[isMobile ? 12 : 20, isMobile ? 14 : 24]}
                  style={{ marginTop: 8, marginLeft: 0, marginRight: 0 }}
                >
                  {groupColors.map((color, groupIdx) => {
                    const hoverKey = `${type}-${groupIdx}`;
                    const showActions = hoveredKey === hoverKey || isMobile;
                    // หา index จริงของสีนี้ใน colors (เพื่อให้ลบ/แก้ไขถูกต้อง)
                    const realIndex = colors.findIndex(
                      c => c.id === color.id
                    );
                    return (
                      <Col key={color.id} xs={12} sm={8} md={8} lg={6} xl={6}>
                        <div className="color-tab-item" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {/* Swatch 1:1 with hover overlay */}
                          <div
                            className="color-tab-swatch"
                            style={{
                              position: "relative",
                              width: "100%",
                              maxWidth: isMobile ? 140 : isTablet ? 170 : 200,
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
                            {showActions && (
                              <div
                                className="color-tab-overlay"
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: isMobile ? 8 : 12,
                                  background: isMobile ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.18)",
                                }}
                              >
                                <Button
                                  className="color-tab-icon-btn"
                                  type="text"
                                  icon={<CopyOutlined style={{ fontSize: isMobile ? 14 : 18 }} />}
                                  onClick={() => handleCopy(color.hex)}
                                  style={{
                                    minWidth: isMobile ? 30 : 36,
                                    width: isMobile ? 32 : 40,
                                    height: isMobile ? 32 : 40,
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.18)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#',
                                    boxShadow: '0 1px 4px #0001',
                                  }}
                                />
                                <Button
                                  className="color-tab-icon-btn"
                                  type="text"
                                  icon={<EditOutlined style={{ fontSize: isMobile ? 14 : 18 }} />}
                                  onClick={() => {
                                    setEditColor(color);
                                    setEditIndex(realIndex);
                                    form.setFieldsValue({
                                      id: color.id,
                                      name: color.name,
                                      hex: color.hex,
                                      type: color.type,
                                    });
                                    setIsModalOpen(true);
                                  }}
                                  style={{
                                    minWidth: isMobile ? 30 : 36,
                                    width: isMobile ? 32 : 40,
                                    height: isMobile ? 32 : 40,
                                    borderRadius: 8,
                                    color: '#222',
                                    background: 'rgba(255,255,255,0.18)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 4px #0001',
                                  }}
                                  title="Edit"
                                />
                                <Button
                                  className="color-tab-icon-btn"
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined style={{ fontSize: isMobile ? 14 : 18 }} />}
                                  onClick={() => {
                                    handleDeleteColor(color, realIndex);
                                  }}
                                  style={{
                                    minWidth: isMobile ? 30 : 36,
                                    width: isMobile ? 32 : 40,
                                    height: isMobile ? 32 : 40,
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.18)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 4px #0001',
                                  }}
                                  title="Delete"
                                />
                              </div>
                            )}
                          </div>

                          {/* Name & Hex */}
                          <Title level={isMobile ? 5 : 5} style={{ margin: 0, color: semantic.colorTextBase, fontSize: isMobile ? 14 : 16 }}>
                            {color.name}
                          </Title>
                          <Text style={{ fontSize: isMobile ? 12 : 13 }}>{color.hex}</Text>
                          <Tag
                            className="color-tab-type-tag"
                            style={{
                              marginTop: 8,
                              color: color.hex,
                              width: "fit-content",
                              textAlign: "center",
                              borderRadius: 8,
                              border: `1px solid ${color.hex}`,
                              letterSpacing: 0.5,
                              display: "inline-block",
                              fontSize: isMobile ? 11 : 12,
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
            );
          })}
          {/* Palette Section: show only if colors exist */}
          {colors.length > 0 && (
            <div className="color-tab-group" style={{ marginTop: 48 }}>
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
          )}
        </div>
      )}

      <Modal
        open={deleteModalVisible}
        title={deleteTarget ? `Delete color "${deleteTarget.color.name}"?` : ""}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteTarget(null);
        }}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        destroyOnHidden
      >
        Are you sure you want to delete this color? This action cannot be undone.
      </Modal>

      <style jsx global>{`
        .color-tab-root {
          min-height: 0;
        }

        .color-tab-group {
          animation: colorGroupIn 300ms ease;
        }

        .color-tab-item {
          transition: transform 180ms ease;
        }

        .color-tab-item:hover {
          transform: translateY(-1px);
        }

        .color-tab-swatch {
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .color-tab-swatch:hover {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
        }

        .color-tab-overlay {
          animation: colorOverlayFade 180ms ease;
        }

        .color-tab-icon-btn,
        .color-tab-action {
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .color-tab-icon-btn:hover,
        .color-tab-action:hover {
          transform: translateY(-1px);
        }

        .color-tab-type-tag {
          transition: all 180ms ease;
        }

        @keyframes colorOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes colorGroupIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>


    </div>
  );
}


export default ColorTab;