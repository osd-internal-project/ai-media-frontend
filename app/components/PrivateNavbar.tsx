"use client";

import { Avatar, Button, Layout, Popover, Space } from "antd";
import { signOut } from "next-auth/react";
import { ExclamationCircleOutlined, SettingOutlined } from "@ant-design/icons";

const { Header } = Layout;

interface Props {
  user?: { fullname: string };
  pageTitle: string;
}
const NavbarUser: React.FC<Props> = ({ user, pageTitle }) => {
  const content = (
    <div className="flex flex-col gap-2">
      <p style={{ marginBottom: 8 }}></p>
      <Button type="default" block size="small" onClick={() => signOut({ callbackUrl: "/login" })}>
        Sign Out
      </Button>
    </div>
  );
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
              <span className="text-[#6366F1]">Premium</span>
            </div>
            <>
              <Popover content={content} trigger="click" placement="bottomRight" title={false}>
                <Button type="default" size="small" icon={<SettingOutlined />} />
              </Popover>
            </>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar size={48} />
            <div className="grid grid-cols-1 items-center gap-2">
              <span className="font-bold text-white">{`Geust`}</span>
              <span className="text-[#6366F1]">Normal</span>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
};

export default NavbarUser;
