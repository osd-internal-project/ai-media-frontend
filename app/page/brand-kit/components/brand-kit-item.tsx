import React, { useState, useRef } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import { Modal, Tag } from "antd";
import { BrandKitSidebarItem } from "./brand-kit-side-bar";
import { EditOutlined, DeleteOutlined, StarFilled } from "@ant-design/icons";

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
  const deleteTriggeredRef = useRef(false);
  // Swipe-to-delete state
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragThreshold = 60; // px to reveal delete
  const maxSwipe = -80;
  const showEditDelete = isMobile || hoveredIndex === index;
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
    <div style={{ position: "relative", minHeight: isMobile ? 82 : 94, marginBottom: isMobile ? 6 : 10 }}>
      {/* Swipe-to-delete background (mobile only, only show when swiped) */}
      {isMobile && dragX < 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: semantic.colorError,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            zIndex: 1,
            transition: dragging ? "none" : "background 0.2s",
            overflow: "hidden",
            paddingRight: 18,
            pointerEvents: dragX <= maxSwipe + 10 ? "auto" : "none",
          }}
        >
          <DeleteOutlined
            style={{ color: "#fff", fontSize: 28, cursor: "pointer", opacity: Math.min(1, Math.abs(dragX) / 40) }}
            title="Delete"
          />
        </div>
      )}
      <div
        onClick={() => onChangeIndex(index)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: isMobile ? 12 : 10,
          padding: isMobile ? 8 : 14,
          borderRadius: isMobile ? 10 : 14,
          cursor: "pointer",
          background:
            activeIndex === index
              ? semantic.colorBgTextActive
              : hoveredIndex === index
              ? semantic.colorPrimaryBg
              : "transparent",
          border: `1px solid ${activeIndex === index ? semantic.colorPrimary : "transparent"}`,
          transition: dragging ? "none" : "all 0.2s",
          position: "relative",
          minHeight: 82 ,
          overflow: isMobile ? "visible" : undefined,
          touchAction: isMobile ? "pan-y" : undefined,
          zIndex: 2,
          transform: isMobile ? `translateX(${dragX}px)` : undefined,
          maxWidth: isMobile ? `calc(100% - ${Math.abs(dragX)}px)` : undefined,
          minWidth: 0,
          userSelect: dragging ? "none" : undefined,
        }}
        {...(isMobile
          ? {
              onTouchStart: (e) => {
                dragStartX.current = e.touches[0].clientX;
                setDragging(true);
                deleteTriggeredRef.current = false;
              },
              onTouchMove: (e) => {
                if (!dragging) return;
                const delta = e.touches[0].clientX - dragStartX.current;
                // Clamp between maxSwipe and 0
                const newX = Math.max(Math.min(delta, 0), maxSwipe);
                setDragX(newX);
                // If dragged past threshold, trigger modal (only once per drag)
                if (newX <= maxSwipe + 10 && !deleteTriggeredRef.current) {
                  deleteTriggeredRef.current = true;
                  setShowDeleteModal(true);
                }
              },
              onTouchEnd: () => {
                setDragging(false);
                if (!showDeleteModal) {
                  setDragX(0);
                  deleteTriggeredRef.current = false;
                }
              },
              onTouchCancel: () => {
                setDragging(false);
                setDragX(0);
                deleteTriggeredRef.current = false;
              },
            }
          : {})}
      >
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
                  width:  16 ,
                  height: 16 ,
                  borderRadius: "50%",
                  background: c && c.hex ? c.hex : "transparent",
                  border: `1px solid ${semantic.colorBorder}`,
                  boxSizing: "border-box",
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
            paddingRight: isMobile ? 44 : 76,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              rowGap: 6,
              gap: 6,
              minWidth: 0,
              marginBottom: isMobile ? 1 : 0,
            }}
          >
            <div
              style={{
                color: semantic.colorTextBase,
                fontSize: isMobile ? 13 : 14,
                fontWeight: isMobile ? 500 : 400,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
            {!isMobile && kit.isDefault && (
          <StarFilled style={{ color: "#f59e0b" }} />
            )}  {kit.name}
            </div>
            {isMobile && kit.isDefault && (
              <Tag
                icon={<StarFilled style={{ color: "#f59e0b" }} />}
                style={{
                  marginInlineEnd: 0,
                  borderRadius: 999,
                  border: `1px solid ${semantic.colorWarningBorder || "#fbbf24"}`,
                  background: semantic.colorWarningBg || "rgba(245,158,11,0.12)",
                  color: semantic.colorWarning || "#f59e0b",
                  fontSize: isMobile ? 10 : 11,
                  lineHeight: 1,
                  padding: isMobile ? "2px 6px" : "3px 7px",
                }}
              >
                Default
              </Tag>
            )}
          </div>

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
         
        {/* Edit/Delete buttons: always show on mobile, hover on desktop */}
        <>
          <div
            style={{
              position: "absolute",
              // top: isMobile ? 8 : 8,
              right: isMobile ? 8 : 10,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 16 : 10,
              alignItems: "flex-end",
              borderRadius: 8,
              boxShadow: isMobile ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
              padding: isMobile ? "6px 8px" : "4px 0",
              background: "transparent",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 16,
                opacity: showEditDelete ? 1 : 0,
                pointerEvents: showEditDelete ? "auto" : "none",
                transition: "opacity 0.18s ease",
              }}
            >
              <EditOutlined
                style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 18 : 16, cursor: "pointer" }}
                title="Edit"
                onClick={e => {
                  e.stopPropagation();
                  onEdit && onEdit();
                }}
              />
              <DeleteOutlined
                style={{ color: semantic.colorError, fontSize: isMobile ? 18 : 16, cursor: "pointer" }}
                title="Delete"
                onClick={e => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
              />
            </div>
          
          </div>
            <Modal
              zIndex={1500}
              open={showDeleteModal}
              title="Delete Brand Kit"
              okText="Delete"
              okType="danger"
              cancelText="Cancel"
              onOk={() => {
                setShowDeleteModal(false);
                setDragX(0);
                deleteTriggeredRef.current = false;
                if (onDelete) onDelete();
              }}
              onCancel={() => {
                setShowDeleteModal(false);
                setDragX(0);
                deleteTriggeredRef.current = false;
              }}
              afterClose={() => {
                setShowDeleteModal(false);
                setDragX(0);
                deleteTriggeredRef.current = false;
              }}
            >
              Are you sure you want to delete "{kit.name}"? This action cannot be undone.
            </Modal>
        </>
      </div>
    </div>
  );
};

export default BrandKitItem;
