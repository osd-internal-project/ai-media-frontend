"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import config from "../config";
import { Spin } from "antd";

export default function Callback() {
    useEffect(() => {
        const run = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            if (!code) return;

            // Provider-agnostic: Keycloak redirects every brokered IdP back here with only
            // ?code, and the backend's token exchange is identical for all of them.
            const res = await fetch(
                `${config.backendUserUrl}/auth/idp/callback`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                }
            );

            const data = await res.json();
            if (!data.access_token) {
                console.error("No token");
                return;
            }
            // ⭐ Login เข้า NextAuth
            await signIn("credentials", {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                idToken: data.id_token,
                redirect: false,
                expiresIn: data.expires_in,
                organizationId: data.recentOrganizationId,
                userId: data.userId,
                systemRole: data.role,
            });

            window.location.href = "/page/project";
        }
        run();
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center bg-[#0E0E12] p-12 rounded-[30px] border border-[#1E1E24] shadow-2xl relative overflow-hidden max-w-md w-full">
                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#3B82F6] rounded-full blur-[80px] opacity-20"></div>

                <Spin size="large" />

                <h2 className="mt-8 text-2xl font-bold text-center z-10">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5BC0EB] to-[#3B82F6] animate-pulse">
                        Authenticating...
                    </span>
                </h2>
                <p className="mt-3 text-sm text-gray-400 font-light z-10 text-center">
                    Please wait while we establish your secure session.
                </p>
            </div>
        </div>
    );
}