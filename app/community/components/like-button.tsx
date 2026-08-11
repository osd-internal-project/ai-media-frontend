"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import config from "@/app/config";
import { getVisitorId } from "./visitor-id";

interface LikeButtonProps {
  slug: string;
  /** ยอดจาก server — ใช้เป็นค่าตั้งต้นก่อนที่ client จะรู้ว่าตัวเองเคยกดไว้ไหม */
  initialLikeCount: number;
}

/**
 * ปุ่มถูกใจสำหรับผู้เยี่ยมชมที่ไม่ได้ login
 *
 * อัปเดตแบบ optimistic แล้วค่อยแก้ตามคำตอบจริงจาก backend — การกดไลก์ที่หน่วง
 * รอ network ก่อนขยับจะรู้สึกเสียทันที และ backend เป็นคนตัดสินยอดสุดท้ายอยู่แล้ว
 */
export default function LikeButton({
  slug,
  initialLikeCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [ready, setReady] = useState<boolean>(false);

  // ถามสถานะเดิมของผู้เยี่ยมชมคนนี้ก่อน ไม่งั้นกดซ้ำจะกลายเป็นยกเลิกโดยไม่รู้ตัว
  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) {
      setReady(true);
      return;
    }

    let cancelled = false;
    fetch(
      `${config.backendCoreUrl}/public/community/${encodeURIComponent(
        slug
      )}/liked?visitorId=${encodeURIComponent(visitorId)}`
    )
      .then((res) => (res.ok ? res.json() : { liked: false }))
      .then((data: { liked: boolean }) => {
        if (!cancelled) setLiked(Boolean(data.liked));
      })
      .catch(() => {
        /* ไม่รู้สถานะเดิมก็ยังกดได้ backend เป็นคนตัดสิน */
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleClick = useCallback(async () => {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    const previousLiked = liked;
    const previousCount = likeCount;
    setLiked(!previousLiked);
    setLikeCount(previousCount + (previousLiked ? -1 : 1));

    try {
      const res = await fetch(
        `${config.backendCoreUrl}/public/community/${encodeURIComponent(
          slug
        )}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        }
      );
      if (!res.ok) throw new Error(`like failed with ${res.status}`);

      const data: { liked: boolean; likeCount: number } = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      // ย้อนกลับให้ตรงกับความจริง — ปล่อยให้ตัวเลขค้างผิดแย่กว่าไม่ขยับเลย
      setLiked(previousLiked);
      setLikeCount(previousCount);
    }
  }, [slug, liked, likeCount]);

  return (
    <button
      type="button"
      className="cm-like"
      data-liked={liked}
      disabled={!ready}
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Remove like" : "Like this post"}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      {likeCount.toLocaleString()}
    </button>
  );
}
