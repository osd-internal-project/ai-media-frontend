"use client";

import { Layout, Button, Space } from "antd";
import { LoginOutlined, UserAddOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import Link from "antd/es/typography/Link";
import Image from "next/image";

const { Header } = Layout;

const NavbarGuest: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // const mobileMenuItems: MenuProps["items"] = [
  //   {
  //     key: "1",
  //     label: <a href="#">Home</a>,
  //   },
  //   {
  //     key: "2",
  //     label: <a href="#">Products</a>,
  //   },
  //   {
  //     key: "3",
  //     label: <a href="#">Services</a>,
  //   },
  //   {
  //     key: "4",
  //     label: <a href="#">About</a>,
  //   },
  //   {
  //     key: "5",
  //     label: <a href="#">Contact</a>,
  //   },
  // ];

  return (
    <Header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ?? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20"
      }`}
      style={{
        background: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
        height: "auto",
        lineHeight: "normal",
        padding: 0,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center space-x-2">
              {scrolled ? (
                <Image src="/images/osd-logo-blue.png" alt="OSD Logo" width={80} height={80} />
              ) : (
                <Image src="/images/osd-logo-white.png" alt="OSD Logo" width={80} height={80} />
              )}
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-bold ${scrolled ? "!text-primary" : "!text-white"} `}>
              Home
            </Link>
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-bold ${scrolled ? "!text-primary" : "!text-white"}  `}>
              Products
            </Link>
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-bold ${scrolled ? "!text-primary" : "!text-white"}  `}>
              Services
            </Link>
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-bold ${scrolled ? "!text-primary" : "!text-white"}  `}>
              About
            </Link>
            <Link href="#" className={`transition-colors hover:scale-105 transform !text-bold ${scrolled ? "!text-primary" : "!text-white"}  `}>
              Contact
            </Link>
          </nav>

          <Space>
            <Button
              type="text"
              shape="round"
              icon={<LoginOutlined />}
              className="!border-1 !border-amber-50 transition-all hover:scale-105 hover-primary-text"
              style={scrolled ? { color: "#040C5C" } : { color: "#FFFFFF" }}
            >
              Login
            </Button>
            <Button type="primary" shape="round" icon={<UserAddOutlined />} className={`transition-all hover:scale-105 border-0 `}>
              Sign Up
            </Button>
          </Space>
        </div>
      </div>
    </Header>
  );
};

export default NavbarGuest;
