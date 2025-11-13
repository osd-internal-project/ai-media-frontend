"use client";
import { Breadcrumb, ConfigProvider, Layout, Menu, Image } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useState } from "react";
const { Content } = Layout;
import { theme } from "antd";
import Link from "antd/es/typography/Link";
import PrivateContent from "./PrivateContent";
import PrivateNavigation from "./PrivateNavigation";
import { usePathname } from "next/navigation";
import { MenuSiderWithModule } from "../config/menu";
import Sider from "antd/es/layout/Sider";
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<{ name: string }>({ name: "" });

  const pathname = usePathname();
  const menulist = MenuSiderWithModule([]);
  const currentPath = pathname.split("/")[2];
  const currentPathSub = pathname.split("/")[3];
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: "#000000",
          colorBgContainer: "#000000",
          colorBgElevated: "#1a1a1a",
          colorTextBase: "#f0f0f0",
        },
        components: {
          Menu: {
            itemHoverBg: "#f3e8ff", // light purple background on hover
            itemHoverColor: "#7c3aed", // purple text on hover
            itemSelectedBg: "#ede9fe", // background when selected
            itemSelectedColor: "#7c3aed", // text color when selected
            itemBg: "transparent", // default background
          },
          Layout: {
            siderBg: "transparent",
          },
          Segmented: {
            itemActiveBg: "#f3e8ff",
            itemColor: "rgba(168, 85, 247, 1)",
            itemHoverBg: "#f3e8ff",
            itemHoverColor: "#7c3aed",
            itemSelectedBg: "#ede9fe",
            itemSelectedColor: "#7c3aed",
            trackBg: "rgba(168, 85, 247, 0.4)",
          },
        },
      }}>
      {/* 👇 Parent layout wraps sidebar + main content */}
      <Layout className=" min-h-screen  overflow-auto ">
        <Sider width={200} trigger={null} collapsible collapsed={collapsed} className="hidden md:block p-3  ">
          <div className="w-full flex justify-center">
            <Image width={"100px"} src="/images/osd-logo-blue.png" alt="OSD Logo" preview={false} className="mb-2" />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
            defaultSelectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
            items={menulist}
          />
        </Sider>
        <Layout>
          <PrivateNavigation user={user} />
          <PrivateContent user={user}>{children}</PrivateContent>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
