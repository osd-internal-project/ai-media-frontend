"use client";
import React, { useEffect, useState, type FC } from "react";
import { Form, Input, Button, message } from "antd";
import { User, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import UserServices from "../services/users.service";
import { axiosCore, axiosUser } from "../lib/axios/axios";

const Page: FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const [nodes, setNodes] = useState<
    | {
        circles: Array<{ cx: number; cy: number; delay: number }>;
        lines: Array<{
          x1: number;
          y1: number;
          x2: number;
          y2: number;
          delay: number;
        }>;
      }
    | { circles: []; lines: [] }
  >({ circles: [], lines: [] });

  const userService = UserServices(axiosUser);

  useEffect(() => {
    // Generate random positions only on client
    setNodes({
      circles: [...Array(20)].map(() => ({
        cx: Math.random() * 400,
        cy: Math.random() * 400,
        delay: Math.random() * 2,
      })),
      lines: [...Array(15)].map(() => ({
        x1: Math.random() * 400,
        y1: Math.random() * 400,
        x2: Math.random() * 400,
        y2: Math.random() * 400,
        delay: Math.random() * 2,
      })),
    });
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {contextHolder}
      {/* Background Gradients/Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative z-10 w-full max-w-6xl flex bg-[#1c2027] rounded-3xl shadow-2xl overflow-hidden border border-[#2a2f38]">
        {/* Left Side - AI Visualization */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#15191f] p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            {/* Neural Network Animation */}
            <svg className="w-full h-full opacity-30" viewBox="0 0 400 400">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop
                    offset="0%"
                    style={{ stopColor: "#8b5cf6", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#6366f1", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>
              {nodes.circles.map((node, i) => (
                <circle
                  key={i}
                  cx={node.cx}
                  cy={node.cy}
                  r="2"
                  fill="url(#grad1)"
                  className="animate-pulse"
                  style={{ animationDelay: `${node.delay}s` }}
                />
              ))}
              {nodes.lines.map((line, i) => (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="url(#grad1)"
                  strokeWidth="0.5"
                  className="animate-pulse"
                  style={{ animationDelay: `${line.delay}s` }}
                />
              ))}
            </svg>
          </div>

          <div className="relative z-10 text-center">
            <div className="mb-8 animate-float">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Forgot Password?
            </h2>
            <p className="text-purple-200 text-lg">
              Don't worry, we'll help you reset it.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Reset Password
            </h1>
            <p className="text-gray-400">
              Enter your email to receive reset instructions
            </p>
          </div>

          {/* Form */}
          <Form
            form={form}
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="email"
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
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38]"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full h-11 bg-[#4b5563] hover:bg-[#586170] text-white border-none font-medium text-base rounded-lg shadow-lg"
              >
                SEND RESET LINK
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-[#3b82f6] hover:text-[#2563eb] font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
