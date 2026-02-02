"use client";
import React, { useEffect, useState, type FC } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { User, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { encryptPassword } from "../utils/crypto";
import Link from "next/link";
import Image from "next/image";

const Page: FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const encryptedPassword = encryptPassword(values.password);

      // Local Login: Sends credentials to Keycloak via NextAuth CredentialsProvider
      const result = await signIn("credentials", {
        redirect: false,
        username: values.email,
        password: encryptedPassword,
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
    signIn(
      "keycloak",
      { callbackUrl: "/page/project" },
      { kc_idp_hint: "google" },
    );
  };

  // Check URL errors (e.g. from Google/Keycloak redirects)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      if (error === "403") {
        messageApi.error("Login failed! Please sign up first!");
      } else if (error === "session_expired") {
        messageApi.warning("Your session has expired. Please log in again.");
      } else if (error === "token_expired") {
        messageApi.warning(
          "Your login session has expired. Please log in again.",
        );
      } else if (error === "no_token") {
        messageApi.error("Authentication error. Please log in again.");
      } else if (error === "sso_session_expired") {
        messageApi.warning(
          "Your session has expired due to inactivity or timeout. Please log in again.",
        );
      } else if (error === "validation_failed") {
        messageApi.error("Session validation failed. Please log in again.");
      } else {
        messageApi.error(error);
      }
    }
  }, [messageApi, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {contextHolder}

      <div className="w-full max-w-[1400px] h-[800px] bg-[#0E0E12] rounded-[30px] overflow-hidden flex shadow-2xl relative border border-[#1E1E24]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative z-10 bg-[#0E0E12]">
          {/* Logo Placeholder */}
          <div className="absolute top-8 left-8 lg:left-12">
            {/* Use a simple logo or icon here, or import Image if available */}
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo-1.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl font-bold mb-3 text-white">
                Hello,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5BC0EB] to-[#3B82F6]">
                  Welcome to AI Cave!
                </span>
              </h1>
              <p className="text-gray-400 text-sm font-light">
                Log in to AI Cave to start creating magic.
              </p>
            </div>

            {/* Socials */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleGoogleLogin}
                className="flex-1 bg-[#1A1D21] hover:bg-[#25282C] h-12 rounded-lg flex items-center justify-center gap-3 border border-[#333] transition-colors group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  Sign In with Google
                </span>
              </button>

              <button
                type="button"
                className="flex-1 bg-[#1A1D21] hover:bg-[#25282C] h-12 rounded-lg flex items-center justify-center gap-3 border border-[#333] transition-colors group"
                onClick={() =>
                  messageApi.info("Microsoft login not implemented yet")
                }
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  Sign In with Microsoft
                </span>
              </button>
            </div>

            <div className="relative mb-8 text-center flex items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-[#333]"></div>
              <span className="relative bg-[#0E0E12] px-3 text-[10px] text-gray-500 font-medium tracking-wide">
                OR CONTINUE WITH E-MAIL
              </span>
            </div>

            {/* Form */}
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="space-y-4"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input
                  prefix={
                    <Mail
                      style={{
                        color: "#6b7280",
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    />
                  }
                  placeholder="name.user@gmail.com"
                  size="large"
                  style={{
                    backgroundColor: "#1A1D21",
                    border: "1px solid #333",
                    color: "white",
                    borderRadius: "0.5rem",
                    height: "48px",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
                className="mb-2"
              >
                <Input.Password
                  prefix={
                    <Lock
                      style={{
                        color: "#6b7280",
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    />
                  }
                  placeholder="Password"
                  size="large"
                  style={{
                    backgroundColor: "#1A1D21",
                    border: "1px solid #333",
                    color: "white",
                    borderRadius: "0.5rem",
                    height: "48px",
                  }}
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-8">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="custom-checkbox">
                    <span className="text-gray-400 hover:text-gray-300 text-xs">
                      Remember me
                    </span>
                  </Checkbox>
                </Form.Item>
                <Link
                  href="/forgot-password"
                  className="text-[#5BC0EB] hover:text-[#3B82F6] text-xs font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              <Form.Item className="mb-0">
                <Button
                  htmlType="submit"
                  loading={loading}
                  style={{
                    backgroundColor: "#5465FF",
                    color: "white",
                    height: "48px",
                    borderRadius: "12px",
                    fontWeight: 600,
                    border: "none",
                    width: "100%",
                    fontSize: "16px",
                  }}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-8 text-center text-xs text-gray-500">
              {"Don't have an account? "}
              <Link
                href="/signup"
                className="text-[#5BC0EB] hover:text-[#3B82F6] font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="hidden lg:flex w-1/2 bg-[#050505] relative overflow-hidden items-center justify-center">
          {/* Background effects */}
          <div className="relative w-full h-full animate-float">
            <Image
              src="/images/login-visual.jpg"
              alt="Login Visual"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(-12deg);
          }
          50% {
            transform: translateY(-15px) rotate(-12deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .custom-checkbox .ant-checkbox-inner {
          background-color: transparent;
          border-color: #333;
        }
        .custom-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #5465ff;
          border-color: #5465ff;
        }
        .custom-checkbox .ant-checkbox-wrapper:hover .ant-checkbox-inner {
          border-color: #5465ff;
        }
        input::placeholder {
          color: #4b5563 !important;
        }
        .ant-input-password input {
          background-color: transparent !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Page;
