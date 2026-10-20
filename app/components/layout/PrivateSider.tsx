import React from "react";
import { Layout, Menu, Image as AntdImage, Button } from "antd";
import { MenuFoldOutlined } from "@ant-design/icons";
import { MenuSider, renderMenuItems } from "@/app/config/menu";
import { useThemeMode } from "../ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";
import "./LayoutStyle.css";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const { Sider } = Layout;

interface PrivateSiderProps {
  organizationId: string;
  mappedPath: string;
  currentPathSub: string;
  organizationRole: string;
  systemRole?: string;
  accessCodes?: string[];
  onClose?: () => void;
}

const PrivateSider: React.FC<PrivateSiderProps> = ({
  organizationId,
  mappedPath,
  currentPathSub,
  organizationRole,
  systemRole,
  accessCodes,
  onClose,
}) => {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();
  const isSuperAdmin = systemRole === "SUPER_ADMIN";
  const showMobileCloseButton = (isMobile || isTablet) && !!onClose;
  const adminHref = "/page/admin-management";
  const adminMenuItems = [
    {
      key: "admin-management",
      style: { height: "auto", padding: 0 },
      label: (
        <Link
          href={adminHref}
          onClick={onClose}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            lineHeight: "normal",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="menu-icon-container"
          >
            <ShieldCheck />
          </div>
          <div className="text-center menu-text-label text-[12px]">Admin</div>
        </Link>
      ),
    },
  ];

  return (
    <Sider
      className="private-sider-shell"
      width={92}
      trigger={null}
      collapsible
      collapsed={false}
      style={{
        borderRight: `1px solid ${semantic.colorBorder}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "0 10px",
        position: "relative",
        transition: "background 0.2s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Logo */}
      <div
        className="private-sider-logo"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px 0",
          flexShrink: 0,
        }}
      >
        <AntdImage
          src="/images/logo-1.png"
          alt="OSD Logo"
          preview={false}
          width={42}
          style={{ background: "transparent" }}
        />
      </div>

      {/* Menu */}
      {organizationId && (
        <div
          className="private-sider-menu-scroll"
          data-tour="sider-menu"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom:
              isMobile || isTablet
                ? isSuperAdmin && showMobileCloseButton
                  ? 132
                  : isSuperAdmin || showMobileCloseButton
                    ? 72
                    : 0
                : 0,
          }}
        >
          <Menu
            selectedKeys={[mappedPath, `${mappedPath}/${currentPathSub}`]}
            defaultSelectedKeys={[
              mappedPath,
              `${mappedPath}/${currentPathSub}`,
            ]}
            items={renderMenuItems(MenuSider, organizationRole, systemRole, accessCodes)}
            className="osd-menu-padding"
          /> 
        </div>
      )}

      {isSuperAdmin ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            padding: showMobileCloseButton ? "12px 0 16px" : "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            background: semantic.colorBgContainer,
            borderTop: `1px solid ${semantic.colorBorder}`,
          }}
        >
          <Menu
            selectedKeys={[mappedPath, `${mappedPath}/${currentPathSub}`]}
            items={adminMenuItems}
            className="osd-menu-padding"
            style={{ width: "100%" }}
          />

          {showMobileCloseButton ? (
            <Button
              className="private-sider-close-btn"
              type="text"
              onClick={onClose}
              icon={
                <MenuFoldOutlined style={{ color: semantic.colorTextBase }} />
              }
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
          ) : null}
        </div>
      ) : null}

      {!isSuperAdmin && showMobileCloseButton ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            background: semantic.colorBgContainer,
          }}
        >
          <Button
            className="private-sider-close-btn"
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
