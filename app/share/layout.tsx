import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { kioskFontVariables } from "@/app/components/photo-event/fonts";
import "./share.css";

export const metadata: Metadata = {
  title: "AI CAVE · Your photo",
  description: "Download your AI photo",
};

export default function ShareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AntdRegistry>
      <div className={`share-root ${kioskFontVariables}`}>{children}</div>
    </AntdRegistry>
  );
}
