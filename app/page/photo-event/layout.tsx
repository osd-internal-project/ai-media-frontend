"use client";

import React from "react";
import { Result, Spin } from "antd";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import {
  hasAccessCode,
  organizationPermissions,
  PHOTO_EVENT_ACCESS_CODE,
} from "@/app/utils/permissions";

/** กันการเข้า /page/photo-event/* ตรงจาก URL — เมนูซ่อนด้วยสิทธิ์ชุดเดียวกัน */
export default function PhotoEventLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { organizationRole, accessCodes } = useOrganization();
  const { data: session } = useSession();
  if (accessCodes === undefined) {
    return (
      <div className="flex justify-center py-16">
        <Spin />
      </div>
    );
  }
  // ต้องผ่านก่อนเช็ค role — SUPER_ADMIN ก็เข้าไม่ได้ถ้า org ยังไม่เปิด
  if (!hasAccessCode(accessCodes, PHOTO_EVENT_ACCESS_CODE)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Photo Event is not enabled for this organization."
      />
    );
  }
  // SUPER_ADMIN ของระบบเข้าได้ทุก org แม้ role ใน org นี้จะต่ำกว่า ADMIN
  const effectiveRole =
    session?.user?.systemRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : organizationRole;
  return (
    <PermissionGuard
      roles={organizationPermissions.managePhotoEvent}
      userRole={effectiveRole}
      fallback={
        <Result
          status="403"
          title="403"
          subTitle="Only organization owners, admins and super admins can manage Photo Event."
        />
      }
    >
      {children}
    </PermissionGuard>
  );
}
