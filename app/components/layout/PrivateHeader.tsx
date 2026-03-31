"use client";

import {
  Button,
  Dropdown,
  Avatar,
  Progress,
  Space,
  Typography,
  Divider,
  Card,
  Layout,
  Modal,
  Form,
  Input,
  message,
} from "antd";

import {
  DownOutlined,
  MenuOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import CouponService from "@/app/services/coupon.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { getThemeConfig } from "../../theme/themeConfig";
import ThemeToggleButton from "../ThemeToggleButton";
import { useThemeMode } from "../ThemeProvider";
import { ICreditBalance, IOrganization } from "@/app/common/organization.type";
import useResponsive from "@/app/hooks/useResponsive";
import { formatCompactNumber } from "@/app/utils/format";

const { Text } = Typography;
const { Header } = Layout;

interface HeaderProps {
  user?: { fullname: string };
  organizationId?: string;
  personalOrganizations: IOrganization[];
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
  personalOrganizations,
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
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();
  const [form] = Form.useForm();
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  /* ---------------- Real Organization List ---------------- */
  const allOrganizations = [
    ...(personalOrganizations || []),
    ...(teamOrganizations || []),
  ];

  const activeOrg = allOrganizations.find(
    (o) => o.organizationId === organizationId,
  );

  /* ---------------- Token Usage ---------------- */
  const tokenUsage = currentOrganization?.remainTokenAmount ?? 0;
  const tokenLimit = currentOrganization?.packageTokenAmount ?? 0;
  const tokenPercentage = tokenLimit > 0 ? (tokenUsage / tokenLimit) * 100 : 0;

  /* ---------------- Organization Menu ---------------- */
  const orgMenuItems = [
    ...allOrganizations.map((org) => ({
      key: org.organizationId,
      onClick: () => handleOrganizationChange(org.organizationId),
      label: (
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text strong={org.organizationId === organizationId}>{org.name}</Text>
        </Space>
      ),
    })),
    { type: "divider" as const },
    // {
    //   key: "add",
    //   icon: <PlusOutlined />,
    //   label: "Add Organization",
    //   onClick: handleOpenCreateOrg,
    // },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Organization Settings",
      onClick: handleManageOrg,
    },
  ];

  /* ---------------- User Menu ---------------- */
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/page/profile"),
    },
    {
      key: "coupon",
      icon: <CreditCardOutlined />,
      label: "Use Coupon",
      onClick: () => handleOpenCouponModal(),
    },
    ...(systemRole === "SUPER_ADMIN"
      ? [
          {
            key: "admin",
            icon: <SettingOutlined />,
            label: "Admin Management",
            onClick: () => router.push("/page/admin-management"),
          },
        ]
      : []),
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <Header
      style={{
        height: isMobile ? 58 : 72,
        borderBottom: `1px solid ${semantic.colorBorder}`,
        padding: isMobile ? "0 10px" : "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* ---------- Left : Mobile Sider Toggle + Organization Switcher ---------- */}
      <Space size={isMobile || isTablet ? 8 : 0} align="center">
        {(isMobile || isTablet) ? (
          <Button
            type="text"
            onClick={onToggleSider}
            style={{
              width: 36,
              height: 36,
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            icon={<MenuOutlined style={{ color: semantic.colorTextBase }} />}
          />
        ) : null}

        <Dropdown menu={{ items: orgMenuItems }} trigger={["click"]}>
          <Button
            type="text"
            style={{
              padding: isMobile ? 0 : "0 16px",
              minWidth: isMobile ? 40 : undefined,
              height: isMobile ? 44 : 50,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Space size={isMobile ? 0 : 12} align="center">
              <Avatar
                size={32}
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
                    style={{
                      fontSize: 14,
                      color: semantic.colorTextSecondary,
                    }}
                  />
                </>
              ) : null}
            </Space>
          </Button>
        </Dropdown>
      </Space>

      {/* ---------- Right ---------- */}
      <Space size="middle">
        {/* Token Usage */}
        
        <Card
          hoverable
          styles={{
            body: {
              padding: isMobile ? "4px 8px" : "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            },
          }}
          style={{
            borderRadius: 8,
            borderColor: semantic.colorBorder,
            boxShadow: "none",
            minWidth: isMobile ? 86 : 180,
            maxWidth: 240,
            background: semantic.colorBgContainer,
          }}
        >
          <Space align="center" size={6}>
            <CreditCardOutlined style={{ color: semantic.colorTextBase }} />
            <Text style={{ color: semantic.colorTextBase }}>
              {/* {tokenUsage.toLocaleString()} */}
              {formatCompactNumber(creditBalance?.currentCycleBalance)}+{" "}
              {formatCompactNumber(creditBalance?.onTopBalance)}
            </Text>
            {!isMobile ? (
              <>
                <Divider
                  type="vertical"
                  style={{
                    height: 24,
                    borderColor: semantic.colorBorder,
                  }}
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

        <ThemeToggleButton />

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Button type="text" style={{ padding: isMobile ? 0 : undefined }}>
            <Space>
              <Avatar
                size={32}
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
