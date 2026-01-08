"use client";
import React, { useEffect, useState, type FC } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { User, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
const Page: FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const [nodes, setNodes] = useState<
    | {
      circles: Array<{ cx: number; cy: number; delay: number }>;
      lines: Array<{ x1: number; y1: number; x2: number; y2: number; delay: number }>;
    }
    | { circles: []; lines: [] }
  >({ circles: [], lines: [] });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Local Login: Sends credentials to Keycloak via NextAuth CredentialsProvider
      const result = await signIn("credentials", {
        redirect: false,
        username: values.email,
        password: values.password,
        callbackUrl: "/page/project",
      });
      if (result?.error) {
        messageApi.error("Login failed! Please check your User or Password.");
      } else {
        messageApi.success("Login successful!");
        router.push("/page/project");
      }
    } catch (error) {
      console.error("Login error:", error);
      messageApi.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google Login: Redirects to Google via Keycloak
    signIn(
      "keycloak",
      { callbackUrl: "/page/project" },
      { kc_idp_hint: "google" }
    );
  };

  // Check URL errors (e.g. from Google/Keycloak redirects)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      if (error === "403") {
        messageApi.error("Login failed! Please sign up first!");
      } else {
        messageApi.error(error);
      }
    }
  }, [messageApi, router]);
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
      {contextHolder}
      {/* Background Gradients/Effects - generic dark theme vibe */}
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
                  <stop offset="0%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#6366f1", stopOpacity: 1 }} />
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
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Ai Cave
            </h2>
            <p className="text-purple-200 text-lg">Experience the future of intelligent automation</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4 animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue to AI Cave</p>
          </div>

          {/* Form */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email or username!",
                },
              ]}
            >
              <Input
                prefix={<User className="text-gray-500 w-4 h-4" />}
                placeholder="Email or Username"
                size="large"
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38]"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<Lock className="text-gray-500 w-4 h-4" />}
                placeholder="Password"
                size="large"
                className="bg-[#2a2f38] border-[#374151] text-white placeholder-gray-500 hover:border-gray-500 rounded-lg focus:bg-[#2a2f38] hover:bg-[#2a2f38] [&>input]:bg-transparent [&>input]:text-white"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-white">
                  <div className="text-white">Remember me</div>
                </Checkbox>
              </Form.Item>
              <a
                href="#"
                className="text-[#3b82f6] hover:text-[#2563eb] text-sm"
              >
                Forgot Password?
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full h-11 bg-[#4b5563] hover:bg-[#586170] text-white border-none font-medium text-base rounded-lg shadow-lg"
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#374151]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1c2027] text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full h-10 bg-white text-black hover:bg-gray-100 border-none font-medium flex items-center justify-center rounded-lg cursor-pointer"
              >
                {/* Google Icon SVG */}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
          <div className="text-center mt-6">
            <span className="text-gray-400 text-sm">
              {` Don't have an account? `}
              <a
                href="/signup"
                className="text-[#3b82f6] hover:text-[#2563eb] font-semibold"
              >
                Sign Up
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
