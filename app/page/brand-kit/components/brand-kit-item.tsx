import React from "react";
import { BrandKitSidebarItem } from "./brand-kit-side-bar";

interface BrandKitItemProps {
  kit: BrandKitSidebarItem;
  index: number;
  activeIndex: number;
  hoveredIndex: number | null;
  semantic: any;
  onChangeIndex: (index: number) => void;
  setHoveredIndex: (index: number | null) => void;
}

const BrandKitItem: React.FC<BrandKitItemProps> = ({
  kit,
  index,
  activeIndex,
  hoveredIndex,
  semantic,
  onChangeIndex,
  setHoveredIndex,
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

        <div style={{ minWidth: 0 }}>
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
      </div>
    </div>
  );
};

export default BrandKitItem;
