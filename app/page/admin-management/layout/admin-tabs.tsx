"use client";

import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { Button } from "antd";
import {
  Box,
  Building2,
  Cpu,
  FileText,
  PersonStanding,
  ReceiptText,
  Ticket,
  User2,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useState, useTransition, type CSSProperties } from "react";

type AdminTabItem = {
  key: string;
  label: string;
  href: string;
  matchers: string[];
  icon?: React.ReactNode;
};

const adminTabs: AdminTabItem[] = [
  {
    key: "users-management",
    label: "Users",
    href: "/page/admin-management/users-management",
    matchers: ["/users-management"],
    icon: <User2 size={16} />,
  },
  {
    key: "organization",
    label: "Organizations",
    href: "/page/admin-management/organization",
    matchers: ["/organization"],
    icon: <Building2 size={16} />,
  },
  {
    key: "plan-management",
    label: "Plans",
    href: "/page/admin-management/plan-management",
    matchers: ["/plan-management"],
    icon: <Box size={16} />,
  },
  {
    key: "model-pricing",
    label: "AI Models",
    href: "/page/admin-management/model-pricing",
    matchers: ["/model-pricing", "/ai-model-management"],
    icon: <Cpu size={16} />,
  },
  {
    key: "coupon-management",
    label: "Coupons",
    href: "/page/admin-management/coupon-management",
    matchers: ["/coupon-management"],
    icon: <Ticket size={16} />,
  },
  {
    key: "invoices",
    label: "Invoices",
    href: "/page/admin-management/invoices",
    matchers: ["/invoices"],
    icon: <FileText size={16} />,
  },
  {
    key: "wht-requests",
    label: "WHT",
    href: "/page/admin-management/wht-requests",
    matchers: ["/wht-requests"],
    icon: <ReceiptText size={16} />,
  },
  {
    key: "customers",
    label: "Customers",
    href: "/page/admin-management/customers",
    matchers: ["/customers"],
    icon: <Users size={16} />,
  },
];

const AdminTabs: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const isLightMode = mode === "light";
  const [, startTransition] = useTransition();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const containerStyle: CSSProperties = {
    background: isLightMode
      ? semantic.colorBgTextActive
      : "rgba(255, 255, 255, 0.04)",
    borderRadius: 999,
    padding: 4,
    display: "flex",
    gap: 6,
    flexWrap: "nowrap",
    overflowX: "auto",
    scrollbarWidth: "none",
  };

  const getTabButtonStyle = (tab: AdminTabItem): CSSProperties => {
    const isActive = tab.matchers.some((segment) => pathname.includes(segment));
    const isHovered = hoveredKey === tab.key;

    return {
      borderRadius: 999,

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
      transition:
        "background-color 180ms ease, color 180ms ease, transform 140ms ease",
      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
      willChange: "background-color, color",
    };
  };

  return (
    <div style={containerStyle} className="hide-scrollbar min-w-0">
      {adminTabs.map((tab) => (
        <Button
          key={tab.key}
          icon={tab.icon}
          type="text"
          style={getTabButtonStyle(tab)}
          onMouseEnter={() => setHoveredKey(tab.key)}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => {
            startTransition(() => {
              router.push(tab.href);
            });
          }}
          className="shrink-0 !px-4"
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default AdminTabs;
