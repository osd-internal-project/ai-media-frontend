import { getSession } from "next-auth/react";

/** อ่าน session ซ้ำไม่บ่อยกว่านี้ — server ต่ออายุ token เมื่อเหลือ < 90s (options.ts) จึงต้องสั้นกว่านั้น */
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

/** ใส่ token จาก session ที่ SessionProvider โหลดมาแล้ว — request แรกจะได้ไม่ต้องยิง /api/auth/session ซ้ำ */
export function primeAccessToken(token: string): void {
  cached = { token, at: Date.now() };
}

/** ทิ้ง token ที่ cache ไว้ — เรียกเมื่อ backend ตอบ 401 */
export function clearAccessToken(): void {
  cached = null;
}

const LAST_LOGIN_REDIRECT_KEY = "aicave.lastLoginRedirect";
const LOGIN_LOOP_WINDOW_MS = 60 * 1000;
let redirecting = false;

/** แท็บนี้เพิ่งถูกส่งไป login มาแล้ว — SSO พากลับมาได้ session ใหม่ แต่ backend ยังปฏิเสธอยู่ */
function inLoginLoop(): boolean {
  try {
    const last = Number(sessionStorage.getItem(LAST_LOGIN_REDIRECT_KEY));
    sessionStorage.setItem(LAST_LOGIN_REDIRECT_KEY, String(Date.now()));
    return Date.now() - last < LOGIN_LOOP_WINDOW_MS;
  } catch (error) {
    console.error("Login loop check unavailable:", error);
    return false;
  }
}

/** token หมดอายุ/ต่อไม่ได้ → login ใหม่แล้วกลับมาหน้าเดิม; วนซ้ำภายใน 1 นาที → หน้า error แทน */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  // request หลายตัวได้ 401 พร้อมกัน — นับเป็นการเด้งครั้งเดียว
  if (redirecting) return;
  redirecting = true;
  const back = window.location.pathname + window.location.search;
  window.location.href = inLoginLoop()
    ? `/error?error=SessionLoop&callbackUrl=${encodeURIComponent(back)}`
    : `/login?callbackUrl=${encodeURIComponent(back)}`;
}
