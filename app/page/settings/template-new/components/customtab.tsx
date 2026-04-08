import type { TGenerateType } from "@/app/common/prompt-guide.type";
import { Button } from "antd";
import { useState, useTransition, type CSSProperties, type FC } from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

type TabKey = TGenerateType | "all";

interface CustomTabProps {
  value: TabKey;
  onChange: (value: TabKey) => void;
}

const tabItems: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "omnihumen", label: "OmniHuman" },
  { key: "dreamactor", label: "DreamActor" },
];

const CustomTab: FC<CustomTabProps> = ({ value, onChange }) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const isLightMode = mode === "light";
  const [, startTransition] = useTransition();
  const [hoveredKey, setHoveredKey] = useState<TabKey | null>(null);

  const containerStyle: CSSProperties = {
    background: isLightMode ? semantic.colorBgTextActive : semantic.colorBgContainer,
    borderRadius: 50,
    padding: 4,
    display: "flex",
    gap: 6,
    flexWrap: "nowrap",
    overflowX: "auto",
    maxWidth: "100%",
    scrollbarWidth: "none",
  };

  const getTabButtonStyle = (key: TabKey): CSSProperties => {
    const isActive = value === key;
    const isHovered = hoveredKey === key;

    return {
      borderRadius: 999,
      border: "none",
      background: isLightMode
        ? isActive
          ? semantic.colorBgContainer
          : isHovered
            ? semantic.colorFillAlter
            : "transparent"
        : isActive
          ? semantic.colorBgTextActive
          : isHovered
            ? semantic.colorBgElevated
            : "transparent",
      color: isLightMode
        ? isActive || isHovered
          ? semantic.colorTextBase
          : semantic.colorTextSecondary
        : isActive
          ? "#ffffff"
          : isHovered
            ? semantic.colorTextBase
            : semantic.colorTextSecondary,
      fontWeight: 500,
      boxShadow: "none",
      transition: "background-color 180ms ease, color 180ms ease, transform 140ms ease",
      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
      willChange: "background-color, color",
    };
  };

  return (
    <div style={containerStyle}>
      {tabItems.map((tab) => (
        <Button
          key={tab.key}
          type="text"
          style={getTabButtonStyle(tab.key)}
          onMouseEnter={() => setHoveredKey(tab.key)}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => {
            startTransition(() => {
              onChange(tab.key);
            });
          }}
          className="shrink-0"
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default CustomTab;
