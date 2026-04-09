import type { Metadata } from "next";
import "../globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import PrivateLayout from "../components/layout/PrivateLayout";

export const metadata: Metadata = {
  title: "AI CAVE",
  description: "AI-Media Application",
  // robots: {
  //   index: false,
  //   follow: false,
  // },
};

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
