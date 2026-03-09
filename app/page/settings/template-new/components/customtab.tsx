import type { TGenerateType } from "@/app/common/prompt-guide.type";
import { Button } from "antd";
import { useTransition, type CSSProperties, type FC } from "react";
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

    return {
      borderRadius: 999,
      border: "none",
      background: isLightMode
        ? isActive
          ? semantic.colorBgContainer
          : "transparent"
        : isActive
          ? semantic.colorBgTextActive
          : "transparent",
      color: isLightMode ? "#000000" : isActive ? "#ffffff" : semantic.colorTextSecondary,
      fontWeight: 500,
      boxShadow: "none",
      transition: "background-color 220ms ease, color 220ms ease, transform 160ms ease",
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
