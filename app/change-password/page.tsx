"use client";
import React, { useEffect, useState, type FC, Suspense } from "react";
import { Form, Input, Button, message, Spin, ConfigProvider } from "antd";
import { Lock, User, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import UserServices from "../services/users.service";
import { axiosUser } from "../lib/axios/axios";

const ChangePasswordForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [, setUserData] = useState<any>(null); // Kept for potential future use or debugging
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [form] = Form.useForm();

  const userService = UserServices(axiosUser);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }
      try {
        const data = await userService.checkResetPassword(token);
        setUserData(data);
        setIsValidToken(true);
        form.setFieldsValue({
          username: data.username,
          email: data.email,
        });
      } catch (error) {
        console.error("Token verification failed:", error);
        messageApi.error("Invalid or expired token.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      messageApi.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await userService.confirmChangePassword({
        token,
        newPassword: values.password,
      });

      messageApi.success("Password changed successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Change password error:", error);
      messageApi.error(
        error.response?.data?.message || "Failed to change password."
      );
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Invalid or Expired Link</h1>
        <p className="text-gray-400 mb-6">
          The password reset link is invalid or has expired.
        </p>
        <Button type="primary" onClick={() => router.push("/forget-password")}>
          Request New Link
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {contextHolder}
      {/* Header */}
      <div className="text-left mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
        <p className="text-gray-400">Create a new password for your account</p>
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
              colorBgContainerDisabled: "#27272a", // Darker background for disabled
              colorTextDisabled: "#9ca3af", // Lighter text for disabled
              hoverBorderColor: "#6b7280",
              activeBorderColor: "#6b7280",
              controlHeightLG: 44,
              borderRadiusLG: 8,
            },
            Button: {
              colorPrimary: "#6366F1",
              colorPrimaryHover: "#5558DD",
              controlHeightLG: 44,
              borderRadiusLG: 8,
              contentFontSizeLG: 16,
              fontWeight: 500,
              primaryShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
              lineWidth: 0,
            },
            Form: {
              labelColor: "white",
            },
          },
        }}
      >
        <Form
          form={form}
          name="change-password"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item name="username" label="Username">
            <Input
              prefix={<User className="text-gray-500 w-4 h-4" />}
              disabled
              size="large"
            />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input
              prefix={<User className="text-gray-500 w-4 h-4" />}
              disabled
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please input your new password!" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<Lock className="text-gray-500 w-4 h-4" />}
              placeholder="New Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<CheckCircle className="text-gray-500 w-4 h-4" />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="mt-2"
            >
              RESET PASSWORD
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </div>
  );
};

const Page: FC = () => {
  return (
    <div className=" h-screen relative z-10 w-full flex bg-black ">
      {/* Left Side - Form (2 spans) */}
      <div className="w-full lg:w-2/3 p-8 lg:p-12 flex flex-col justify-between relative min-h-[600px]">
        {/* Top: Logo */}
        <div className="flex items-center">
          <Image
            src="/images/Logo.png"
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
            <Suspense fallback={<Spin />}>
              <ChangePasswordForm />
            </Suspense>
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
  );
};

export default Page;
