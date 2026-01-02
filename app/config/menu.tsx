"use client";
import React from "react";
import Link from "next/link";
import { CodeOutlined, FileImageOutlined } from "@ant-design/icons";
import {
  Bot,
  ChartPie,
  LayoutTemplate,
  Settings,
  ShieldUser,
} from "lucide-react";

export const MenuSider = [
  {
    key: `general`,
    label: <span className=" text-[12px]">GENERAL</span>,
    role: "",
    disabled: true,
    header: true,
    children: [
      {
        key: `dashboard`,
        role: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
        icon: <ChartPie size={22} />,
        label: `Dashboard`,
      },
      // {
      //   key: `project`,
      //   role: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
      //   icon: <Bot size={24} />,
      //   label: `Project`,
      // },
      {
        key: `project-layout`,
        role: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
        icon: <FileImageOutlined />,
        label: `Projects`,
      },
    ],
  },
  {
    key: `settings`,
    label: <span className=" text-[12px]">SETTING</span>,
    disabled: true,
    role: ["OWNER", "ADMIN"],
    header: false,
    children: [
      // {
      //   key: `roles`,
      //   role: ["OWNER", "ADMIN"],
      //   icon: <ChartPie size={22} />,
      //   label: `Roles`,
      // },
      // {
      //   key: `prompt-guide`,
      //   role: "pg-v",
      //   icon: <CodeOutlined />,
      //   label: `Prompt Guide`,
      // },
      {
        key: `settings/template-setting`,
        role: ["OWNER", "ADMIN"],
        icon: <LayoutTemplate size={22} />,
        label: `Template`,
      },
    ],
  },
  {
    key: `admin`,
    label: <span className=" text-[12px]">ADMIN</span>,
    role: ["OWNER", "ADMIN"],
    disabled: true,
    header: true,
    children: [
      {
        key: `admin-management`,
        role: ["OWNER", "ADMIN"],
        icon: <Settings size={22} />,
        label: `Admin`,
      },
    ],
  },
];

// ฟังก์ชันสร้างเมนูแบบ title + children แสดงตรง ๆ
export const renderMenuItems = (menuList: any[], role: string | undefined) => {
  if (!role) {
    return [];
  }
  const sortedMenu = filterMenuByOrganizationRole(menuList, role);

  const items: any[] = [];
  sortedMenu.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      items.push({
        type: "group",
        label: menu.label,
        key: menu.key,
        children: menu.children.map((child: any) => {
          const isDirectLink = menu.disabled && menu.header;
          const href = isDirectLink
            ? `/page/${child.key}`
            : `/page/${child.key}`;

          return {
            key: child.key,
            style: { height: "auto", padding: "4px 0" }, // Allow flexible height
            label: (
              <Link
                href={href}
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
                  {child.icon}
                </div>
                <div className="text-center  text-white text-[12px]">
                  {child.label}
                </div>
              </Link>
            ),
          };
        }),
      });
    } else {
      items.push({
        key: menu.key,
        // icon: menu.icon, // Hide default icon prop to use custom layout if needed, but here we keep strict compatibility or apply same logic?
        // Current config doesn't seem to hit this else block for the sidebar items in question.
        // But for consistency:
        style: { height: "auto", padding: "4px 0" },
        // Removed original text label from Antd Item if we want full custom.
        label: (
          <Link
            href={`/page/${menu.key}`}
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
            >
              {menu.icon}
            </div>
            <div className="text-center text-sm ">{menu.label}</div>
          </Link>
        ),
      });
    }
  });
  return items;
};

export const findMenuLabel = (menuList: any[], key: string): string | null => {
  for (const menu of menuList) {
    if (menu.key === key) return menu.label;

    if (menu.children) {
      const child = menu.children.find((c: any) => c.key === key);
      if (child) return child.label;
    }
  }
  return null;
};

export const filterMenuByRole = (menuList: any[], userRoles: string[]) => {
  // ADMIN has super user access to all menus
  if (userRoles.includes("ADMIN") || userRoles.includes("OWNER")) {
    return menuList;
  }

  const hasAccess = (role: string) => {
    if (!role || role === "") return true; // public
    return userRoles.includes(role);
  };

  return menuList
    .map((menu) => {
      // filter children ตาม role
      const children = menu.children
        ? menu.children.filter((child: any) => hasAccess(child.role))
        : null;

      // ถ้าตัว menu นี้ไม่ต้องมี children → แสดงได้ปกติ
      const canAccessMenu = hasAccess(menu.role);

      // ถ้าเมนูหลักไม่มีสิทธิ์ และไม่มี child เลย → ไม่ให้ผ่าน
      if (!canAccessMenu && (!children || children.length === 0)) return null;

      return {
        ...menu,
        children: children || menu.children,
      };
    })
    .filter(Boolean); // ลบ null ออก
};

export const filterMenuByOrganizationRole = (menuList: any[], role: string) => {
  // ADMIN has super user access to all menus
  if (role === "ADMIN" || role === "OWNER") {
    return menuList;
  }

  return menuList
    .map((menu) => {
      // filter children ตาม role
      const children = menu.children
        ? menu.children.filter((child: any) => role.includes(menu.role))
        : null;

      // ถ้าตัว menu นี้ไม่ต้องมี children → แสดงได้ปกติ
      const canAccessMenu = role.includes(menu.role);

      // ถ้าเมนูหลักไม่มีสิทธิ์ และไม่มี child เลย → ไม่ให้ผ่าน
      if (!canAccessMenu && (!children || children.length === 0)) return null;

      return {
        ...menu,
        children: children || menu.children,
      };
    })
    .filter(Boolean); // ลบ null ออก
};
