"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Input, Button, Spin, notification, Divider, FormInstance } from "antd";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import {
    LoadingOutlined,
    UserOutlined,
    LockOutlined,
    MailOutlined,
    BankOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import UserServices from "../services/users.service";
import { axiosUser } from "../lib/axios/axios";
import OrganizationServices from "../services/organization.service";
import OrganizationMemberServices from "../services/organization-members.service";

type TInvitationDetail = {
    email: string;
    organizationName: string;
    role: string;
    organizationId: string;
    hasAccount: boolean;
    fullname?: string;
}

type FormValues = {
    email: string;
    password: string;
    fullname: string;
    username: string;
    phoneNumber: string;
}

const userService = UserServices(axiosUser);
const organizationService = OrganizationServices(axiosUser);
const organizationMemberService = OrganizationMemberServices(axiosUser);

const InvitationInfo = ({ form, userExists }: { form: FormInstance; userExists: boolean }) => {
    return (
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Invited Email
            </p>
            <p className="text-white pb-2 font-medium flex items-center gap-2">
                <MailOutlined className="text-violet-400" /> {form.getFieldValue("email")}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Invited Organization
            </p>
            <p className="text-white pb-2 font-medium flex items-center gap-2">
                <BankOutlined />{form.getFieldValue("organizationName")}
            </p>
            {userExists && (
                <>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                        Full Name
                    </p>
                    <p className="text-white pb-2 font-medium flex items-center gap-2">
                        <UserOutlined className="text-violet-400" /> {form.getFieldValue("fullname")}
                    </p>
                </>
            )}
        </div>
    );
};

const RegistrationFields = () => {
    return (
        <>
            <Divider><p className="text-gray-400">Profile</p></Divider>
            <Form.Item<FormValues>
                name="fullname"
                rules={[
                    { required: true, message: "Please input your full name!" },
                ]}
            >
                <Input
                    prefix={<UserOutlined className="text-violet-400" />}
                    placeholder="Full Name"
                    size="large"
                    className="bg-black/20 border-white/10 hover:border-violet-500 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg h-12"
                />
            </Form.Item>

            <Form.Item<FormValues>
                name="username"
                rules={[
                    { required: true, message: "Please input your username!" },
                ]}
            >
                <Input
                    prefix={<UserOutlined className="text-violet-400" />}
                    placeholder="Username"
                    size="large"
                    className="bg-black/20 border-white/10 hover:border-violet-500 focus:border-violet-500 text-white placeholder-gray-500 rounded-lg h-12"
                />
            </Form.Item>

            <Form.Item<FormValues>
                name="phoneNumber"
                rules={[
                    { required: true, message: "Please input your phone number!" },
                ]}
            >
                <PhoneInput
                    country={'th'}
                    inputStyle={{
                        width: '100%',
                        height: '48px',
                        borderRadius: '0.5rem',
                    }}
                    buttonStyle={{
                        borderTopLeftRadius: '0.5rem',
                        borderBottomLeftRadius: '0.5rem',
                    }}
                    placeholder="Phone Number"
                />
            </Form.Item>

            <div>
                <Form.Item<FormValues>
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
        </>
    );
};

const AcceptInviteContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [form] = Form.useForm();
    const organizationId = searchParams.get("organizationId");
    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userExists, setUserExists] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (token) {
            verifyToken(token)
        }
    }, [token]);

    const verifyToken = async (token: string) => {
        try {
            const verifyToken = await organizationService.invitationDetail(token)
            if (verifyToken) {
                const invitationDetail: TInvitationDetail = verifyToken;
                form.setFieldsValue({
                    email: invitationDetail.email,
                    organizationName: invitationDetail.organizationName,
                    role: invitationDetail.role,
                    organizationId: invitationDetail.organizationId,
                    fullname: invitationDetail.fullname,
                })
                setUserExists(invitationDetail.hasAccount);
                setChecking(false);
            }
        } catch (error) {
            console.error("Error verifying token:", error);
            notification.error({
                message: "Error verifying token",
                description: "Please try again later.",
            });
            setChecking(false);
            setIsError(true);
        }
    }

    const onFinish = async (values: FormValues) => {
        try {
            const response = await organizationService.acceptInvitation({
                ...values,
                token: token ?? ""
            });
            if (response) {
                notification.success({
                    message: "Invitation accepted successfully",
                    description: "You have successfully accepted the invitation.",
                });
                router.push("page/project-layout");
            }
        } catch (error) {
            console.error("Error accepting invitation:", error);
            notification.error({
                message: "Error accepting invitation",
                description: "Please try again later.",
            });
        }
    };


    if (checking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                <p className="text-white mt-4 text-lg">Verifying invitation</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
                {/* Background Effects (reused) */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 -left-4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 animate-fadeIn">
                        <CloseCircleOutlined style={{ color: "white" }} className="text-6xl mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-4">
                            Error verifying token
                        </h1>
                        <p className="text-gray-400 mb-8">
                            The invitation link is invalid or has expired. Please contact the administrator for a new invitation.
                        </p>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => router.push("/")}
                            className="w-full h-12 bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20 text-white rounded-xl font-semibold text-lg"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
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
                            {userExists ? "Accept Invitation" : "Create Account"}
                        </h1>
                        <p className="text-gray-400">
                            {userExists ? "You have been invited to join an organization." : "Join the organization with your email."}
                        </p>
                    </div>

                    <Form
                        name="register"
                        onFinish={onFinish}
                        form={form}
                        layout="vertical"
                        className="space-y-4"
                    >
                        <InvitationInfo form={form} userExists={userExists} />

                        {!userExists && <RegistrationFields />}

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                size="large"
                                className="w-full h-12 bg-linear-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500! hover:to-indigo-500! shadow-lg shadow-indigo-500/25 rounded-xl font-semibold text-lg"
                            >
                                {userExists ? "Accept Invitation" : "Create Account"}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default function AcceptInvitePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                    Loading...
                </div>
            }
        >
            <AcceptInviteContent />
        </Suspense>
    );
}
