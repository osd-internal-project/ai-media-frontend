import { Button } from "antd";
import { useTransition, type CSSProperties, type FC } from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

type DashboardTabKey = "overview" | "users" | "projects" | "analytics" | "approvals";

type DashboardCustomTabProps = {
  value: DashboardTabKey;
  onChange: (value: DashboardTabKey) => void;
  usersTotal: number;
  projectsTotal: number;
  approvalsTotal: number;
};

const DashboardCustomTab: FC<DashboardCustomTabProps> = ({
  value,
  onChange,
  usersTotal,
  projectsTotal,
  approvalsTotal,
}) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const isLightMode = mode === "light";
  const [, startTransition] = useTransition();

  const tabItems: Array<{ key: DashboardTabKey; label: string; total?: number }> = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users", total: usersTotal },
    { key: "projects", label: "Projects", total: projectsTotal },
    { key: "analytics", label: "Analytics" },
    // { key: "approvals", label: "Approvals", total: approvalsTotal },
  ];

  const containerStyle: CSSProperties = {
    background: isLightMode ? semantic.colorBgTextActive : semantic.colorBgContainer,
    borderRadius: 50,
    padding: 4,
    display: "inline-flex",
    width: "fit-content",
    gap: 6,
    flexWrap: "nowrap",
    overflowX: "auto",
    scrollbarWidth: "none",
  };

  const getTabButtonStyle = (key: DashboardTabKey): CSSProperties => {
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
      color: isLightMode
        ? "#000000"
        : isActive
          ? "#ffffff"
          : semantic.colorTextSecondary,
      fontWeight: 500,
      boxShadow: "none",
      transition: "background-color 220ms ease, color 220ms ease, transform 160ms ease",
      willChange: "background-color, color",
    };
  };

  const getChipStyle = (isActive: boolean): CSSProperties => ({
    borderRadius: 999,
    fontSize: 11,
    lineHeight: "16px",
    padding: "0 8px",
    background: isActive
      ? isLightMode
        ? semantic.colorPrimaryBg
        : semantic.colorBgContainer
      : semantic.colorFillSecondary,
    color: isActive
      ? isLightMode
        ? semantic.colorPrimary
        : semantic.colorText
      : semantic.colorTextSecondary,
  });

  return (
    <div style={containerStyle}>
      {tabItems.map((tab) => (
        (() => {
          const isActive = value === tab.key;
          return (
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
          <span className="inline-flex items-center gap-1.5">
            <span>{tab.label}</span>
            {typeof tab.total === "number" && (
              <span style={getChipStyle(isActive)}>{tab.total}</span>
            )}
          </span>
        </Button>
          );
        })()
      ))}
    </div>
  );
};

export default DashboardCustomTab;
