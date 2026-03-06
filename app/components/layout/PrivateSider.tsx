import React, { useMemo } from "react";
import { Layout, Menu, theme, Image as AntdImage, Button } from "antd";
import { MenuFoldOutlined } from "@ant-design/icons";
import { MenuSider, renderMenuItems } from "@/app/config/menu";
import { useThemeMode } from "../ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";
import "./Sider.css";

const { Sider } = Layout;

interface PrivateSiderProps {
  organizationId: string;
  mappedPath: string;
  currentPathSub: string;
  organizationRole: string;
  onClose?: () => void;
}

const PrivateSider: React.FC<PrivateSiderProps> = ({
  organizationId,
  mappedPath,
  currentPathSub,
  organizationRole,
  onClose,
}) => {

  const { token } = theme.useToken();

  const selectedKeys = useMemo(() => {
    return [`${mappedPath}/${currentPathSub}`];
  }, [mappedPath, currentPathSub]);

    const { mode } = useThemeMode();
    const semantic = getThemeConfig(mode).token ?? {};
    const { isMobile } = useResponsive();

  return (
    <Sider
      width={100}
      trigger={null}
      collapsible
      collapsed={false}
      style={{
        borderRight: `1px solid ${semantic.colorBorder}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "0 12px",
        position: "relative",
        transition: "background 0.2s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Logo */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0", flexShrink: 0 }}>
        <AntdImage
          src="/images/logo-1.png"
          alt="OSD Logo"
          preview={false}
          width={48}
          style={{ background: "transparent" }}
        />
      </div>

      {/* Menu */}
      {organizationId && (
        <Menu
          selectedKeys={[
            mappedPath,
            `${mappedPath}/${currentPathSub}`,
          ]}
          defaultSelectedKeys={[
            mappedPath,
            `${mappedPath}/${currentPathSub}`,
          ]}
          items={renderMenuItems(MenuSider, organizationRole)}
          className="osd-menu-padding"
          style={{ paddingBottom: isMobile && onClose ? 72 : 0 }}
        />
      )}

      {isMobile && onClose ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            padding: "12px 0 16px",
            display: "flex",
            justifyContent: "center",
            background: semantic.colorBgContainer,
          }}
        >
          <Button
            type="text"
            onClick={onClose}
            icon={<MenuFoldOutlined style={{ color: semantic.colorTextBase }} />}
            style={{
              width: 36,
              height: 36,
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${semantic.colorBorder}`,
              borderRadius: 8,
            }}
          />
        </div>
      ) : null}
    </Sider>
  );
};

export default PrivateSider;