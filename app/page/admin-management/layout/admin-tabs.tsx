"use client";

import { useThemeMode } from "@/app/components/ThemeProvider";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import CouponService from "@/app/services/coupon.service";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import OrganizationServices from "@/app/services/organization.service";
import PlanServices from "@/app/services/plan.service";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { Button } from "antd";
import {
  Box,
  Building2,
  Cpu,
  FileText,
  KeyRound,
  Megaphone,
  MessageSquare,
  PersonStanding,
  ReceiptText,
  Ticket,
  User2,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState, useTransition, type CSSProperties } from "react";

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
  {
    key: "announcements",
    label: "Announcements",
    href: "/page/admin-management/announcements",
    matchers: ["/announcements"],
    icon: <Megaphone size={16} />,
  },
  {
    key: "chat-assistant",
    label: "Chat Assistant",
    href: "/page/admin-management/chat-assistant",
    matchers: ["/chat-assistant"],
    icon: <MessageSquare size={16} />,
  },
  {
    key: "integration-keys",
    label: "API Keys",
    href: "/page/admin-management/integration-keys",
    matchers: ["/integration-keys"],
    icon: <KeyRound size={16} />,
  },
];

type TabCounts = Partial<Record<AdminTabItem["key"], number>>;

/** จำนวนต่อท้ายชื่อ tab (แทนแถว stat card เดิม) — โหลดไม่สำเร็จ = ไม่แสดง ไม่ใช่ 0 */
const useTabCounts = (): TabCounts => {
  const [counts, setCounts] = useState<TabCounts>({});

  useEffect(() => {
    let isMounted = true;
    const sources: [AdminTabItem["key"], () => Promise<number>][] = [
      ["plan-management", async () => (await PlanServices(axiosCore).findAllFormatted()).length],
      ["model-pricing", async () => (await MasterModelTypeServices(axiosCore).findAll()).length],
      ["coupon-management", async () => {
        const result = await CouponService(axiosUser).findAll();
        return result?.total ?? result?.data?.length ?? 0;
      }],
      ["organization", async () => (await OrganizationServices(axiosUser).findAll({})).length],
    ];
    Promise.allSettled(sources.map(([, load]) => load())).then((results) => {
      if (!isMounted) return;
      const next: TabCounts = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") next[sources[index][0]] = result.value;
      });
      setCounts(next);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return counts;
};

const AdminTabs: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const isLightMode = mode === "light";
  const [, startTransition] = useTransition();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const counts = useTabCounts();

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
          {counts[tab.key] !== undefined && (
            <span
              className="tabular-nums"
              style={{ color: semantic.colorTextSecondary, fontWeight: 400 }}
            >
              {counts[tab.key]!.toLocaleString()}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default AdminTabs;
