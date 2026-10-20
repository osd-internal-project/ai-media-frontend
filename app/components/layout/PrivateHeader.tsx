"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Dropdown,
  Layout,
  Menu,
  Progress,
  Space,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  CreditCardOutlined,
  DownOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { ICreditBalance, IOrganization } from "@/app/common/organization.type";
import useResponsive from "@/app/hooks/useResponsive";
import { formatCompactNumber } from "@/app/utils/format";
import { canSeeBilling } from "@/app/utils/permissions";
import ThemeToggleButton from "../ThemeToggleButton";
import InvitationBell from "./InvitationBell";
import { useThemeMode } from "../ThemeProvider";
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
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();

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

    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  const dropdownPanelStyle: CSSProperties = {
    background: semantic.colorBgElevated ?? semantic.colorBgContainer,
    borderRadius: 8,
    boxShadow:
      "0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)",
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
        height: isMobile ? 54 : isTablet ? 58 : 62,
        borderBottom: `1px solid ${semantic.colorBorder}`,
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
            style={{
              padding: isMobile ? "0 2px" : isTablet ? "0 10px" : "0 16px",
              minWidth: isMobile ? 40 : undefined,
              height: isMobile ? 40 : isTablet ? 44 : 50,
              display: "flex",
              alignItems: "center",
              borderRadius: 10,
            }}
          >
            <Space size={isMobile ? 6 : isTablet ? 8 : 12} align="center">
              <Avatar
                size={isMobile ? 28 : 32}
                icon={<HomeOutlined />}
                style={{
                  backgroundColor: semantic.colorBgTextActive,
                  color: semantic.colorPrimary,
                }}
              />
              {!isMobile ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      lineHeight: 1.2,
                      maxWidth: 220,
                    }}
                  >
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        color: semantic.colorTextSecondary,
                      }}
                    >
                      ORGANIZATION
                    </Typography.Text>
                    <Typography.Text
                      strong
                      style={{ color: semantic.colorTextBase }}
                    >
                      {activeOrg?.name}
                    </Typography.Text>
                  </div>
                  <DownOutlined
                    style={{ fontSize: 14, color: semantic.colorTextSecondary }}
                  />
                </>
              ) : null}
            </Space>
          </Button>
        </Dropdown>
      </Space>

      <Space size={isMobile ? 6 : isTablet ? 10 : 14} align="center">
        {showBilling ? (
          <Link href="/page/plans">
            <Button type="primary" ghost  style={{ borderColor: "#6C6AC4", color: "#6C6AC4" }}>
              Change Package
            </Button>
          </Link>
        ) : null}
        {showBilling ? (
        <Card
          hoverable
          className="private-header-balance-card"
          styles={{
            body: {
              padding: isMobile ? "2px 6px" : isTablet ? "3px 8px" : "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 6 : 8,
            },
          }}
          style={{
            borderRadius: 10,
            borderColor: semantic.colorBorder,
            boxShadow: "none",
            minWidth: isMobile ? 78 : isTablet ? 136 : 180,
            maxWidth: 240,
            background: semantic.colorBgContainer,
          }}
        >
          <Space align="center" size={isMobile ? 4 : 6}>
            <CreditCardOutlined style={{ color: semantic.colorTextBase }} />
            <Text
              style={{
                color: semantic.colorTextBase,
                fontSize: isMobile ? 11 : 13,
              }}
            >
              {formatCompactNumber(creditBalance?.currentCycleBalance)}+{" "}
              {formatCompactNumber(creditBalance?.onTopBalance)}
            </Text>
            {!isMobile && !isTablet ? (
              <>
                <Divider
                  type="vertical"
                  style={{ height: 24, borderColor: semantic.colorBorder }}
                />
                <Progress
                  percent={tokenPercentage}
                  showInfo={false}
                  strokeColor={semantic.colorPrimary}
                  trailColor={semantic.colorPrimaryBg}
                  size="small"
                  style={{ width: 100, marginBottom: 0 }}
                />
              </>
            ) : null}
          </Space>
        </Card>
        ) : null}

        <div className="private-header-action-wrap">
          <InvitationBell />
        </div>

        <div className="private-header-action-wrap">
          <ThemeToggleButton />
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
                style={{ backgroundColor: semantic.colorPrimary }}
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
