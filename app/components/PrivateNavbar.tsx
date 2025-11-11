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
        background: "transparent",
        height: "auto",
        lineHeight: "normal",
        padding: 0,
        boxShadow: "none",
      }}>
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center space-x-2">
              <Image src="/images/osd-logo-blue.png" alt="OSD Logo" width={80} height={80} />
            </a>
          </div>
          <Space>{user ? <p className="!text-bold !text-black">{user ? user?.name : "username"}</p> : <>{`Geust User`}</>}</Space>
        </div>
      </div>
    </Header>
  );
};

export default NavbarUser;
