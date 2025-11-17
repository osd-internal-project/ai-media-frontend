"use client";
import { ConfigProvider, Layout, Menu, Image, Avatar, Badge, Button } from "antd";
import { useState } from "react";
import PrivateContent from "./PrivateContent";
import { usePathname } from "next/navigation";
import { renderMenuItems, MenuSider } from "../config/menu";
import Sider from "antd/es/layout/Sider";
import { signIn } from "next-auth/react";
import PrivateNavigation from "./PrivateNavigation";
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string }>({ name: "" });

  const pathname = usePathname();
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
            itemBg: "transparent",
            itemColor: "white",
            itemHoverBg: "#363A3D",
            itemHoverColor: "white",
            itemSelectedBg: "#363A3D",
            itemSelectedColor: "white",
            itemDisabledColor: "#white",
          },
          Layout: {
            siderBg: "#0f0f0f",
          },
          Select: {
            selectorBg: "#151515", // พื้นหลังตอนยังไม่เลือก
            colorBgContainer: "#151515", // พื้นหลังตอนเลือกแล้ว
            colorText: "white", // สีตัวอักษรตอนเลือกแล้ว
            colorTextPlaceholder: "#777", // สี placeholder ตอนยังไม่เลือก
            colorBorder: "#333", // เส้น border
            colorBgElevated: "#1e1e1e", // พื้นหลัง dropdown
            optionActiveBg: "#333", // hover
            optionSelectedBg: "#444", // ตอนเลือก item
          },
        },
      }}
    >
      <Layout className=" min-h-screen  overflow-auto ">
        <Sider width={250} trigger={null} collapsible collapsed={collapsed} className="hidden md:block p-3 relative ">
          <div className="bg-black rounded-2xl !pb-5 h-full">
            <div className="w-full flex justify-center items-center py-5">
              <Image width={"150px"} src="/images/Logo.png" alt="OSD Logo" preview={false} className="mb-2" />
            </div>
            <Menu
              mode="inline"
              selectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
              defaultSelectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
              items={renderMenuItems(MenuSider)}
            />
          </div>
          {/* <div className="bg-black rounded-2xl p-4 flex items-center gap-5 absolute bottom-10 left-3 right-3">
            <Badge dot color="green">
              <Avatar />
            </Badge>
            <div className="grid grid-cols-1">
              <span className="text-white text-sm">User Guest</span>
              <span className="text-[#6366F1]">{`Premium`}</span>
            </div>
          </div> */}
        </Sider>
        <Layout className="!min-h-screen !p-0">
          <PrivateNavigation user={user} />
          <PrivateContent user={user}>{children}</PrivateContent>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
