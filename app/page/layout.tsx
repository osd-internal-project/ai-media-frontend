import type { Metadata } from "next";
import "../globals.css";
import "antd/dist/reset.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import PrivateLayout from "../components/PrivateLayout";

export const metadata: Metadata = {
  title: "AI CAVE",
  description: "AI-Media Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AntdRegistry>
        <PrivateLayout>{children}</PrivateLayout>
      </AntdRegistry>
    </html>
  );
}
