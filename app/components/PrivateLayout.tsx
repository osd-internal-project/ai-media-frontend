"use client";
import { ConfigProvider, Layout, Menu, Image, Avatar, Badge, Button } from "antd";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { renderMenuItems, MenuSider } from "../config/menu";
import Sider from "antd/es/layout/Sider";
import PrivateNavigation from "./PrivateNavigation";
import PrivateContent from "./PrivateContent";
import { useSession } from "next-auth/react";
import { PlusCircleOutlined } from "@ant-design/icons";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();

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
            selectorBg: "#151515",
            colorBgContainer: "#151515",
            colorText: "white",
            colorTextPlaceholder: "#777",
            colorBorder: "#333",
            colorBgElevated: "#1e1e1e",
            optionActiveBg: "#333",
            optionSelectedBg: "#444",
          },
        },
      }}
    >
      <Layout className="h-screen overflow-hidden">
        <Sider width={250} trigger={null} collapsible collapsed={collapsed} className="hidden md:block p-2 h-screen">
          <div className="bg-black rounded-2xl h-full flex flex-col">
            <div className="w-full flex justify-center items-center py-5 flex-shrink-0">
              <Image width={"150px"} src="/images/Logo.png" alt="OSD Logo" preview={false} className="mb-2" />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Menu
                mode="inline"
                selectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
                defaultSelectedKeys={[currentPath, `${currentPath}/${currentPathSub}`]}
                items={renderMenuItems(MenuSider)}
              />
              <div className=" !text-gray-400 px-4 mt-2">
                {`PROJECT`}{" "}
                <div className="mt-3 w-full">
                  <Button icon={<PlusCircleOutlined />} className="w-full">{`Add new project`}</Button>
                </div>
              </div>
            </div>
            <div className="bg-black rounded-2xl p-4 flex items-center gap-5 flex-shrink-0 mt-3">
              <Badge dot color="green">
                <Avatar />
              </Badge>
              <div className="grid grid-cols-1">
                <span className="text-white text-sm">{`${session?.user?.name}`}</span>
                <span className="text-[#6366F1]">Premium</span>
              </div>
            </div>
          </div>
        </Sider>
        <Layout className="!p-0 h-screen flex flex-col">
          <PrivateNavigation user={session?.user ? { fullname: session.user.name ?? "" } : undefined} />
          <div className="flex-1 ">
            <PrivateContent user={session?.user ? { fullname: session.user.name ?? "" } : undefined}>{children}</PrivateContent>
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
