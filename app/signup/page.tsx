"use client";
import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
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
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {contextHolder}
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="relative z-10 w-full max-w-lg bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-purple-500/20 p-8">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 animate-pulse">
            <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-purple-300">Join AI Cave today</p>
        </div>

        {/* Signup Form */}
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          className="space-y-4"
        >
          <Form.Item
            name="fullname"
            rules={[
              { required: true, message: "Please input your full name!" },
            ]}
          >
            <Input
              placeholder="Full Name"
              size="large"
              className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg placeholder-purple-400/50"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
            />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              placeholder="Username"
              size="large"
              className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg placeholder-purple-400/50"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
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
              placeholder="Email Address"
              size="large"
              className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg placeholder-purple-400/50"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
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
                height: "40px",
                borderRadius: "0.5rem",
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
              buttonStyle={{
                borderTopLeftRadius: "0.5rem",
                borderBottomLeftRadius: "0.5rem",
                backgroundColor: "rgba(0,0,0,0.5)",
                borderColor: "rgba(168, 85, 247, 0.3)",
              }}
              placeholder="Phone Number"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Password"
              size="large"
              className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg placeholder-purple-400/50"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
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
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm Password"
              size="large"
              className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg placeholder-purple-400/50"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 border-0 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 mt-4"
          >
            SIGN UP
          </Button>
        </Form>

        <div className="text-center mt-6">
          <span className="text-purple-300 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-200 font-semibold"
            >
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
