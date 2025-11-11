"use client";
import React, { useState } from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, FacebookOutlined } from "@ant-design/icons";

const Page: FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Form values:", values);
    alert(`${isLogin ? "Login" : "Sign Up"} successful!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="relative z-10 w-full max-w-6xl flex bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-purple-500/20">
        {/* Left Side - AI Visualization */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            {/* Neural Network Animation */}
            <svg className="w-full h-full opacity-30" viewBox="0 0 400 400">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#6366f1", stopOpacity: 1 }} />
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
              AI Cave
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
            <h1 className="text-3xl font-bold text-white mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
            <p className="text-purple-300">{isLogin ? "Sign in to continue to AI Cave" : "Join the AI Cave"}</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex mb-8 bg-black/50 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                isLogin ? "bg-gradient-to-r from-purple-600 to-indigo-600 !text-white shadow-lg" : "text-purple-300 hover:!text-white"
              }`}>
              LOGIN
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                !isLogin ? "bg-gradient-to-r from-purple-600 to-indigo-600 !text-white shadow-lg" : "text-purple-300 hover:!text-white"
              }`}>
              SIGN UP
            </button>
          </div>

          {/* Form */}
          <Form form={form} name={isLogin ? "login" : "signup"} onFinish={onFinish} layout="vertical" className="space-y-4">
            {!isLogin && (
              <Form.Item name="name" rules={[{ required: true, message: "Please input your name!" }]}>
                <Input
                  prefix={<UserOutlined className="text-purple-400" />}
                  placeholder="Full Name"
                  size="large"
                  className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg"
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}>
              <Input
                prefix={<MailOutlined className="text-purple-400" />}
                placeholder="Email"
                size="large"
                className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg"
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
              <Input.Password
                prefix={<LockOutlined className="text-purple-400" />}
                placeholder="Password"
                size="large"
                className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg"
              />
            </Form.Item>

            {!isLogin && (
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
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}>
                <Input.Password
                  prefix={<LockOutlined className="text-purple-400" />}
                  placeholder="Confirm Password"
                  size="large"
                  className="bg-black/50 border-purple-500/30 hover:border-purple-500 focus:border-purple-500 text-white rounded-lg"
                />
              </Form.Item>
            )}

            {isLogin && (
              <div className="flex justify-between items-center mb-4">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-purple-300">Remember me</Checkbox>
                </Form.Item>
                <a href="#" className="text-purple-400 hover:text-purple-300 text-sm">
                  Forgot Password?
                </a>
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 border-0 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                {isLogin ? "LOGIN" : "SIGN UP"}
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
                <span className="px-4 bg-transparent text-purple-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-2 border border-purple-500/30 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-300 !text-white">
                <GoogleOutlined className="text-xl mr-2" />
                Google
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-purple-500/30 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-300 !text-white">
                <FacebookOutlined className="text-xl mr-2" />
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 10px) scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .ant-input, .ant-input-password, .ant-input-password input {
          background: rgba(0, 0, 0, 0.5) !important;
          border-color: rgba(168, 85, 247, 0.3) !important;
          color: white !important;
        }

        .ant-input::placeholder, .ant-input-password::placeholder, .ant-input-password input::placeholder {
          color: rgba(168, 85, 247, 0.5) !important;
        }

        .ant-input:hover, .ant-input-password:hover, .ant-input:focus, .ant-input-password:focus {
          border-color: rgba(168, 85, 247, 1) !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1) !important;
        }

        .ant-input-affix-wrapper {
          background: rgba(0, 0, 0, 0.5) !important;
          border-color: rgba(168, 85, 247, 0.3) !important;
        }

        .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus {
          border-color: rgba(168, 85, 247, 1) !important;
        }

        .ant-checkbox-wrapper {
          color: rgba(216, 180, 254, 1) !important;
        }

        .ant-checkbox-inner {
          background-color: rgba(0, 0, 0, 0.5) !important;
          border-color: rgba(168, 85, 247, 0.5) !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: rgba(147, 51, 234, 1) !important;
          border-color: rgba(147, 51, 234, 1) !important;
        }
      `}</style>
    </div>
  );
};

export default Page;
