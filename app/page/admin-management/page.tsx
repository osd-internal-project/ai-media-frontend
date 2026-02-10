"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminManagementPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/page/admin-management/users-management");
  }, [router]);

  return null;
};

export default AdminManagementPage;