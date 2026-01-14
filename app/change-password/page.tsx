"use client";
import React, { useEffect, useState, type FC, Suspense } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import { Lock, User, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import UserServices from "../services/users.service";
import { axiosCore, axiosUser } from "../lib/axios/axios";
import { encryptPassword } from "../utils/crypto";

const ChangePasswordForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
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
      // Usually we encrypt password before sending if the backend expects it,
      // but here UsersService.confirmChangePassword sends it as is in 'newPassword'.
      // The Login page used encryptPassword, let's check backend...
      // Backend KeycloakService just takes the value.
      // If the Login page encrypts it for 'credentials' provider, that provider likely decrypts it?
      // Wait, Keycloak usually expects plain text unless configured otherwise.
      // The encryptPassword utility in frontend likely just hashes it or something?
      // Let's assume sending the password as entered is fine for now, or match Login page pattern if Keycloak expects hashed.
      // Checking Login page... `const encryptedPassword = encryptPassword(values.password);`
      // But KeycloakService `createUser` just takes `userDto.password`.
      // Let's stick to what createUser does. If Login page does extra encryption, it might be for a custom provider,
      // but here we are calling Keycloak Admin API via our backend. The Admin API expects plain text to set credentials.

      await userService.confirmChangePassword({
        token,
        newPassword: values.password, // Sending plain text as Keycloak needs to hash it
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
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
        <p className="text-gray-400">Create a new password for your account</p>
      </div>

      {/* Form */}
      <Form
        form={form}
        name="change-password"
        onFinish={onFinish}
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          name="username"
          label={<span className="text-white">Username</span>}
        >
          <Input
            prefix={<User className="text-gray-500 w-4 h-4" />}
            disabled
            className="bg-[#2a2f38] border-[#374151] text-white disabled:bg-[#1f242c] disabled:text-gray-400 rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="text-white">Email</span>}
        >
          <Input
            prefix={<User className="text-gray-500 w-4 h-4" />}
            disabled
            className="bg-[#2a2f38] border-[#374151] text-white disabled:bg-[#1f242c] disabled:text-gray-400 rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="text-white">New Password</span>}
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            prefix={<Lock className="text-gray-500 w-4 h-4" />}
            placeholder="New Password"
            size="large"
            className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38] [&>input]:bg-transparent [&>input]:text-white"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="text-white">Confirm Password</span>}
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("The passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<CheckCircle className="text-gray-500 w-4 h-4" />}
            placeholder="Confirm Password"
            size="large"
            className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38] [&>input]:bg-transparent [&>input]:text-white"
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
            RESET PASSWORD
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const Page: FC = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 overflow-hidden relative">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Security First
            </h2>
            <p className="text-purple-200 text-lg">
              Your account security is our priority.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <Suspense fallback={<Spin />}>
            <ChangePasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Page;
