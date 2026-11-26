"use client";
import React from "react";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminTabs from "./layout/admin-tabs";

interface AdminManagementLayoutProps {
  children: React.ReactNode;
}

const AdminManagementLayout: React.FC<AdminManagementLayoutProps> = ({
  children,
}) => {
  const { data: session } = useSession();

  if (session?.user?.systemRole !== "SUPER_ADMIN") {
    notFound();
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="px-3 md:px-4">
        <AdminTabs />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-5 md:pb-5">
        {children}
      </div>
    </div>
  );
};

export default AdminManagementLayout;
