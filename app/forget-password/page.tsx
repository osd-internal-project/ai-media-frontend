"use client";
import React, { useState, type FC } from "react";
import { Form, Input, Button, message, ConfigProvider } from "antd";
import { User } from "lucide-react";
import Image from "next/image";
import UserServices from "../services/users.service";
import { axiosUser } from "../lib/axios/axios";

const Page: FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const userService = UserServices(axiosUser);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await userService.requestChangePassword(values.email);
      messageApi.success("Please check your email to reset your password.");
      form.resetFields();
    } catch (error: any) {
      console.error("Request error:", error);
      messageApi.error("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className=" h-screen relative z-10 w-full flex bg-black ">
      {/* Left Side - Form (2 spans) */}
      {contextHolder}
      <div className="w-full lg:w-2/3 p-8 lg:p-12 flex flex-col justify-between relative min-h-[600px]">
        {/* Top: Logo */}
        <div className="flex items-center">
          <Image
            src="/images/logo-1.png"
            alt="Ai Cave Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </div>

        {/* Middle: Content */}
        <div className="flex flex-col justify-center grow py-12">
          <div className="max-w-[800px] mx-auto w-full">
            {/* Header */}
            <div className="text-left mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Forget Password
              </h1>
              <p className="text-gray-400">
                Enter your email to receive reset instructions
              </p>
            </div>

            {/* Form */}
            <ConfigProvider
              theme={{
                components: {
                  Input: {
                    colorBgContainer: "#18181b",
                    colorBorder: "#27272a",
                    colorText: "#ffffff",
                    colorTextPlaceholder: "#6b7280",
                    hoverBorderColor: "#6b7280",
                    activeBorderColor: "#6b7280",
                    controlHeightLG: 44,
                    borderRadiusLG: 8,
                  },
                  Button: {
                    colorPrimary: "#6366F1",
                    controlHeightLG: 44,
                    borderRadiusLG: 8,
                    contentFontSizeLG: 16,
                    fontWeight: 500,
                    primaryShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                    lineWidth: 0,
                  },
                },
              }}
            >
              <Form
                form={form}
                name="forgot-password"
                onFinish={onFinish}
                className="w-full flex gap-3 items-start"
              >
                <Form.Item
                  name="email"
                  className="flex-1 m-0"
                  rules={[
                    {
                      required: true,
                      message: "Please input your email!",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email!",
                    },
                  ]}
                >
                  <Input
                    prefix={<User className="text-gray-500 w-4 h-4" />}
                    placeholder="Email Address"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item className="m-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                  >
                    Send
                  </Button>
                </Form.Item>
              </Form>
            </ConfigProvider>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-500">or</span>
              </div>
            </div>

            {/* Back to Login Button */}
            <div>
              <a
                href="/login"
                className="w-full h-11 flex items-center justify-center bg-[#18181b] hover:bg-[#27272a] text-gray-300 border border-[#27272a] rounded-lg font-medium transition-colors"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>aicave.ai @ 2026</span>
          <a href="#" className="hover:text-gray-400">
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Right Side - Image Illustration (1 span) */}
      <div className="hidden lg:block lg:w-1/3 relative bg-[#1c2027]">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/Illustration.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Optional: Add overlay if needed */}
        <div className="absolute inset-0 bg-black/10" />
      </div>
    </div>
    // </div>
  );
};
// ...existing code...

export default Page;
