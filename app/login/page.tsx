"use client";
import React, { useState, type FC } from "react";
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

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Local Login: Sends credentials to Keycloak via NextAuth CredentialsProvider
      const result = await signIn("credentials", {
        redirect: false,
        username: values.email, // Keycloak often uses email or username
        password: values.password,
      });
      console.log(result);
      if (result?.error) {
        messageApi.error("Login failed! Please check your User or Password.");
      } else {
        messageApi.success("Login successful!");
        router.push("/page/project-layout");
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
      { callbackUrl: "/page/project-layout" },
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
      // Remove error param
      router.replace("/login");
    }
  }, [messageApi, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      {contextHolder}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="relative z-10 w-full max-w-6xl flex bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-purple-500/20">
        {/* Left Side - AI Visualization */}
        <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-purple-600/20 to-indigo-600/20 p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            {/* Neural Network Animation */}
            {mounted && (
              <svg className="w-full h-full opacity-30" viewBox="0 0 400 400">
                <defs>
                  <linearGradient
                    id="grad1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
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
                {[...Array(20)].map((_, i) => (
                  <circle
                    key={i}
                    cx={Math.random() * 400}
                    cy={Math.random() * 400}
                    r="2"
                    fill="url(#grad1)"
                    className="animate-pulse"
                    style={{ animationDelay: `${Math.random() * 2}s` }}
                  />
                ))}
                {[...Array(15)].map((_, i) => (
                  <line
                    key={i}
                    x1={Math.random() * 400}
                    y1={Math.random() * 400}
                    x2={Math.random() * 400}
                    y2={Math.random() * 400}
                    stroke="url(#grad1)"
                    strokeWidth="0.5"
                    className="animate-pulse"
                    style={{ animationDelay: `${Math.random() * 2}s` }}
                  />
                ))}
              </svg>
            )}
          </div>

          <div className="relative z-10 text-center">
            <div className="mb-8 animate-float">
              <div className="w-32 h-32 mx-auto bg-linear-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-indigo-400">
              AI Cave
            </h2>
            <p className="text-purple-200 text-lg">
              Experience the future of intelligent automation
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo/Header */}
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-300">Sign in to continue to AI Cave</p>
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
                prefix={<User className="text-purple-400 w-4 h-4" />}
                placeholder="Email or Username"
                size="large"
                className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg placeholder-purple-400/50"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<Lock className="text-purple-400 w-4 h-4" />}
                placeholder="Password"
                size="large"
                className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg placeholder-purple-400/50"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-purple-300">Remember me</Checkbox>
              </Form.Item>
              <a
                href="#"
                className="text-purple-400 hover:text-purple-300 text-sm"
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
                className="w-full bg-linear-to-r from-purple-600 to-indigo-600 border-0 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-500/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-purple-300">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-2 border border-purple-500/30 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-300 text-white cursor-pointer"
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
                Sign in with Google
              </button>
            </div>
          </div>
          <div className="text-center mt-6">
            <span className="text-purple-300 text-sm">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-purple-400 hover:text-purple-200 font-semibold"
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
