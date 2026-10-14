/**
 * ตัวช่วยดึงข้อมูลของหน้า community สาธารณะ — ใช้จาก server component เท่านั้น
 *
 * ใช้ fetch ของ Next ไม่ใช่ axios instance ของโปรเจกต์ เพราะต้องการ cache/revalidate
 * ของ Next และเพราะหน้าเหล่านี้ render บน server เพื่อให้ OG tag ออกมาใน HTML
 * (ไม่ได้ผูก `server-only` ไว้เพราะยังไม่มี package นั้นในโปรเจกต์)
 */
import {
  PublicCommunityFeedResponse,
  PublicCommunityPost,
} from "@/app/common/community-post.type";
import config from "@/app/config";

/**
 * นานแค่ไหนที่หน้า public ยอมให้ข้อมูลเก่าได้ (วินาที)
 *
 * 60 วินาทีเป็นการแลกที่ตั้งใจ: โพสต์ใหม่ขึ้นช้าได้ไม่เกินหนึ่งนาที แลกกับการที่
 * หน้าแรกไม่ยิง DB ทุกครั้งที่มีคนเปิด ยอดวิว/ไลก์บนหน้า feed จึงเป็นค่าโดยประมาณ
 * ส่วนตัวเลขที่ผู้ใช้กดเองอัปเดตทันทีจากฝั่ง client
 */
const REVALIDATE_SECONDS = 60;

/**
 * base URL ของ core API สำหรับเรียกจากฝั่ง server
 *
 * @returns base URL ที่ตัด / ท้ายออกแล้ว
 * @throws Error เมื่อไม่ได้ตั้ง env — fail เร็วดีกว่าไปพังตอน fetch แล้วงงว่าทำไม 404
 */
function coreBaseUrl(): string {
  const base = config.backendCoreUrl;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL_CORE is not set — the community pages cannot load data"
    );
  }
  return base.replace(/\/+$/, "");
}

/**
 * ดึง feed สาธารณะ
 *
 * @param params การเรียงลำดับ แท็ก และหน้า
 * @returns โพสต์ที่เผยแพร่แล้ว (array ว่างเมื่อเรียกไม่สำเร็จ)
 */
export async function fetchPublicFeed(params: {
  sort?: string;
  tag?: string;
  page?: string;
}): Promise<PublicCommunityFeedResponse> {
  const query = new URLSearchParams();
  if (params.sort) query.set("sort", params.sort);
  if (params.tag) query.set("tag", params.tag);
  if (params.page) query.set("page", params.page);

  try {
    const res = await fetch(
      `${coreBaseUrl()}/public/community?${query.toString()}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) {
      throw new Error(`feed request failed with ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    // หน้าสาธารณะต้องไม่พังทั้งหน้าเพราะ API ล่ม — แสดง empty state แทน
    console.error("Failed to load community feed:", error);
    return { data: [], total: 0, page: 1, pageSize: 0 };
  }
}

/**
 * ดึงโพสต์ 1 ใบตาม slug
 *
 * @param slug slug สาธารณะ
 * @returns โพสต์ หรือ null เมื่อไม่พบ/ไม่ได้เผยแพร่
 */
export async function fetchPublicPost(
  slug: string
): Promise<PublicCommunityPost | null> {
  try {
    const res = await fetch(
      `${coreBaseUrl()}/public/community/${encodeURIComponent(slug)}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    // 404 คือคำตอบที่ถูกต้องสำหรับโพสต์ที่ถูกถอด ไม่ใช่ error ที่ต้อง log
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`post request failed with ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Failed to load community post ${slug}:`, error);
    return null;
  }
}
