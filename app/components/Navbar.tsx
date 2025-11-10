"use client";

import { Button, Layout, Space } from "antd";
import { LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import Link from "antd/es/typography/Link";
import Image from "next/image";

const { Header } = Layout;

interface Props {
  user?: { name: string };
}
const NavbarUser: React.FC<Props> = ({ user }) => {
  return (
    <Header
      style={{
        background: "rgba(255, 255, 255, 255)",
        height: "auto",
        lineHeight: "normal",
        padding: 0,
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center space-x-2">
              <Image src="/images/osd-logo-blue.png" alt="OSD Logo" width={80} height={80} />
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-black`}>
              Product Catalog
            </Link>
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-black`}>
              Your Project Workspaces
            </Link>
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-black`}>
              Contract & Package
            </Link>
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-black`}>
              Support Center
            </Link>
          </nav>

          <Space>
            {user ? (
              <p className="!text-bold !text-black">{user ? user?.name : "username"}</p>
            ) : (
              <>
                <Button
                  type="text"
                  shape="round"
                  icon={<LoginOutlined />}
                  className="!border-1 !border-amber-50 transition-all hover:scale-105 hover-primary-text">
                  Login
                </Button>
                <Button type="primary" shape="round" icon={<UserAddOutlined />} className={`transition-all hover:scale-105 border-0 `}>
                  Sign Up
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>
    </Header>
  );
};

export default NavbarUser;
