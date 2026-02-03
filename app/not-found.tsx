"use client";

import { Button, ConfigProvider, Result, theme } from "antd";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: "#000000",
          colorBgContainer: "transparent",
          colorTextBase: "#f0f0f0",
          colorPrimary: "#1677ff",
        },
      }}
    >
      <div className="relative flex h-screen w-full items-center justify-center bg-black overflow-hidden font-['Prompt']">
        {/* Ambient Background Gradients for Premium Look */}
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-900/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/40 blur-[120px] animate-pulse" />

        {/* Glassmorphism Container */}
        {/* <div className="z-10 rounded-3xl border border-white/10 bg-black/40 p-12 backdrop-blur-xl shadow-2xl transition-all hover:border-white/20"> */}
        <Result
          status="404"
          title={
            <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
              404
            </span>
          }
          subTitle={
            <div className="flex flex-col gap-2 mt-4">
              <span className="text-2xl font-semibold text-white">
                Page Not Found
              </span>
              {/* <span className="text-gray-400 text-lg max-w-md">
                  The page you are looking for might have been removed, had its
                  name changed, or is temporarily unavailable.
                </span> */}
            </div>
          }
          extra={
            <Button
              type="primary"
              size="large"
              shape="round"
              className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-none shadow-lg shadow-blue-500/30 h-12 px-8 text-lg"
              onClick={() => router.push("/page")}
            >
              Back to Home
            </Button>
          }
        />
        {/* </div> */}
      </div>
    </ConfigProvider>
  );
}
