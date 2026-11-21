"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Layout,
  Menu,
  Progress,
  Space,
  Tooltip,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  CreditCardOutlined,
  DownOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  MenuOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import config from "@/app/config";
import CommunityPill from "../CommunityPill";
import { useRouter } from "next/navigation";
import { logout } from "@/app/lib/logout";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { ICreditBalance, IOrganization } from "@/app/common/organization.type";
import useResponsive from "@/app/hooks/useResponsive";
import { formatCompactNumber } from "@/app/utils/format";
import { canSeeBilling } from "@/app/utils/permissions";
import ThemeToggleButton from "../ThemeToggleButton";
import InvitationBell from "./InvitationBell";
import { useThemeMode } from "../ThemeProvider";
import { canvasBg, overlayShadow } from "@/app/theme/surface";
import { usePageHeader } from "@/app/context/PageHeaderContext";
import "./LayoutStyle.css";
import { User ,Users} from "lucide-react";
import Link from "next/link";

const { Text } = Typography;
const { Header } = Layout;

interface HeaderProps {
  user?: { fullname: string };
  organizationId?: string;
  // personalOrganizations: IOrganization[];
  teamOrganizations: IOrganization[];
  handleOrganizationChange: (value: string) => void;
  handleOpenCreateOrg: () => void;
  handleManageOrg: () => void;
  organizationRole?: string;
  currentOrganization: IOrganization | undefined;
  systemRole?: string;
  onToggleSider?: () => void;
  creditBalance?: ICreditBalance;
  handleOpenCouponModal: () => void;
}

