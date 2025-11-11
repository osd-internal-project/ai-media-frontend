"use client";

import { Button, Layout, Space } from "antd";
import { LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import Link from "antd/es/typography/Link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { Header } = Layout;

interface Props {
  user?: { name: string };
}
const NavbarUser: React.FC<Props> = ({ user }) => {
  const navigate = useRouter();
  return (
    <Header
      style={{
        paddingTop: 40,
        background: "transparent", // <-- remove background color
        height: "auto",
        lineHeight: "normal",
        padding: 0,
        boxShadow: "none", // optional: remove any shadow
      }}>
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center space-x-2">
              <Image src="/images/osd-logo-blue.png" alt="OSD Logo" width={80} height={80} />
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              onClick={() => navigate.push(`/public/package`)}
              className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform">
              Price
            </Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform">
              Explore Documentation
            </Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform">
              case studies
            </Link>
            <Button
              onClick={() => navigate.push("/login")}
              type="default"
              icon={<LoginOutlined />}
              className="!bg-transparent !text-white !border-white hover:!bg-gray-800 hover:!text-gray-300 hover:!border-gray-300 transition-all">
              Get Started
            </Button>
          </nav>

          {/* <Space>
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
          </Space> */}
        </div>
      </div>
    </Header>
  );
};

export default NavbarUser;
