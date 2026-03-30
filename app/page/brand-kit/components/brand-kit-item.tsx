import React, { useState } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import { Modal } from "antd";
import { BrandKitSidebarItem } from "./brand-kit-side-bar";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface BrandKitItemProps {
  kit: BrandKitSidebarItem & {
    colors?: { hex: string }[];
    colorCount?: number;
    fonts?: number;
  };
  index: number;
  activeIndex: number;
  hoveredIndex: number | null;
  semantic: any;
  onChangeIndex: (index: number) => void;
  setHoveredIndex: (index: number | null) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const BrandKitItem: React.FC<BrandKitItemProps> = ({
  kit,
  index,
  activeIndex,
  hoveredIndex,
  semantic,
  onChangeIndex,
  setHoveredIndex,
  onEdit,
  onDelete,
}) => {
  const { isMobile } = useResponsive();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Debug log for rendering
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[BrandKitItem]', {
      index,
      kit,
      activeIndex,
      hoveredIndex,
      isActive: activeIndex === index,
      isHovered: hoveredIndex === index,
    });
  }
  return (
    <div
      onClick={() => onChangeIndex(index)}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{
        padding: isMobile ? 8 : 14,
        borderRadius: isMobile ? 10 : 14,
        marginBottom: isMobile ? 6 : 10,
        cursor: "pointer",
        background:
          activeIndex === index
            ? semantic.colorBgTextActive
            : hoveredIndex === index
            ? semantic.colorPrimaryBg
            : "transparent",
        border: `1px solid ${activeIndex === index ? semantic.colorPrimary : "transparent"}`,
        transition: "all 0.2s",
        position: "relative",
        minHeight: isMobile ? 44 : 0,
      }}
    >
      <div style={{ display: "flex", gap: isMobile ? 8 : 12, alignItems: isMobile ? "center" : "flex-start" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3 ,
            marginTop: isMobile ? 0 : 2,
          }}
        >
          {[0, 1, 2].map((i) => {
            const c = (kit.colors || [])[i];
            return (
              <div
                key={i}
                style={{
                  width: isMobile ? 8 : 14,
                  height: isMobile ? 8 : 14,
                  borderRadius: "50%",
                  background: c && c.hex ? c.hex : "transparent",
                  border: `1px solid ${semantic.colorBorder}`,
                  boxSizing: "border-box",
                }}
              />
            );
          })}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: semantic.colorTextBase, fontSize: isMobile ? 13 : 14, fontWeight: isMobile ? 500 : 400 }}>{kit.name}</div>

          <div
            style={{
              color: semantic.colorTextSecondary,
              fontSize: isMobile ? 10 : 12,
              marginTop: isMobile ? 1 : 2,
            }}
          >
            {kit.industry}
          </div>

          <div
            style={{
              color: semantic.colorTextSecondary,
              opacity: 0.8,
              fontSize: isMobile ? 10 : 12,
              marginTop: isMobile ? 2 : 4,
            }}
          >
            {(kit.colorCount ?? 0)} colors · {(kit.fonts ?? 0)} fonts
          </div>
        </div>

        {/* Edit/Delete buttons (show only on hover, vertical, top-right) */}
        {hoveredIndex === index && (
          <>
            <div
              style={{
                position: "absolute",
                top: isMobile ? 4 : 8,
                right: isMobile ? 4 : 10,
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 4 : 8,
                alignItems: "center",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                padding: isMobile ? "2px 3px" : "4px 6px"
              }}
              onClick={e => e.stopPropagation()}
            >
              <EditOutlined
                style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 13 : 16, cursor: "pointer" }}
                title="Edit"
                onClick={e => {
                  e.stopPropagation();
                  onEdit && onEdit();
                }}
              />
              <DeleteOutlined
                style={{ color: semantic.colorError, fontSize: isMobile ? 13 : 16, cursor: "pointer" }}
                title="Delete"
                onClick={e => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
              />
            </div>
            <Modal
              open={showDeleteModal}
              title="Delete Brand Kit"
              okText="Delete"
              okType="danger"
              cancelText="Cancel"
              onOk={() => {
                setShowDeleteModal(false);
                onDelete && onDelete();
              }}
              onCancel={() => setShowDeleteModal(false)}
              afterClose={() => setShowDeleteModal(false)}
            >
              Are you sure you want to delete "{kit.name}"? This action cannot be undone.
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandKitItem;
