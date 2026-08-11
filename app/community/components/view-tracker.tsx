"use client";

import { useEffect } from "react";
import config from "@/app/config";
import { shouldCountView } from "./visitor-id";

interface ViewTrackerProps {
  slug: string;
}

/**
 * นับยอดวิวของโพสต์ 1 ครั้งต่อผู้เยี่ยมชมต่อ 24 ชั่วโมง
 *
 * ไม่ render อะไรเลย และไม่แสดง error ให้ผู้เยี่ยมชมเห็น — ยอดวิวที่นับพลาด
 * ไปหนึ่งครั้งไม่ใช่เรื่องที่คนอ่านหน้านี้ต้องรับรู้หรือแก้ไข
 */
export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    if (!shouldCountView(slug)) return;

    const controller = new AbortController();
    fetch(
      `${config.backendCoreUrl}/public/community/${encodeURIComponent(
        slug
      )}/view`,
      { method: "POST", signal: controller.signal }
    ).catch(() => {
      /* fire-and-forget */
    });

    return () => controller.abort();
  }, [slug]);

  return null;
}
