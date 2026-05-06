"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Input, Button, Spin, notification, Divider, FormInstance, message, Checkbox } from "antd";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import {
    LoadingOutlined,
} from "@ant-design/icons";
import { User, Lock, Mail, Building, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    confirmPassword?: string;
    agreement?: boolean;
}

const organizationService = OrganizationServices(axiosUser);

const FORM_ITEM_MARGIN = 12;
const INPUT_HEIGHT = 42;
const INPUT_STYLE = {
    backgroundColor: "#1A1D21",
    border: "1px solid #333",
    color: "white",
    borderRadius: "0.5rem",
    height: `${INPUT_HEIGHT}px`,
};
const LABEL_STYLE = { color: "#9ca3af", fontSize: "12px", marginLeft: "4px" };

const splitFullName = (fullname?: string) => {
    const trimmedName = fullname?.trim() ?? "";

    if (!trimmedName) {
        return { firstName: "", lastName: "" };
    }

    const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);

    return {
        firstName,
        lastName: lastNameParts.join(" "),
    };
};

const InvitationInfo = ({ form, userExists }: { form: FormInstance; userExists: boolean }) => {
    return (
        <div className="mb-5 rounded-xl border border-[#333] bg-[#1A1D21] p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">
                        Invited Email
                    </p>
                    <p className="text-white font-medium flex items-center gap-2 text-sm overflow-hidden text-ellipsis">
                        <Mail className="w-4 h-4 text-[#5BC0EB]" />
                        <span className="truncate">{form.getFieldValue("email")}</span>
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">
                        Invited Organization
                    </p>
                    <p className="text-white font-medium flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-gray-400" />
                        {form.getFieldValue("organizationName")}
                    </p>
                </div>
            </div>
            {userExists && (
                <div className="mt-4 pt-4 border-t border-[#333]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">
                        Full Name
                    </p>
                    <p className="text-white font-medium flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-[#5BC0EB]" /> {form.getFieldValue("fullname")}
                    </p>
                </div>
            )}
        </div>
    );
};

const RegistrationFields = () => {
    return (
        <>
            <div className="grid grid-cols-1 gap-x-[14px] gap-y-0 md:grid-cols-2">
                <Form.Item
                    name="firstName"
                    label={
                        <span style={LABEL_STYLE}>
                            First Name
                        </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: `${FORM_ITEM_MARGIN}px` }}
                >
                    <Input
                        placeholder="First Name"
                        style={INPUT_STYLE}
                    />
                </Form.Item>

                <Form.Item
                    name="lastName"
                    label={
                        <span style={LABEL_STYLE}>
                            Last Name
                        </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: `${FORM_ITEM_MARGIN}px` }}
                >
                    <Input
                        placeholder="Last Name"
                        style={INPUT_STYLE}
                    />
                </Form.Item>

                <Form.Item
                    name="username"
                    label={
                        <span style={LABEL_STYLE}>
                            Username
                        </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: `${FORM_ITEM_MARGIN}px` }}
                >
                    <Input
                        placeholder="Username"
                        style={INPUT_STYLE}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label={
                        <span style={LABEL_STYLE}>
                            Email Address
                        </span>
                    }
                    rules={[
                        { required: true, message: "Required" },
                        { type: "email", message: "Invalid email" },
                    ]}
                    style={{ marginBottom: `${FORM_ITEM_MARGIN}px` }}
                >
                    <Input
                        prefix={<Mail style={{ color: "gray", width: "16px", height: "16px", marginRight: "8px" }} />}
                        placeholder="Email"
                        disabled
                        style={INPUT_STYLE}
                    />
                </Form.Item>

                <Form.Item
                    name="phoneNumber"
                    label={
                        <span style={LABEL_STYLE}>
                            Phone number
                        </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: `${FORM_ITEM_MARGIN}px` }}
                >
                    <PhoneInput
                        country={"th"}
                        inputStyle={{
                            width: "100%",
                            height: `${INPUT_HEIGHT}px`,
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
                            height: `${INPUT_HEIGHT}px`,
                        }}
                        dropdownStyle={{
                            backgroundColor: "#1A1D21",
                            color: "black",
                        }}
                        placeholder="Phone number"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={
                        <span style={LABEL_STYLE}>
                            Password
                        </span>
                    }
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: `${FORM_ITEM_MARGIN}px` }}
                >
                    <Input.Password
                        placeholder="*************"
                        style={INPUT_STYLE}
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label={
                        <span style={LABEL_STYLE}>
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
                    style={{ marginBottom: `${FORM_ITEM_MARGIN}px` }}
                >
                    <Input.Password
                        placeholder="*************"
                        style={INPUT_STYLE}
                    />
                </Form.Item>
            </div>
            <Form.Item
                name="agreement"
                valuePropName="checked"
                className="mb-5"
                rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(new Error("Should accept terms")),
                    },
                  ]}
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
        </>
    );
};

const AcceptInviteContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [form] = Form.useForm();
    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userExists, setUserExists] = useState(false);
    const [isError, setIsError] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [notificationApi, contextHolderNotification] = notification.useNotification();


    useEffect(() => {
        if (token) {
            verifyToken(token)
        } else {
            // If no token, show error immediately or handle appropriately
            setChecking(false);
            setIsError(true);
        }
    }, [token]);

    const verifyToken = async (token: string) => {
        try {
            const verifyToken = await organizationService.invitationDetail(token)
            if (verifyToken) {
                const invitationDetail: TInvitationDetail = verifyToken;
                const { firstName, lastName } = splitFullName(invitationDetail.fullname);
                form.setFieldsValue({
                    email: invitationDetail.email,
                    organizationName: invitationDetail.organizationName,
                    role: invitationDetail.role,
                    organizationId: invitationDetail.organizationId,
                    firstName,
                    lastName,
                    fullname: invitationDetail.fullname,
                })
                setUserExists(invitationDetail.hasAccount);
                setIsError(false);
            } else {
                setIsError(true);
            }
        } catch (error) {
            console.error("Error verifying token:", error);
            setIsError(true);
        } finally {
            setChecking(false);
        }
    }

    const onFinish = async (values: FormValues) => {
        setSubmitting(true);
        try {
            // Remove confirmPassword and agreement from payload
            const { confirmPassword, agreement, firstName, lastName, ...registerData } = values;
            const fullname = [firstName, lastName].filter(Boolean).join(" ").trim();

            const response = await organizationService.acceptInvitation({
                ...registerData,
                fullname,
                token: token ?? ""
            });
            if (response) {
                messageApi.success("Invitation accepted successfully");
                router.push("page/project");
            }
        } catch (error: any) {
            console.error("Error accepting invitation:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                notificationApi.error({ message: `${error.response.data.message}` });
            } else {
                notificationApi.error({ message: `${error.message}` });
            }
        } finally {
            setSubmitting(false);
        }
    };


    if (checking) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#5465FF' }} spin />} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="w-full max-w-[600px] h-[400px] bg-[#0E0E12] rounded-[30px] flex flex-col items-center justify-center border border-[#1E1E24] shadow-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
                    <p className="text-gray-400 mb-8 max-w-sm">
                        The invitation link is invalid or has expired. Please contact your administrator for a new invitation.
                    </p>
                    <Link href="/login">
                        <Button
                            type="primary"
                            size="large"
                            className="bg-[#5465FF] h-12 px-8 rounded-xl font-semibold border-none hover:bg-[#4351CC]"
                        >
                            Back to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-3 text-white sm:p-4 lg:flex lg:items-center lg:justify-center">
            {contextHolder}
            {contextHolderNotification}
            <div className="relative w-full max-w-[1400px] rounded-[24px] border border-[#1E1E24] bg-[#0E0E12] shadow-2xl lg:flex lg:h-[800px] lg:overflow-hidden lg:rounded-[30px]">
                {/* Left Side: Form */}
                <div className="relative z-10 flex w-full flex-col bg-[#0E0E12] px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:w-1/2 lg:justify-center lg:overflow-y-auto lg:p-12 custom-scrollbar">
                    {/* Logo */}
                    <div className="absolute left-4 top-4 sm:left-6 sm:top-6 lg:left-12 lg:top-8">
                        <div className="relative w-8 h-8">
                            <Image src="/images/logo-1.png" alt="Logo" fill className="object-contain" />
                        </div>
                    </div>

                    <div className="mx-auto mt-12 w-full max-w-md sm:mt-14 lg:mt-8">
                        <div className="mb-6 sm:mb-8">
                            <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                                {userExists ? "Accept Invitation" : "Create Account"}
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {userExists ? "You have been invited to join an organization." : "Join the organization with your email."}
                            </p>
                        </div>

                        <Form
                            name="accept-invite"
                            onFinish={onFinish}
                            form={form}
                            layout="vertical"
                            requiredMark={false}
                            className="space-y-3"
                        >
                            <InvitationInfo form={form} userExists={userExists} />

                            {!userExists && <RegistrationFields />}

                            <Form.Item className="mb-0 mt-6">
                                <Button
                                    htmlType="submit"
                                    loading={submitting}
                                    style={{
                                        backgroundColor: "#5465FF",
                                        color: "white",
                                        height: "44px",
                                        borderRadius: "12px",
                                        fontWeight: 600,
                                        border: "none",
                                        width: "100%",
                                        fontSize: "15px",
                                    }}
                                >
                                    {userExists ? "Accept and Join now" : "Create account"}
                                </Button>
                                {!userExists && (
                                    <div className="mt-4 text-center">
                                        <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">Back</Link>
                                    </div>
                                )}
                            </Form.Item>
                        </Form>

                        <div className="mt-8 flex items-center justify-between text-[10px] text-gray-600 sm:mt-12">
                            <p>aicave.ai @ 2026</p>
                            <Link href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Visual */}
                <div className="hidden lg:flex w-1/2 bg-[#050505] relative overflow-hidden items-center justify-center">
                    <div className="relative w-full h-full animate-float">
                        <Image
                            src="/images/login-visual.jpg"
                            alt="Visual"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay for integration */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-transparent opacity-50"></div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                input::placeholder {
                    color: #4b5563 !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0E0E12;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                 .ant-input-password input {
                    background-color: transparent !important;
                    color: white !important;
                }
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
            `}</style>
        </div>
    );
};

export default function AcceptInvitePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black flex items-center justify-center text-white">
                    Loading...
                </div>
            }
        >
            <AcceptInviteContent />
        </Suspense>
    );
}
