"use client";

/** ชื่อคีย์ของตัวระบุผู้เยี่ยมชมแบบไม่ระบุตัวตน */
const VISITOR_KEY = "cm_visitor_id";

/** ชื่อคีย์ของธงกันนับวิวซ้ำ (ต่อโพสต์) */
const VIEW_FLAG_PREFIX = "cm_viewed_";

/** กันนับวิวซ้ำนาน 24 ชั่วโมง */
const VIEW_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * อ่าน/สร้างตัวระบุผู้เยี่ยมชม
 *
 * ค่านี้ไม่ผูกกับบัญชีผู้ใช้และไม่ถูกส่งไปที่ไหนนอกจาก endpoint กดถูกใจ ฝั่ง
 * backend เก็บเป็น SHA-256 เท่านั้น จุดประสงค์เดียวคือทำให้การกดถูกใจซ้ำ
 * ของคนเดิมไม่เพิ่มยอด
 *
 * @returns ตัวระบุผู้เยี่ยมชม หรือค่าว่างเมื่อเบราว์เซอร์ไม่ให้ใช้ localStorage
 */
export function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    const created =
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    // โหมดส่วนตัวบางเบราว์เซอร์โยน error ตอนเขียน — ปล่อยให้กดไลก์ไม่ได้
    // ดีกว่าทำให้ทั้งหน้าพัง
    return "";
  }
}

/**
 * ตรวจว่าควรนับวิวของโพสต์นี้หรือไม่ และจดธงไว้เมื่อควรนับ
 *
 * @param slug slug ของโพสต์
 * @returns true เมื่อยังไม่เคยนับใน 24 ชั่วโมงที่ผ่านมา
 */
export function shouldCountView(slug: string): boolean {
  try {
    const key = `${VIEW_FLAG_PREFIX}${slug}`;
    const last = Number(window.localStorage.getItem(key));
    if (last && Date.now() - last < VIEW_TTL_MS) return false;

    window.localStorage.setItem(key, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}
