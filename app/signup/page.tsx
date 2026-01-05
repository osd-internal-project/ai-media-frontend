"use client";
import React, { useState } from "react";
import { Form, Input, Button, Divider, message } from "antd";
import { GoogleOutlined, TwitterOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserServices from "@/app/services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userService = UserServices(axiosUser);
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = (
    type: "error" | "success" | "warning" | "loading",
    content: string
  ) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Remove confirmPassword from payload
      const { confirmPassword, ...registerData } = values;

      // Basic password validation
      if (registerData.password.length < 6) {
        showMessage("error", "Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      await userService.register(registerData);
      showMessage("success", "Registration successful! Please sign in.");
      router.push("/login");
    } catch (error: any) {
      console.error("Registration failed:", error);
      const msg =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      showMessage("error", Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  // Custom Discord Icon since it's not in standard antd icons
  const DiscordIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      style={{ marginRight: 8 }}
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.27,105.27,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21a105.73,105.73,0,0,0,32.17,16.15,77.7,77.7,0,0,0,6.89-11.38,65.52,65.52,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a63.77,63.77,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.38,105.73,105.73,0,0,0,32.19-16.14C128.81,56.68,124.31,32.65,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );

  return (
    <>
      {contextHolder}
      <div className="min-h-screen flex items-center justify-center bg-[#0f1115] relative overflow-hidden">
        {/* Background Gradients/Effects - generic dark theme vibe */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1a1d26] to-[#0f1115] z-0 pointer-events-none" />

        <div className="w-full max-w-[500px] bg-[#1c2027] rounded-3xl p-8 z-10 shadow-2xl border border-[#2a2f38]">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <img
                src="/images/Logo.png"
                alt="Ai Cave Logo"
                style={{ width: 200, height: 100, objectFit: "contain" }}
              />
            </div>
            <h1 className="text-white text-2xl font-bold italic tracking-wide">
              Welcome to Ai Cave
            </h1>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              className="w-full h-10 bg-white text-black hover:bg-gray-100 border-none font-medium flex items-center justify-center rounded-lg"
              icon={<GoogleOutlined />}
            >
              Continue with Google
            </Button>
            <Button
              className="w-full h-10 bg-white text-black hover:bg-gray-100 border-none font-medium flex items-center justify-center rounded-lg"
              icon={<DiscordIcon />}
            >
              Continue with Discord
            </Button>
            <Button
              className="w-full h-10 bg-white text-black hover:bg-gray-100 border-none font-medium flex items-center justify-center rounded-lg"
              icon={<TwitterOutlined />}
            >
              Continue with Twitter
            </Button>
          </div>

          <div className="relative mb-6">
            <Divider>
              <p className="text-gray-400">OR</p>
            </Divider>
          </div>

          {/* Signup Form */}
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="auth-form"
          >
            <Form.Item
              name="fullname"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input
                placeholder="Full Name *"
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 h-10 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38]"
              />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                placeholder="Username *"
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 h-10 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38]"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                placeholder="Email Address *"
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 h-10 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38]"
              />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              rules={[
                { required: true, message: "Please input your phone number!" },
              ]}
            >
              <PhoneInput
                country={"th"}
                inputStyle={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "0.5rem",
                }}
                buttonStyle={{
                  borderTopLeftRadius: "0.5rem",
                  borderBottomLeftRadius: "0.5rem",
                }}
                placeholder="Phone Number"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                placeholder="Password *"
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 h-10 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38] [&>input]:bg-transparent [&>input]:text-white"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm password *"
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 h-10 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38] [&>input]:bg-transparent [&>input]:text-white"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-11 bg-[#4b5563] hover:bg-[#586170] text-white border-none font-medium text-base rounded-lg mt-2"
              loading={loading}
            >
              Sign Up
            </Button>
          </Form>

          <div className="text-center mt-6">
            <span className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#3b82f6] hover:text-[#2563eb]"
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
