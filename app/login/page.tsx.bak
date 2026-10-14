"use client";
import React, { useCallback, useEffect, useState, type FC } from "react";
import { Button, ConfigProvider, Spin, Typography, theme } from "antd";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const DEFAULT_CALLBACK_URL = "/page/project";

const ERROR_MESSAGES: Record<string, string> = {
  "403": "This account is not registered yet. Please contact your administrator.",
  session_expired: "Your session has expired. Please log in again.",
  token_expired: "Your login session has expired. Please log in again.",
  no_token: "Authentication error. Please log in again.",
  sso_session_expired:
    "Your session has expired due to inactivity or timeout. Please log in again.",
  validation_failed: "Session validation failed. Please log in again.",
};

const Page: FC = () => {
  // Read from window.location to avoid a Suspense boundary for useSearchParams.
  const [callbackUrl, setCallbackUrl] = useState(DEFAULT_CALLBACK_URL);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || DEFAULT_CALLBACK_URL);
    setError(params.get("error"));
    setReady(true);
  }, []);

  const startSso = useCallback(
    (target: string) => signIn("keycloak", { callbackUrl: target }),
    [],
  );

  useEffect(() => {
    // Only bounce on a clean entry. The signIn callback sends rejected users back to
    // /login?error=403, so redirecting while an error is present would loop forever.
    if (ready && !error) {
      startSso(callbackUrl);
    }
  }, [ready, error, callbackUrl, startSso]);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-[1400px] h-[800px] bg-[#0E0E12] rounded-[30px] overflow-hidden flex shadow-2xl relative border border-[#1E1E24]">
          {/* Left Side: SSO status */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative z-10 bg-[#0E0E12]">
            <div className="absolute top-8 left-8 lg:left-12 w-full">
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
                  {error
                    ? "We could not sign you in."
                    : "Redirecting you to secure sign in..."}
                </p>
              </div>

              {error ? (
                <div className="space-y-6">
                  <div className="rounded-lg border border-[#5A2A2A] bg-[#2A1616] px-4 py-3">
                    <Typography.Text style={{ color: "#F5A3A3", fontSize: 13 }}>
                      {ERROR_MESSAGES[error] ?? error}
                    </Typography.Text>
                  </div>

                  <Button
                    onClick={() => startSso(callbackUrl)}
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
                    Try again
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 h-12">
                  <Spin />
                  <span className="text-gray-400 text-sm">
                    Taking you to the sign in page
                  </span>
                </div>
              )}

              <div className="mt-8 text-center text-xs text-gray-500">
                <Link href="/home">
                  <Button
                    type="link"
                    className="text-[#5BC0EB] hover:text-[#3B82F6] text-xs font-medium"
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Visual */}
          <div className="hidden lg:flex w-1/2 bg-[#050505] relative overflow-hidden items-center justify-center">
            <div className="relative w-full h-[110%] animate-float">
              <a href="/home">
                <Image
                  src="/images/login-visual.jpg"
                  alt="Login Visual"
                  fill
                  className="object-cover"
                  priority
                />
              </a>
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
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default Page;
