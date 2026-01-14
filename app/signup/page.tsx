"use client";
import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserServices from "@/app/services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Mail, User, Lock, Phone, CheckCircle } from "lucide-react";
import { CheckCircleOutlined } from "@ant-design/icons";

export default function SignupPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
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
      await userService.register(registerData);
      setRegistrationSuccess(true);
      showMessage("success", "Registration successful! Please check your email.");
      // router.push("/login");
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showMessage("error", `${error.response.data.message}`);
      } else {
        showMessage("error", `${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {contextHolder}

      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          height: "800px",
          backgroundColor: "#0E0E12",
          borderRadius: "30px",
          overflow: "hidden",
          display: "flex",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          border: "1px solid #1E1E24",
        }}
      >
        {/* Left Side: Form */}
        <div
          style={{
            width: "50%",
            padding: "48px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 10,
            backgroundColor: "#0E0E12",
            // Using a hack for responsiveness since inline styles don't support media queries easily:
            // For a production app without classes, window listener is needed, but we'll stick to flex layout.
            // Assuming desktop-first as per previous design.
            minWidth: "320px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "48px",
            }}
          >
            <div style={{ position: "relative", width: "32px", height: "32px" }}>
              <Image
                src="/images/logo-1.png"
                alt="Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <Link
              href="/login"
              style={{
                color: "#5BC0EB",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              Log In
            </Link>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: "32rem",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <h1
              style={{
                fontSize: "1.875rem",
                lineHeight: "2.25rem",
                fontWeight: 400,
                color: "white",
                marginBottom: "40px",
              }}
            >
              Connect with your team and bring your creative ideas to life.
            </h1>

            {registrationSuccess ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  animation: "fadeIn 0.5s ease-out forwards",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: "40px", color: "#22c55e" }} />
                </div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "16px",
                  }}
                >
                  Verify your email
                </h2>
                <p style={{ color: "#9ca3af", marginBottom: "32px" }}>
                  We've sent a verification link to your email address. Please click the link to verify your account.
                </p>
                <Link href="/login" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      width: "100%",
                      height: "44px",
                      backgroundColor: "#5465FF",
                      color: "white",
                      border: "none",
                      fontWeight: 500,
                      fontSize: "14px",
                      borderRadius: "0.5rem",
                    }}
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    columnGap: "16px",
                  }}
                >
                  <Form.Item
                    name="fullname"
                    label={
                      <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "4px" }}>
                        Fullname
                      </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input
                      placeholder="Fullname"
                      style={{
                        backgroundColor: "#1A1D21",
                        border: "1px solid #333",
                        color: "white",
                        borderRadius: "0.5rem",
                        height: "44px",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="username"
                    label={
                      <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "4px" }}>
                        Username
                      </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input
                      placeholder="Username"
                      style={{
                        backgroundColor: "#1A1D21",
                        border: "1px solid #333",
                        color: "white",
                        borderRadius: "0.5rem",
                        height: "44px",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label={
                      <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "4px" }}>
                        Email Address
                      </span>
                    }
                    rules={[
                      { required: true, message: "Required" },
                      { type: "email", message: "Invalid email" },
                    ]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input
                      prefix={<Mail style={{ color: "gray", width: "16px", height: "16px", marginRight: "8px" }} />}
                      placeholder="Email"
                      style={{
                        backgroundColor: "#1A1D21",
                        border: "1px solid #333",
                        color: "white",
                        borderRadius: "0.5rem",
                        height: "44px",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="phoneNumber"
                    label={
                      <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "4px" }}>
                        Phone number
                      </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <PhoneInput
                      country={"th"}
                      inputStyle={{
                        width: "100%",
                        height: "44px",
                        backgroundColor: "#1A1D21",
                        border: "1px solid #333",
                        borderRadius: "0.5rem",
                        color: "white",
                        paddingLeft: "48px",
                      }}
                      buttonStyle={{
                        backgroundColor: "#1A1D21",
                        border: "1px solid #333",
                        borderRight: "none",
                        borderRadius: "0.5rem 0 0 0.5rem",
                      }}
                      dropdownStyle={{
                        backgroundColor: "#1A1D21",
                        color: "black",
                      }}
                      placeholder="Phone number"
                    />
                  </Form.Item>

                  {/* <Form.Item
                    name="password"
                    label={
                      <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "4px" }}>
                        Password
                      </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input.Password
                      placeholder="*************"
                      style={{
                        backgroundColor: "#1A1D21",
                        border: "1px solid #333",
                        color: "white",
                        borderRadius: "0.5rem",
                        height: "44px",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={
                      <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "4px" }}>
                        Repeat password
                      </span>
                    }
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Required" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Passwords do not match!"));
                        },
                      }),
                    ]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input.Password
                      placeholder="*************"
                      style={{
                        backgroundColor: "#1A1D21",
                        border: "1px solid #333",
                        color: "white",
                        borderRadius: "0.5rem",
                        height: "44px",
                      }}
                    />
                  </Form.Item> */}
                </div>

                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(new Error("Should accept terms")),
                    },
                  ]}
                  style={{ marginBottom: "24px" }}
                >
                  <Checkbox className="custom-checkbox">
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                      I agree with{" "}
                      <Link
                        href="#"
                        style={{ color: "#5BC0EB", textDecoration: "none" }}
                      >
                        Terms and conditions
                      </Link>
                    </span>
                  </Checkbox>
                </Form.Item>

                <Button
                  htmlType="submit"
                  loading={loading}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "#5465FF",
                    color: "white",
                    border: "none",
                    fontWeight: 500,
                    fontSize: "14px",
                    borderRadius: "0.5rem",
                    marginTop: "8px",
                  }}
                >
                  Create account
                </Button>
              </Form>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "10px",
              color: "#6b7280",
              marginTop: "32px",
            }}
          >
            <p>aicave.ai @ 2026</p>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div
          style={{
            display: "flex", // Keeping flex for visual centering, assuming desktop mainly
            width: "50%",
            backgroundColor: "#050505",
            position: "relative",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <Image
              src="/images/login-visual.jpg"
              alt="Visual"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, #0E0E12, transparent)",
                opacity: 0.5,
              }}
            ></div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-checkbox .ant-checkbox-inner {
            background-color: transparent;
            border-color: #333;
        }
        .custom-checkbox .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #5465FF;
            border-color: #5465FF;
        }
        .custom-checkbox .ant-checkbox-wrapper:hover .ant-checkbox-inner {
            border-color: #5465FF;
        }
        /* Mobile adjustment for inline styles approach if needed */
        @media (max-width: 1024px) {
           /* ... we generally rely on flex-wrap if we were pure css, 
              but with inline style width="50%", it's hard. 
              Accepting fixed layout as per heavy 'style' usage request */
        }
        /* Override Input placeholders color which inline style cannot fully touch easily without pseudo-elements */
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
}
