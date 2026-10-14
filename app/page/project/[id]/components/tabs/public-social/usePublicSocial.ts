"use client";

import { OrgIdentity, useOrgIdentity } from "@/app/hooks/useOrgIdentity";

/**
 * ตัวตนของผู้ใช้ใน org ปัจจุบัน สำหรับแท็บ Public Social
 *
 * ตัวจริงย้ายไปอยู่ที่ app/hooks/useOrgIdentity.ts แล้ว เพราะฟีเจอร์ Communication
 * ต้องใช้ตรรกะเดียวกัน — ที่นี่คง export เดิมไว้เพื่อไม่ให้แท็บ Public Social
 * ต้องแก้ตาม
 */
export type PublicSocialContext = OrgIdentity;

export const usePublicSocial = useOrgIdentity;
