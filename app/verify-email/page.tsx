"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Spin, message } from "antd";
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import UserServices from "../services/users.service";
import { axiosUser } from "../lib/axios/axios";

const userService = UserServices(axiosUser);

const VerifyEmailContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (token) {
            handleVerify(token);
        } else {
            setStatus("error");
        }
    }, [token]);

    const handleVerify = async (token: string) => {
        try {
            await userService.verifyEmail(token);
            setStatus("success");
            messageApi.success("Email verified successfully!");
            router.push("/login");
        } catch (error) {
            console.error("Error verifying email:", error);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            {contextHolder}
            <div className="w-full max-w-[1400px] h-[800px] bg-[#0E0E12] rounded-[30px] overflow-hidden flex shadow-2xl relative border border-[#1E1E24]">
                {/* Left Side: Content */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative z-10 bg-[#0E0E12]">
                    {/* Logo */}
                    <div className="absolute top-8 left-8 lg:left-12">
                        <div className="relative w-8 h-8">
                            <Image src="/images/logo-1.png" alt="Logo" fill className="object-contain" />
                        </div>
                    </div>

                    <div className="max-w-md w-full mx-auto text-center">
                        {status === "loading" && (
                            <div className="flex flex-col items-center">
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#5465FF' }} spin />} />
                                <h1 className="text-2xl font-bold text-white mt-8 mb-2">Verifying your email</h1>
                                <p className="text-gray-400">Please wait while we verify your email address...</p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="flex flex-col items-center animate-fadeIn">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircleOutlined style={{ fontSize: 40, color: '#22c55e' }} />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-4">Email Verified!</h1>
                                <p className="text-gray-400 mb-8">
                                    Your email has been successfully verified. You can now access your account.
                                </p>
                                <Link href="/login" className="w-full">
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{
                                            backgroundColor: "#5465FF",
                                            borderColor: "#5465FF",
                                            height: "48px",
                                            borderRadius: "12px",
                                            fontWeight: 600,
                                            width: "100%",
                                            fontSize: "16px",
                                        }}
                                    >
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="flex flex-col items-center animate-fadeIn">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                    <CloseCircleOutlined style={{ fontSize: 40, color: '#ef4444' }} />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-4">Verification Failed</h1>
                                <p className="text-gray-400 mb-8">
                                    The verification link is invalid or has expired. Please request a new verification link or contact support.
                                </p>
                                <Link href="/login" className="w-full">
                                    <Button
                                        size="large"
                                        style={{
                                            backgroundColor: "#1A1D21",
                                            borderColor: "#333",
                                            color: "white",
                                            height: "48px",
                                            borderRadius: "12px",
                                            fontWeight: 600,
                                            width: "100%",
                                            fontSize: "16px",
                                        }}
                                        className="hover:!text-[#5465FF] hover:!border-[#5465FF]"
                                    >
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <div className="flex justify-center items-center text-[10px] text-gray-600 gap-4">
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
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black flex items-center justify-center text-white">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#5465FF' }} spin />} />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
