"use client";

import { Breadcrumb, ConfigProvider, Layout } from "antd";
import Navigation from "./Navigation";
import { useState } from "react";
import OSDFooter from "./Footer";
import ClientContent from "./ClientContent";
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
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
      }}>
      <Layout className="min-h-screen">
        <Navigation user={user} />
        <ClientContent user={user}>{children}</ClientContent>
        <OSDFooter darkMode={darkMode} setDarkMode={setDarkMode} />
      </Layout>
    </ConfigProvider>
  );
}
