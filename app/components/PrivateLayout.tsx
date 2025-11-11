"use client";
import { Breadcrumb, ConfigProvider, Layout } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useState } from "react";
const { Content } = Layout;
import { theme } from "antd";
import Link from "antd/es/typography/Link";
import PrivateContent from "./PrivateContent";
import PrivateNavigation from "./PrivateNavigation";
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<{ name: string }>({ name: "" });
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: "#000000", // พื้นหลังหลัก
          colorBgContainer: "#000000", // พื้นหลัง container
          colorBgElevated: "#1a1a1a", // พื้นหลัง popup/modal
          colorTextBase: "#f0f0f0", // ตัวอักษรหลัก
        },

        components: {
          Layout: {
            // footerBg: darkMode ? colors.primary.DEFAULT : colors.black,
          },
        },
      }}>
      <Layout className="min-h-screen">
        <PrivateNavigation user={user} />
        <PrivateContent user={user}>{children}</PrivateContent>
        {/* <OSDFooter darkMode={darkMode} setDarkMode={setDarkMode} /> */}
      </Layout>
    </ConfigProvider>
  );
}