export function PrivateHeader({
  user,
  organizationId,
  // personalOrganizations,
  teamOrganizations,
  handleOrganizationChange,
  handleOpenCreateOrg,
  handleManageOrg,
  currentOrganization,
  systemRole,
  onToggleSider,
  creditBalance,
  handleOpenCouponModal,
}: HeaderProps) {
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();
  const { pageHeader } = usePageHeader();

  const [orgOpen, setOrgOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const showBilling = canSeeBilling(systemRole);

  // const allOrganizations = [
  //   // ...(personalOrganizations || []),
  //   ...(teamOrganizations || []),
  // ];
  const activeOrg = teamOrganizations.find(
    (o) => o.organizationId === organizationId,
  );

  const tokenUsage = currentOrganization?.remainTokenAmount ?? 0;
  const tokenLimit = currentOrganization?.packageTokenAmount ?? 0;
  const tokenPercentage = tokenLimit > 0 ? (tokenUsage / tokenLimit) * 100 : 0;

  const orgListItems: MenuProps["items"] = teamOrganizations.map((org) => ({
    key: org.organizationId,
    onClick: () => {
      handleOrganizationChange(org.organizationId);
      setOrgOpen(false);
    },
    label: (
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Text strong={org.organizationId === organizationId}>{org.name}</Text>
        {org.type === "personal" ? (
          <User size={12} color="#7775e6" strokeWidth={2} />
        ) : (
          <Users size={12} color="#75e691" strokeWidth={2}/>
        )}
      </Space>
    ),
  }));

  const orgActionItems: MenuProps["items"] = [
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Organization Settings",
      onClick: () => {
        handleManageOrg();
        setOrgOpen(false);
      },
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/page/profile"),
    },
    // {
    //   key: "coupon",
    //   icon: <CreditCardOutlined />,
    //   label: "Use Coupon",
    //   onClick: handleOpenCouponModal,
    // },

    // Phones: the bar has no room, so these live in the avatar menu.
    ...(isMobile
      ? [{
          key: "community",
          icon: <TeamOutlined />,
          label: (
            <a href={config.communityUrl} target="_blank" rel="noopener noreferrer">
              Community
            </a>
          ),
        }]
      : []),
    ...(isMobile && showBilling
      ? [{ key: "plans", icon: <CreditCardOutlined />, label: "Change Package", onClick: () => router.push("/page/plans") }]
      : []),
    ...(isMobile
      ? [{ key: "theme", icon: mode === "dark" ? <SunOutlined /> : <MoonOutlined />, label: mode === "dark" ? "Light mode" : "Dark mode", onClick: toggleMode }]
      : []),
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      onClick: () => logout(),
    },
  ];

  const dropdownPanelStyle: CSSProperties = {
    background: semantic.colorBgElevated ?? semantic.colorBgContainer,
    borderRadius: 8,
    boxShadow: overlayShadow(mode),
    maxHeight: 500,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 200,
  };

  const dropdownMenuStyle: CSSProperties = {
    boxShadow: "none",
    border: "none",
    backgroundColor: "transparent",
  };

  return (
    <Header
      className="private-header-shell"
      style={{
        height: isMobile ? 50 : 52,
        // antd's Header sets line-height 64px, which made every item taller than this 52px bar.
        lineHeight: "normal",
        // Same as the page canvas so the work panels, not the chrome, read as the front layer.
        background: canvasBg(mode),
        borderBottom: `1px solid ${semantic.colorBorderSecondary ?? semantic.colorBorder}`,
        padding: isMobile ? "0 8px" : isTablet ? "0 14px" : "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Space size={isMobile ? 6 : isTablet ? 8 : 10} align="center">
        {isMobile || isTablet ? (
          <Button
            className="private-header-icon-btn"
            type="text"
            onClick={onToggleSider}
            style={{
              width: isMobile ? 32 : 36,
              height: isMobile ? 32 : 36,
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
            }}
            icon={<MenuOutlined style={{ color: semantic.colorTextBase }} />}
          />
        ) : null}

        <Dropdown
          open={orgOpen}
          onOpenChange={setOrgOpen}
          trigger={["click"]}
          popupRender={() => (
            <div style={dropdownPanelStyle}>
              <div
                className="private-header-dropdown-scroll"
                style={{ overflowY: "auto", flex: 1 }}
              >
                <Menu
                  selectable={false}
                  items={orgListItems}
                  style={dropdownMenuStyle}
                />
              </div>
              <Divider style={{ margin: 0 }} />
              <div style={{ flexShrink: 0 }}>
                <Menu
                  selectable={false}
                  items={orgActionItems}
                  style={dropdownMenuStyle}
                />
              </div>
            </div>
          )}
        >
          <Button
            type="text"
            className="private-header-org-btn"
            data-tour="org-switcher"
            aria-label={`Organization: ${activeOrg?.name ?? ""}`}
            style={{
              padding: isMobile ? "0 4px" : "0 8px",
              height: 32,
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 8,
              // Fill + border + chevron: the switcher reads as a button before hover; the project beside it is a plain label.
              background: semantic.colorBgTextActive,
              border: `1px solid ${semantic.colorBorder}`,
            }}
          >
            {/* Org initial as a quiet mark; the org is context, the open project is the focus. */}
            <span
              aria-hidden
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                background: semantic.colorBgTextActive,
                color: semantic.colorTextBase,
              }}
            >
              {(activeOrg?.name ?? "?").trim().charAt(0).toUpperCase()}
            </span>
            {!isMobile ? (
              <>
                <Typography.Text
                  ellipsis
                  style={{
                    display: "inline-block",
                    lineHeight: "20px",
                    verticalAlign: "middle",
                    maxWidth: 200,
                    fontSize: 13,
                    fontWeight: 500,
                    color: semantic.colorTextBase,
                  }}
                >
                  {activeOrg?.name}
                </Typography.Text>
                <DownOutlined style={{ fontSize: 10, marginInlineStart: 2, color: semantic.colorTextSecondary }} />
              </>
            ) : null}
          </Button>
        </Dropdown>

        {pageHeader && !isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span aria-hidden style={{ fontSize: 16, color: semantic.colorTextQuaternary ?? semantic.colorTextSecondary }}>
              /
            </span>
            <Tooltip title={pageHeader.subtitle}>
              <Typography.Text
                ellipsis
                style={{
                  display: "block",
                  lineHeight: "20px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: semantic.colorTextBase,
                  maxWidth: isTablet ? 180 : 320,
                }}
              >
                {pageHeader.name}
              </Typography.Text>
            </Tooltip>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: semantic.colorTextSecondary }}>
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background:
                    pageHeader.status === "Deleted" ? semantic.colorError : semantic.colorSuccess,
                }}
              />
              {pageHeader.status}
            </span>
          </div>
        ) : null}
      </Space>

      <Space size={isMobile ? 6 : isTablet ? 10 : 14} align="center">
        {isMobile ? null : <CommunityPill label="Community" newTabLabel="(opens in a new tab)" size="xs" quiet />}
        {showBilling && !isMobile ? (
          <Link href="/page/plans">
            <Button style={{ height: 32, paddingInline: isMobile ? 8 : 12, fontSize: isMobile ? 12 : 13 }}>
              Change Package
            </Button>
          </Link>
        ) : null}
        {showBilling ? (
          <div
            style={{
              height: 32,
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingInline: isMobile ? 8 : 10,
              borderRadius: 8,
              border: `1px solid ${semantic.colorBorder}`,
              whiteSpace: "nowrap",
            }}
          >
            <CreditCardOutlined style={{ color: semantic.colorTextSecondary }} />
            <Text
              style={{
                color: semantic.colorTextBase,
                fontSize: isMobile ? 12 : 13,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatCompactNumber(creditBalance?.currentCycleBalance)} +{" "}
              {formatCompactNumber(creditBalance?.onTopBalance)}
            </Text>
            {!isMobile && !isTablet ? (
              <Progress
                percent={tokenPercentage}
                showInfo={false}
                // Cyan marks what remains; indigo stays reserved for actions.
                strokeColor={semantic.colorInfoText ?? semantic.colorInfo}
                // Dark mode has no colorFillSecondary; a purple fallback made an empty bar look full.
                trailColor={semantic.colorFillSecondary ?? semantic.colorBorder}
                size="small"
                style={{ width: 64, marginBottom: 0, lineHeight: 0 }}
              />
            ) : null}
          </div>
        ) : null}

        <div className="private-header-action-wrap">
          <InvitationBell />
        </div>

        <div className="private-header-action-wrap">
          {isMobile ? null : <ThemeToggleButton />}
        </div>

        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Button
            type="text"
            className="private-header-user-btn"
            style={{
              padding: isMobile ? "0 2px" : undefined,
              borderRadius: 10,
              height: isMobile ? 40 : 44,
            }}
          >
            <Space size={isMobile ? 6 : 8}>
              <Avatar
                size={isMobile ? 30 : 32}
                style={{ backgroundColor: semantic.colorPrimary, fontWeight: 500 }}
              >
                {user?.fullname
                  ? user.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : ""}
              </Avatar>
              {!(isMobile || isTablet) ? user?.fullname : null}
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
}
