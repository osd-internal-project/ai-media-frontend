import React from "react";
import { Modal } from "antd";
import { BrandKitSidebarItem } from "./brand-kit-side-bar";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface BrandKitItemProps {
  kit: BrandKitSidebarItem;
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
  return (
    <div
      key={index}
      onClick={() => onChangeIndex(index)}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
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
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 2,
          }}
        >
          {kit.colors.slice(0, 3).map((c, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: c.hex,
                border: `1px solid ${semantic.colorBorder}`,
              }}
            />
          ))}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: semantic.colorTextBase, fontSize: 14 }}>{kit.name}</div>

          <div
            style={{
              color: semantic.colorTextSecondary,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {kit.industry}
          </div>

          <div
            style={{
              color: semantic.colorTextSecondary,
              opacity: 0.8,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {kit.colorCount} colors · {kit.fonts} fonts
          </div>
        </div>

        {/* Edit/Delete buttons (show only on hover, vertical, top-right) */}
        {hoveredIndex === index && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "center",
           
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "4px 6px"
            }}
            onClick={e => e.stopPropagation()}
          >
            <EditOutlined
              style={{ color: semantic.colorTextSecondary, fontSize: 16, cursor: "pointer" }}
              title="Edit"
              onClick={e => {
                e.stopPropagation();
                onEdit && onEdit();
              }}
            />
            <DeleteOutlined
              style={{ color: semantic.colorError, fontSize: 16, cursor: "pointer" }}
              title="Delete"
              onClick={e => {
                e.stopPropagation();
                if (onDelete) {
                  Modal.confirm({
                    title: 'Delete Brand Kit',
                    content: `Are you sure you want to delete "${kit.name}"? This action cannot be undone.`,
                    okText: 'Delete',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    onOk: onDelete,
                  });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandKitItem;
