"use client";

import { Avatar, Button, Layout, Space } from "antd";
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
        <div className="flex items-center justify-end h-16">
          {user ? (
            <div className="flex items-center  gap-4">
              <p className="flex justify-center items-center !text-bold !text-white">{"username"}</p>
              <Avatar />
            </div>
          ) : (
            <>
              <p className="!text-bold !text-white">{"username"}</p>
              <Avatar />
            </>
          )}
        </div>
      </div>
    </Header>
  );
};

export default NavbarUser;
