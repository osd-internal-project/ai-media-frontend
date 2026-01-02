"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Input, Button, Result, Spin, notification, Divider } from "antd";
import {
  LoadingOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BankOutlined,
} from "@ant-design/icons";
import UserServices from "../services/users.service";
import { axiosUser } from "../lib/axios/axios";
import OrganizationServices from "../services/organization.service";
import { IOrganization } from "../common/organization.type";
import OrganizationMemberServices from "../services/organization-members.service";

const userService = UserServices(axiosUser);
const organizationService = OrganizationServices(axiosUser);
const organizationMemberService = OrganizationMemberServices(axiosUser);
const AddUserContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [form] = Form.useForm();
  const organizationId = searchParams.get("organizationId");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [organization, setOrganization] = useState<IOrganization | undefined>(
    undefined
  );
  useEffect(() => {
    const checkUser = async () => {
      if (!email || !organizationId) {
        router.push(`/404`);
        return;
      }
      try {
        const resOrg = await organizationService.findById(organizationId);
        if (!resOrg) {
          router.push(`/404`);
        }
        setOrganization(resOrg);
        const users = await userService.findBySearch(email);

        const existingUser =
          users && Array.isArray(users)
            ? users.find((u: any) => u.email === email)
            : null;

        if (existingUser) {
          setUserExists(true);
          const member =
            await organizationMemberService.findUserMemberByOrganization(
              organizationId,
              existingUser.token
            );
          if (member) router.push(`/404`);
          form.setFieldsValue({
            userId: existingUser.userId,
            email: email,
            fullname: existingUser.fullname,
            username: existingUser.username,
          });
          // Redirect to dashboard with organizationId
        } else {
          form.setFieldsValue({
            email: email,
          });

          setUserExists(false);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        notification.error({
          message: "Error",
          description: "Failed to verify user status.",
        });
      } finally {
        setChecking(false);
      }
    };

    checkUser();
  }, [email, organizationId, router]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      if (values.userId) {
        const organizationMember =
          await organizationMemberService.createFromInvite({
            userId: values.userId,
            organizationId: organizationId,
          });
        if (organizationMember) {
          await userService.update(values.userId, {
            ...(organizationId ? { recentOrganizationId: organizationId } : {}),
          });
          notification.success({
            message: "Account Created",
            description:
              "Your account has been successfully created. Redirecting to dashboard...",
          });
          setTimeout(() => {
            router.push(`/page/dashboard`);
          }, 1500);
        }
      } else {
        const resUser = await userService.create({
          username: values.username || email?.split("@")[0],
          email: email,
          password: values.password,
          fullname: values.fullname,
          ...(organizationId ? { recentOrganizationId: organizationId } : {}),
        });
        if (resUser) {
          await organizationService.createOwner({
            name: values.fullname,
            slug: "",
            type: "personal",
            createdById: resUser.userId,
          });
          const organizationMember =
            await organizationMemberService.createFromInvite({
              userId: resUser.userId,
              organizationId: organizationId,
            });
          notification.success({
            message: "Account Created",
            description:
              "Your account has been successfully created. Redirecting to dashboard...",
          });
          setTimeout(() => {
            router.push(`/page/dashboard`);
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      notification.error({
        message: "Registration Failed",
        description:
          error?.response?.data?.message ||
          "Could not create account. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!email || !organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
        <Result
          status="404"
          title={
            <span className="text-white text-2xl font-bold">Invalid Link</span>
          }
          subTitle={
            <span className="text-gray-400">
              The invitation link is missing required information (email or
              organizationId).
            </span>
          }
        />
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <p className="text-white mt-4 text-lg">Verifying invitation</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8 animate-fadeIn">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-linear-to-r from-violet-400 to-fuchsia-400">
              Create Account
            </h1>
            <p className="text-gray-400">
              Join the organization with your email.
            </p>
          </div>

          <Form
            name="register"
            onFinish={onFinish}
            form={form}
            layout="vertical"
            initialValues={{ email: email }}
            className="space-y-4"
          >
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Invited Email
              </p>
              <p className="text-white font-medium flex items-center gap-2">
                <MailOutlined className="text-violet-400" /> {email}
              </p>
            </div>
            <Divider>Profile</Divider>
            {userExists && <Form.Item name={"userId"} hidden></Form.Item>}
            <Form.Item
              name="fullname"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input
                readOnly={userExists}
                prefix={<UserOutlined className="text-violet-400" />}
                placeholder="Full Name"
                size="large"
                className="bg-black/20 border-white/10 hover:border-violet-500 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg h-12"
              />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                readOnly={userExists}
                prefix={<UserOutlined className="text-violet-400" />}
                placeholder="Username"
                size="large"
                className="bg-black/20 border-white/10 hover:border-violet-500 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg h-12"
              />
            </Form.Item>

            {!userExists && (
              <div>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-violet-400" />}
                    placeholder="Password"
                    size="large"
                    className="bg-black/20 border-white/10 hover:border-violet-500 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
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
                    prefix={<LockOutlined className="text-violet-400" />}
                    placeholder="Confirm Password"
                    size="large"
                    className="bg-black/20 border-white/10 hover:border-violet-500 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg h-12"
                  />
                </Form.Item>
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
                className="w-full h-12 bg-linear-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500! hover:to-indigo-500! shadow-lg shadow-indigo-500/25 rounded-xl font-semibold text-lg"
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <BankOutlined /> Organization : {organization?.name || ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddUserPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <AddUserContent />
    </Suspense>
  );
}
