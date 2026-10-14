"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { axiosUser } from "@/app/lib/axios/axios";
import OrganizationMembersServices from "@/app/services/organization-members.service";

/** role ที่อนุมัติงานและจัดการทรัพยากรระดับองค์กรได้ */
const ADMIN_ROLES = ["OWNER", "ADMIN"];

export interface OrgIdentity {
  /** users.userId ตัวจริง — ไม่ใช่ session.user.id ซึ่งเป็น token */
  userId: string;
  organizationId: string;
  orgRole: string | null;
  isOrgAdmin: boolean;
  /** แอดมินระดับแพลตฟอร์ม */
  isSuperAdmin: boolean;
  loading: boolean;
}

/**
 * resolve ตัวตนของผู้ใช้ใน org ปัจจุบัน
 *
 * ต้องมี hook นี้เพราะ `session.user.id` คือ token ไม่ใช่ `users.userId` ที่ API
 * ต้องการ — ทุกหน้าจอในโปรเจกต์นี้ต้องแลกผ่าน backend ก่อนเสมอ ที่นี่ใช้
 * findUserMemberByOrganization ซึ่งคืนทั้ง userId และ role ในครั้งเดียว
 *
 * เดิมอยู่ใน public-social/usePublicSocial.ts — ย้ายออกมาเป็น hook กลางเมื่อ
 * ฟีเจอร์ Communication ต้องใช้ตรรกะเดียวกัน (usePublicSocial re-export ตัวนี้ต่อ)
 *
 * @returns ตัวตนของผู้ใช้ + สิทธิ์ในองค์กร
 */
export function useOrgIdentity(): OrgIdentity {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId || "";
  const token = session?.user?.id || "";

  const orgMemberServices = useMemo(
    () => OrganizationMembersServices(axiosUser),
    []
  );

  const [userId, setUserId] = useState<string>("");
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!organizationId || !token) {
        setLoading(false);
        return;
      }
      try {
        const member = await orgMemberServices.findUserMemberByOrganization(
          organizationId,
          token
        );
        if (cancelled) return;
        setUserId(member?.userId ?? "");
        setOrgRole(member?.role ?? null);
      } catch (error) {
        console.error("Failed to resolve organization membership:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    resolve();
    // guard กัน setState หลัง unmount เวลาสลับ org เร็ว ๆ
    return () => {
      cancelled = true;
    };
  }, [organizationId, token, orgMemberServices]);

  return {
    userId,
    organizationId,
    orgRole,
    isOrgAdmin: orgRole !== null && ADMIN_ROLES.includes(orgRole),
    // เช็คเดียวกับที่ /page/admin-management ใช้ gate หน้าแอดมิน
    isSuperAdmin: session?.user?.systemRole === "SUPER_ADMIN",
    loading,
  };
}
