"use client";
import React from "react";
import Link from "next/link";
import { CodeOutlined, FileImageOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { LockKeyholeOpen, SquareChevronRight } from "lucide-react";

export const MenuSider = [
  {
    key: `general`,
    label: `GENERAL`,
    role: "",
    disabled: true,
    header: true,
    children: [
      {
        key: `dashboard`,
        role: "d-v",
        icon: <FileImageOutlined />,
        label: `Dashboard`,
      },
      {
        key: `group-permission`,
        role: "g-v",
        icon: <LockKeyholeOpen size={16} />,
        label: `Groups & Permission`,
      },
      {
        key: `users-management`,
        role: "u-v",
        icon: <UserSwitchOutlined />,
        label: `User Managament`,
      },
    ],
  },
  {
    key: `settings`,
    label: `SETTING`,
    disabled: true,
    role: "s-v",
    header: false,
    children: [
      {
        key: `roles`,
        role: "r-v",
        icon: <FileImageOutlined />,
        label: `Roles`,
      },
      {
        key: `prompt-guide`,
        role: "pg-v",
        icon: <CodeOutlined />,
        label: `Prompt Guide`,
      },
    ],
  },
];

// ฟังก์ชันสร้างเมนูแบบ title + children แสดงตรง ๆ
export const renderMenuItems = (menuList: any[]) => {
  const items: any[] = [];
  menuList.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      items.push({
        type: "group",
        label: menu.label,
        key: menu.key,
        children: menu.children.map((child: any) => ({
          key: child.key,
          icon: child.icon,
          label:
            menu.disabled && menu.header ? (
              <Link href={`/page/${child.key}`}>{child.label}</Link>
            ) : (
              <Link href={`/page/${menu.key}/${child.key}`}>{child.label}</Link>
            ),
        })),
      });
    } else {
      items.push({
        key: menu.key,
        icon: menu.icon,
        label: <Link href={`/page/${menu.key}`}>{menu.label}</Link>,
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
  const hasAccess = (role: string) => {
    if (!role || role === "") return true; // public
    return userRoles.includes(role);
  };

  return menuList
    .map((menu) => {
      // filter children ตาม role
      const children = menu.children ? menu.children.filter((child: any) => hasAccess(child.role)) : null;

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
