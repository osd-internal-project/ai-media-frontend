"use client";
import React, { useState } from "react";
import {
  ConfigProvider,
  Layout,
  Menu,
  Image,
  Avatar,
  Badge,
  Button,
  Popover,
  theme,
} from "antd";
import { LockKeyholeOpen, UserCog, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { SettingOutlined } from "@ant-design/icons";

const { Sider } = Layout;

interface AdminManagementLayoutProps {
  children: React.ReactNode;
}

const AdminManagementLayout: React.FC<AdminManagementLayoutProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed] = useState(false);
  const { data: session } = useSession();

  // Extract the current path and check for sub-routes

  // Determine which menu item should be selected
  const getSelectedKey = () => {
    if (pathname.includes('/admin-management/users-management')) {
      return "users-management";
    }
    if (pathname.includes('/admin-management/group-permission')) {
      return "group-permission";
    }
    return "users-management"; // default
  };

  const menuItems = [
    {
      key: "users-management",
      icon: <UserCog size={16} />,
      label: "User Management",
      onClick: () => router.push("/page/admin-management/users-management"),
    },
    {
      key: "group-permission",
      icon: <LockKeyholeOpen size={16} />,
      label: "Group & Permissions",
      onClick: () => router.push("/page/admin-management/group-permission"),
    },
  ];

  const content = (
    <div className="flex flex-col gap-2">
      <Button
        type="default"
        block
        size="small"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign Out
      </Button>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: "#000000",
          colorBgContainer: "#000000",
          colorBgElevated: "#1a1a1a",
          colorTextBase: "#f0f0f0",
        },
        components: {
          Button: {
            boxShadow: "none",
            defaultShadow: "none",
            primaryShadow: "none",
          },
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
        },
      }}
    >
      <Layout className="h-screen overflow-hidden">
        {/* Admin Management Sidebar - Replaces Main Sidebar */}
        <Sider
          width={250}
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="hidden md:block p-2 h-screen"
        >
          <div className="bg-black rounded-2xl h-full flex flex-col">
            {/* Logo Section */}
            <div className="w-full flex justify-center items-center py-5 flex-shrink-0">
              <Image
                // width={"120px"}
                src="/images/logo-1.png"
                alt="OSD Logo"
                preview={false}
                className="mb-2"
              />
            </div>

            {/* Back Button */}
            <div className="px-4 mb-4">
              <Button
                icon={<ArrowLeft size={16} />}
                onClick={() => router.push("/page/dashboard")}
                className="w-full !bg-gray-800 !border-gray-700 !text-white hover:!bg-gray-700"
              >
                Back to Dashboard
              </Button>
            </div>

            <div className="px-4 mb-2">
              <div className="w-full text-[#F0F0F073] line-height-[16px] text-[12px] mb-2">
                ADMIN MANAGEMENT
              </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar overflow-x-hidden px-2">
              <Menu
                mode="inline"
                selectedKeys={[getSelectedKey()]}
                items={menuItems}
                className="bg-transparent border-0"
              />
            </div>

            {/* User Profile Section */}
            <div className="bg-black rounded-2xl p-4 flex items-center gap-5 flex-shrink-0 mt-3">
              <Badge dot color="green">
                <Avatar />
              </Badge>
              <div className="grid grid-cols-1">
                <span className="text-white text-sm">{session?.user?.name}</span>
                <span className="text-[#6366F1]">Admin</span>
              </div>
              <Popover
                content={content}
                trigger="click"
                placement="bottomRight"
                title={false}
              >
                <Button
                  type="default"
                  size="small"
                  icon={<SettingOutlined />}
                />
              </Popover>
            </div>
          </div>
        </Sider>

        {/* Content Area */}
        <Layout className="flex-1 w-full h-full overflow-hidden">
          <div className="w-full h-screen p-2 overflow-y-auto">
            {children}
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminManagementLayout;