import { getSession } from "next-auth/react";

/** อ่าน session ซ้ำไม่บ่อยกว่านี้ — server ต่ออายุ token ก่อนหมด 5 นาทีอยู่แล้ว */
const SESSION_CACHE_MS = 60 * 1000;

let cached: { token?: string; at: number } | null = null;
let inflight: Promise<string | undefined> | null = null;

/**
 * Keycloak access token ของผู้ใช้ปัจจุบัน สำหรับแนบ `Authorization: Bearer` ไป backend
 * @returns undefined เมื่อไม่ได้ login หรือเรียกจากฝั่ง server
 */
export async function getAccessToken(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  if (cached && Date.now() - cached.at < SESSION_CACHE_MS) return cached.token;
  inflight ??= getSession()
    .then((session) => {
      if (session?.error === "RefreshAccessTokenError") {
        redirectToLogin();
        return undefined;
      }
      cached = { token: session?.accessToken, at: Date.now() };
      return cached.token;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** ทิ้ง token ที่ cache ไว้ — เรียกเมื่อ backend ตอบ 401 */
export function clearAccessToken(): void {
  cached = null;
}

/** token หมดอายุ/ต่อไม่ได้ → login ใหม่แล้วกลับมาหน้าเดิม */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  const back = window.location.pathname + window.location.search;
  window.location.href = `/login?callbackUrl=${encodeURIComponent(back)}`;
}
