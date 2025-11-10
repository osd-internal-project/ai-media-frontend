"use client";

import { Breadcrumb, ConfigProvider, Layout } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Navigation from "./Navigation";
import { useState } from "react";
import OSDFooter from "./Footer";
import colors from "../config/colors.config";
const { Content } = Layout;
import { theme } from "antd";
import ClientContent from "./ClientContent";
import Link from "antd/es/typography/Link";
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<{ name: string }>({ name: "" });
  // const [user, setUser] = useState({
  //   name: "John Doe",
  //   email: "",
  // });
  return (
    <ConfigProvider
      theme={{
        token: {
          // Primary brand colors
          // colorPrimary: colors.secondary[400],
          // colorPrimaryBg: colors.primary[50],
          // colorPrimaryBgHover: colors.primary[100],
          // colorPrimaryBorder: colors.primary[200],
          // colorPrimaryBorderHover: colors.primary[300],
          // colorPrimaryHover: colors.primary[300],
          // colorPrimaryActive: colors.primary[400],
          // colorPrimaryTextHover: colors.primary[300],
          // colorPrimaryText: colors.primary.DEFAULT,
          // colorPrimaryTextActive: colors.primary[400],

          // Success color (using cyan)
          colorSuccess: colors.cyan.DEFAULT,
          colorSuccessBg: colors.cyan[50],
          colorSuccessBorder: colors.cyan[200],

          // Warning color (using secondary)
          colorWarning: colors.secondary[300],
          colorWarningBg: colors.secondary[50],
          colorWarningBorder: colors.secondary[200],

          // Error color (using pink)
          colorError: colors.pink.DEFAULT,
          colorErrorBg: colors.pink[50],
          colorErrorBorder: colors.pink[200],

          // Info color (using violet)
          colorInfo: colors.violet.DEFAULT,
          colorInfoBg: colors.violet[50],
          colorInfoBorder: colors.violet[200],

          // Background colors
          // colorBgElevated: darkMode ? colors.gray[300] : colors.white,
          colorBgLayout: colors.gray[50],
          // colorBgSpotlight: darkMode ? colors.gray[300] : colors.gray[100],
          // colorBgMask: darkMode ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)",

          // Text colors
          colorText: darkMode ? colors.black : colors.gray.DEFAULT,
          colorTextBase: darkMode ? colors.black : colors.gray.DEFAULT,
          colorTextSecondary: darkMode ? colors.gray[100] : colors.gray[300],
          colorTextTertiary: darkMode ? colors.gray[200] : colors.gray[200],
          colorTextQuaternary: darkMode ? colors.gray[300] : colors.gray[100],
          colorTextDescription: darkMode ? colors.gray[200] : colors.gray[200],
          colorTextDisabled: darkMode ? colors.gray[300] : colors.gray[200],
          colorTextHeading: darkMode ? colors.black : colors.gray.DEFAULT,
          colorTextLabel: darkMode ? colors.black : colors.gray.DEFAULT,
          colorTextPlaceholder: darkMode ? colors.gray[200] : colors.gray[200],

          // Border colors
          colorBorder: darkMode ? colors.gray[300] : colors.gray[100],
          colorBorderBg: darkMode ? colors.gray[400] : colors.gray[50],
          colorBorderSecondary: darkMode ? colors.gray[400] : colors.gray[50],

          // Fill colors
          colorFill: darkMode ? colors.gray[400] : colors.gray[50],
          colorFillSecondary: darkMode ? colors.gray[300] : colors.gray[100],
          colorFillTertiary: darkMode ? colors.gray[200] : colors.gray[200],
          colorFillQuaternary: darkMode ? colors.gray[300] : colors.gray[100],
        },

        components: {
          Layout: {
            // headerBg: "transparent",
            //     headerHeight: 64,
            //     headerPadding: 0,
            //     bodyBg: darkMode ? colors.gray[500] : colors.white,
            footerBg: darkMode ? colors.primary.DEFAULT : colors.black,
            //     siderBg: darkMode ? colors.gray[400] : colors.white,
            //     triggerBg: darkMode ? colors.gray[300] : colors.gray[100],
            //     triggerColor: darkMode ? colors.white : colors.gray.DEFAULT,
          },
        },
      }}>
      <Layout className="min-h-screen">
        <Navigation user={user} />
        {/* <Breadcrumb
          items={[
            {
              title: (
                <Link href="#" className={`transition-colors hover:scale-105 transform !text-black`}>
                  <HomeOutlined /> Home Page
                </Link>
              ),
            },
            {
              title: (
                <Link href="#" className={`transition-colors hover:scale-105 transform !text-black`}>
                  Project
                </Link>
              ),
            },
          ]}
        /> */}
        <ClientContent user={user}>{children}</ClientContent>
        <OSDFooter darkMode={darkMode} setDarkMode={setDarkMode} />
      </Layout>
    </ConfigProvider>
  );
}
