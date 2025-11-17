"use client";

import { Avatar, Button, Layout, Space } from "antd";
import { LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import Link from "antd/es/typography/Link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { Header } = Layout;

interface Props {
  user?: { fullname: string };
  pageTitle: string;
}
const NavbarUser: React.FC<Props> = ({ user, pageTitle }) => {
  return (
    <Header
      style={{
        background: "transparent",
        height: "auto",
        lineHeight: "normal",
        padding: 0,
        boxShadow: "none",
      }}
    >
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-24">
        <div className="text-2xl">{pageTitle}</div>
        {user ? (
          <div className="flex items-center gap-4">
            <Avatar size={48} />
            <div className="grid grid-cols-1 items-center gap-2">
              <span className="font-bold text-white">{user.fullname}</span>
              <span>{`tier subscribe`}</span>
            </div>
          </div>
        ) : (
          <>
            <p className="!text-bold !text-white">{"Guest"}</p>
            <Avatar />
          </>
        )}
      </div>
    </Header>
  );
};

export default NavbarUser;
