import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { kioskFontVariables } from "@/app/components/photo-event/fonts";

export const metadata: Metadata = {
  title: "AI CAVE · Photo Event",
  description: "AI photo booth",
};

/** อยู่นอก app/page จึงไม่มี sidebar/header — ใช้เต็มจอสำหรับ kiosk */
export default function EventLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AntdRegistry>
      <div className={kioskFontVariables}>{children}</div>
    </AntdRegistry>
  );
}
