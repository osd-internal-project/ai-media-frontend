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
      <div className=" mx-auto px-4 sm:px-6 lg:px-16 pt-6">
        <div className="flex items-center justify-between h-18 ">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center space-x-2">
              <Image src="/images/Logo.png" alt="OSD Logo" width={160} height={100} />
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              // onClick={() => navigate.push(`/public/package`)}
              className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-lg">
              {`About`}
            </Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-lg">
              {`Features`}
            </Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-lg">
              {`Resources`}
            </Link>
            <Link href="#" className="!text-white transition-colors hover:scale-105 hover:text-gray-400 transform !text-lg">
              {`Support`}
            </Link>
            <Button type="primary" className="!bg-[#6366F1] !text-black  transition-all !rounded-4xl w-[150px] !h-[50px] !text-xl">
              {`Purchase`}
            </Button>
          </nav>
        </div>
      </div>
    </Header>
  );
};

export default NavbarUser;
