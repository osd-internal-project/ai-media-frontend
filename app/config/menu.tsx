"use client";
import React from "react";
// import { MenuProps, Tooltip } from "antd";
import Link from "next/link";
import { FileImageOutlined, PieChartOutlined, VideoCameraOutlined, UserSwitchOutlined, SettingOutlined, FileExcelOutlined } from "@ant-design/icons";
import { LockKeyholeOpen } from "lucide-react";
// type MenuItem = Required<MenuProps>["items"][number];

// export const MenuSider: MenuItem[] = [
//   {
//     key: `general`,
//     label: `General`,
//     disabled: true,
//     // rule: ["user", "admin", "hr"],
//     children: [
//       {
//         key: `generate-image`,
//         icon: <FileImageOutlined />,
//         label: `Generate Image`,
//       },
//       {
//         key: `generate-vdo`,
//         icon: <VideoCameraOutlined />,
//         label: `Generate VDO`,
//         // rule: ["user", "admin", "hr"],
//       },
//     ],
//   },

//   {
//     key: `report`,
//     icon: <FileExcelOutlined />,
//     label: `Report`,
//     // rule: ["user", "admin", "hr"],
//   },
//   {
//     key: `users-management`,
//     icon: <UserSwitchOutlined />,
//     label: `User Management`,
//     // rule: ["admin", "hr", "user"],
//   },
//   {
//     key: `setting`,
//     icon: <SettingOutlined />,
//     label: `Setting`,
//     // rule: ["admin", "hr", "ma-user"],
//     children: [],
//   },
// ].map((item) => {
//   return {
//     ...item,
//     label: <>{item.label}</>,
//   };
// });

// export const MenuSiderWithModule = (modules: string[]) => {
//   //   if (modules) {
//   const menuFilterChildren = MenuSider.map((menu: any) => ({
//     ...menu,
//     children: menu?.children
//       ? menu.children
//           // .filter((item: any) => {
//           //   const rule = item.rule;
//           //   // return !item.rule || modules.includes(item.rule);
//           //   if (Array.isArray(rule)) {
//           //     return rule.some((r) => modules.includes(r));
//           //   }
//           //   return modules.includes(rule);
//           // })
//           .map((item: any) => {
//             return {
//               ...item,
//               label: (
//                 <div style={{ width: 140 }}>
//                   <Link href={`/page/${item.key}`}>{item.label}</Link>
//                 </div>
//               ),
//             };
//           })
//       : null,
//   }));
//   return menuFilterChildren;
//   //   .filter((item: any) => {
//   //     const rule = item.rule;
//   //     if (Array.isArray(rule)) {
//   //       return rule.some((r) => modules.includes(r));
//   //     }
//   //     return modules.includes(rule);
//   //   });

//   // return menu;
//   //   } else {
//   //     return [];
//   //   }
// };

export const MenuSider = [
  {
    key: `generate-image`,
    icon: <FileImageOutlined />,
    label: `Image Generation`,
  },
  {
    key: `generate-vdo`,
    icon: <VideoCameraOutlined />,
    label: `Video Generation`,
  },
  {
    key: `group-permission`,
    icon: <LockKeyholeOpen size={16} />,
    label: `Groups & Permission`,
  },
  {
    key: `users-management`,
    icon: <UserSwitchOutlined />,
    label: `User Managament`,
  },
  {
    key: `settings`,
    label: `Settings`,
    disabled: true,
    children: [
      {
        key: `roles`,
        icon: <FileImageOutlined />,
        label: `Roles`,
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
          label: <Link href={`/page/${menu.key}/${child.key}`}>{child.label}</Link>,
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
