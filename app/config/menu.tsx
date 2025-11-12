import React from "react";
import { MenuProps, Tooltip } from "antd";
import Link from "next/link";
import { FileImageOutlined, PieChartOutlined, VideoCameraOutlined, UserSwitchOutlined, SettingOutlined } from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

export const MenuSider: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    // rule: ["user", "admin"],
    icon: <PieChartOutlined />,
  },
  {
    key: `generate-image`,
    icon: <FileImageOutlined />,
    label: `Generate Image`,
    // rule: ["user", "admin", "hr"],
  },
  {
    key: `generate-vdo`,
    icon: <VideoCameraOutlined />,
    label: `Generate VDO`,
    // rule: ["user", "admin", "hr"],
  },
  {
    key: `users-management`,
    icon: <UserSwitchOutlined />,
    label: `User Management`,
    // rule: ["admin", "hr", "user"],
  },
  {
    key: `setting`,
    icon: <SettingOutlined />,
    label: `Setting`,
    // rule: ["admin", "hr", "ma-user"],
    children: [],
  },
].map((item) => {
  return {
    ...item,
    label: !item.children ? (
      <>
        <Link href={`/page/${item.key}`}>{item.label}</Link>
      </>
    ) : (
      item.label
    ),
  };
});

export const MenuSiderWithModule = (modules: string[]) => {
  //   if (modules) {
  const menuFilterChildren = MenuSider.map((menu: any) => ({
    ...menu,
    children: menu?.children
      ? menu.children
          // .filter((item: any) => {
          //   const rule = item.rule;
          //   // return !item.rule || modules.includes(item.rule);
          //   if (Array.isArray(rule)) {
          //     return rule.some((r) => modules.includes(r));
          //   }
          //   return modules.includes(rule);
          // })
          .map((item: any) => {
            return {
              ...item,
              label: (
                <Tooltip placement="right" title={item.label}>
                  <div style={{ width: 140 }}>
                    <Link href={`/page/${item.key}`}>{item.label}</Link>
                  </div>
                </Tooltip>
              ),
            };
          })
      : null,
  }));
  const menu = menuFilterChildren;
  //   .filter((item: any) => {
  //     const rule = item.rule;
  //     if (Array.isArray(rule)) {
  //       return rule.some((r) => modules.includes(r));
  //     }
  //     return modules.includes(rule);
  //   });

  return menu;
  //   } else {
  //     return [];
  //   }
};
