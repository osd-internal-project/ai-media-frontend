"use client";
import React from "react";
import { Button } from "antd";
import { ArrowLeft } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminHeader from "./layout/admin-header";
import AdminTabs from "./layout/admin-tabs";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

interface AdminManagementLayoutProps {
  children: React.ReactNode;
}

const AdminManagementLayout: React.FC<AdminManagementLayoutProps> = ({
  children,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  if (session?.user?.systemRole !== "SUPER_ADMIN") {
    notFound();
  }

  return (
    <div className="flex h-full flex-col gap-4 ">
      <AdminHeader />
      <div
        className="flex flex-col gap-3 rounded-[24px] px-3 md:flex-row md:items-center md:justify-between md:px-4"
      >
        <AdminTabs />
      
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4 md:px-5 md:pb-5"
    
      >
        {children}
      </div>
    </div>
  );
};

export default AdminManagementLayout;
