"use client";
import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  PaletteIcon,
  BookTemplate,
  MessageSquare,
  Zap,
} from "lucide-react";

export const MenuSider = [
  {
    key: `general`,
    // label: <span className=" text-[10px]">GENERAL</span>,
    role: "",
    disabled: true,
    header: true,
    children: [
      // {
      //   key: `project`,
      //   role: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
      //   icon: <Bot size={24} />,
      //   label: `Project`,
      // },
      // {
      //   key: `project`,
      //   role: ["OWNER", "ADMIN", "MEMBER", "VIEWER","SUPER_ADMIN"],
      //   icon: <MessageSquare size={22} />,
      //   label: (
      //     <span style={{ fontSize: 12, fontWeight: "normal" }}>Teams</span>
      //   ),
      // },
      {
        key: `project`,
        role: ["OWNER", "ADMIN", "MEMBER", "VIEWER", "SUPER_ADMIN"],
        icon: <FolderOpen size={22} />,
        label: (
          <span style={{ fontSize: 12, fontWeight: "normal" }}>Projects</span>
        ),
      },
      {
        key: `settings/template-new`,
        role: ["OWNER", "ADMIN", "SUPER_ADMIN"],
        icon: <BookTemplate size={22} />,
        label: (
          <span style={{ fontSize: 12, fontWeight: "normal" }}>Templates</span>
        ),
      },
      {
        key: `brand-kit`,
        role: ["OWNER", "ADMIN", "SUPER_ADMIN"],
        icon: <PaletteIcon size={22} />,
        label: (
          <span style={{ fontSize: 12, fontWeight: "normal" }}>Brand Kit</span>
        ),
      },
      // {
      //   key: `admin-management`,
      //   role: ["OWNER", "ADMIN"],
      //   icon: <Settings size={22} />,
      //   label: <span style={{ fontSize: 12, fontWeight: 'normal' }}>ADMIN</span>,
      // },
      //  {
      //   key: `credit`,
      //   role: ["OWNER", "ADMIN", "SUPER_ADMIN"],
      //   icon: <Zap size={22} />,
      //   label: (
      //     <span style={{ fontSize: 12, fontWeight: "normal" }}>Credits</span>
      //   ),
      // },
      {
        key: `dashboard`,
        role: ["OWNER", "ADMIN", "SUPER_ADMIN"],
        icon: <LayoutDashboard size={22} />,
        label: (
          <span style={{ fontSize: 12, fontWeight: "normal" }}>Dashboard</span>
        ),
      },
      {
        key: `assistant`,
        // role: ["OWNER", "ADMIN", "SUPER_ADMIN"],
        icon: <MessageSquare size={22} />,
        label: (
          <span style={{ fontSize: 12, fontWeight: "normal" }}>Assistant</span>
        ),
      },
    ],
  },
  // {
  //   key: `admin`,
  //   label: <span className=" text-[10px]">ADMIN</span>,
  //   role: ["OWNER", "ADMIN"],
  //   disabled: true,
  //   header: true,
  //   children: [],
  // },
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
                <div className="text-center menu-text-label text-[10px]">
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
              className="menu-icon-container"
            >
              {menu.icon}
            </div>
            <div className="text-center menu-text-label text-[10px]">
              {menu.label}
            </div>
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
  const hasAccess = (itemRole: string[] | string) => {
    if (!itemRole || itemRole === "") return true; // public access

    // Handle array of roles
    if (Array.isArray(itemRole)) {
      return itemRole.includes(role);
    }

    // Handle single role
    return itemRole === role;
  };

  return menuList
    .map((menu) => {
      // filter children based on role
      const children = menu.children
        ? menu.children.filter((child: any) => hasAccess(child.role))
        : null;

      // Check if current user can access this menu
      const canAccessMenu = hasAccess(menu.role);

      // If main menu has no access and no accessible children, exclude it
      if (!canAccessMenu && (!children || children.length === 0)) return null;

      return {
        ...menu,
        children: children || menu.children,
      };
    })
    .filter(Boolean); // Remove null entries
};
