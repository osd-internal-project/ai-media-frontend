import React, { useState } from "react";
import { Row, Col, Typography, Tag, Button, message, Form, Modal, theme } from "antd";
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Palette, PlusIcon } from "lucide-react";
import ColorModal from "./color-modal";
import BrandKitDetailServices from "@/app/services/brand-kit-detail.service";
import useResponsive from "@/app/hooks/useResponsive";

const { Text } = Typography;

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
  const [messageApi, contextHolder] = message.useMessage();
  const semantic = theme.useToken().token;
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
        // `as string`: CSSProperties has no type for custom properties.
        ["--ct-border" as string]: semantic.colorBorder,
        ["--ct-primary" as string]: semantic.colorPrimary,
        ["--ct-error" as string]: semantic.colorError,
        ["--ct-ink" as string]: semantic.colorTextBase,
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
          <Palette size={40} strokeWidth={1.5} aria-hidden style={{ opacity: 0.5 }} />
          <div style={{ fontSize: 16, color: semantic.colorTextBase }}>No colors yet</div>
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
                <Text style={{ color: semantic.colorTextSecondary, fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
                  {type}
                </Text>

                <Row
                  gutter={[isMobile ? 12 : 20, isMobile ? 14 : 24]}
                  style={{ marginTop: 8, marginLeft: 0, marginRight: 0 }}
                >
                  {groupColors.map((color) => {
                    // หา index จริงของสีนี้ใน colors (เพื่อให้ลบ/แก้ไขถูกต้อง)
                    const realIndex = colors.findIndex(
                      c => c.id === color.id
                    );
                    return (
                      <Col key={color.id} xs={12} sm={8} md={8} lg={6} xl={6}>
                        <div className="color-tab-item" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div
                            className="color-tab-swatch-wrap"
                            style={{ maxWidth: isMobile ? 140 : isTablet ? 170 : 200 }}
                          >
                            <button
                              type="button"
                              className="color-tab-swatch"
                              aria-label={`Copy ${color.name} ${color.hex}`}
                              onClick={() => handleCopy(color.hex)}
                              style={{ background: color.hex }}
                            />
                            {/* Overlay on hover/focus; a row under the swatch on touch screens, so it never covers the colour. */}
                            <div className="color-tab-actions">
                              <Button
                                className="color-tab-icon-btn"
                                type="text"
                                aria-label={`Copy ${color.name} hex`}
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(color.hex)}
                              />
                              <Button
                                className="color-tab-icon-btn"
                                type="text"
                                aria-label={`Edit ${color.name}`}
                                icon={<EditOutlined />}
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
                              />
                              <Button
                                className="color-tab-icon-btn"
                                danger
                                type="text"
                                aria-label={`Delete ${color.name}`}
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  handleDeleteColor(color, realIndex);
                                }}
                              />
                            </div>
                          </div>

                          <Text strong style={{ color: semantic.colorTextBase, fontSize: isMobile ? 14 : 16 }}>
                            {color.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                            {color.hex}
                          </Text>
                          {/* Ink text with a colour dot: the swatch colour itself is unreadable as text on many panels. */}
                          <Tag
                            className="color-tab-type-tag"
                            style={{
                              width: "fit-content",
                              color: semantic.colorTextSecondary,
                              borderColor: semantic.colorBorder,
                              background: "transparent",
                              fontSize: 12,
                            }}
                          >
                            <span
                              aria-hidden
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                marginRight: 6,
                                borderRadius: "50%",
                                background: color.hex,
                                verticalAlign: "middle",
                              }}
                            />
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
              <Text style={{ color: semantic.colorTextSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block" }}>
                Palette
              </Text>
              <div style={{ display: "flex", borderRadius: 14, overflow: "hidden", minHeight: 36, border: `1px solid ${semantic.colorBorder}` }}>
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
        .color-tab-swatch-wrap {
          position: relative;
          width: 100%;
        }

        .color-tab-swatch {
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          padding: 0;
          border-radius: 14px;
          border: 1px solid var(--ct-border);
          cursor: pointer;
        }

        .color-tab-swatch:focus-visible {
          outline: 2px solid var(--ct-primary);
          outline-offset: 2px;
        }

        .color-tab-actions {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.18);
          opacity: 0;
          pointer-events: none;
          transition: opacity 150ms ease;
        }

        .color-tab-swatch-wrap:hover .color-tab-actions,
        .color-tab-swatch-wrap:focus-within .color-tab-actions {
          opacity: 1;
        }

        .color-tab-actions .color-tab-icon-btn {
          pointer-events: auto;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          /* A light plate reads on any swatch colour, in either theme. */
          background: rgba(255, 255, 255, 0.92);
          color: #1e1b3a;
        }

        .color-tab-actions .color-tab-icon-btn.ant-btn-dangerous {
          color: var(--ct-error);
        }

        @media (hover: none) {
          .color-tab-actions {
            position: static;
            justify-content: flex-start;
            gap: 4px;
            margin-top: 6px;
            background: none;
            opacity: 1;
          }

          .color-tab-actions .color-tab-icon-btn {
            width: 44px;
            height: 44px;
            background: transparent;
            color: var(--ct-ink);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-tab-actions {
            transition: none;
          }
        }
`}</style>


    </div>
  );
}


export default ColorTab;