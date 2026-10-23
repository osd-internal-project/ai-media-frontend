"use client";
import { useEffect, useRef, useState } from "react";
import { Carousel, Modal } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import config from "@/app/config";
import {
  AnnouncementCategory,
  IAnnouncement,
} from "@/app/common/announcement.type";

const SEEN_KEY = "announcements-seen";
const SEEN_LIMIT = 50;

export const CATEGORY_META: Record<
  AnnouncementCategory,
  { label: string; color: string }
> = {
  PROMOTION: { label: "Promotion", color: "#6F6ADE" },
  SYSTEM_UPDATE: { label: "System update", color: "#0FEAB6" },
};

// แก้ไขประกาศแล้ว updatedAt เปลี่ยน → แสดงซ้ำ
const seenId = (item: Pick<IAnnouncement, "id" | "updatedAt">) =>
  `${item.id}:${item.updatedAt}`;

const readSeen = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch (error) {
    console.warn("[announcement] cannot read seen list", error);
    return [];
  }
};

const writeSeen = (ids: string[]) => {
  try {
    const merged = Array.from(new Set([...readSeen(), ...ids]));
    localStorage.setItem(SEEN_KEY, JSON.stringify(merged.slice(-SEEN_LIMIT)));
  } catch (error) {
    console.warn("[announcement] cannot save seen list", error);
  }
};

const fetchActive = async (): Promise<IAnnouncement[]> => {
  const base = config.backendCoreUrl;
  if (!base) {
    console.warn("[announcement] NEXT_PUBLIC_API_BASE_URL_CORE is not set");
    return [];
  }
  const res = await fetch(`${base.replace(/\/+$/, "")}/public/announcement`);
  if (!res.ok) throw new Error(`GET /public/announcement ${res.status}`);
  return res.json();
};

type SlideItem = Pick<IAnnouncement, "category" | "title" | "body" | "imageUrl">;

/** ประกาศหนึ่งชิ้น — โปสเตอร์ล้วนเมื่อมีแต่รูป, มีแถบข้อความเมื่อมีเนื้อหาหรือไม่มีรูป (ใช้ซ้ำใน preview ของ admin) */
export function AnnouncementSlide({ item }: { item: SlideItem }) {
  const meta = CATEGORY_META[item.category];
  const showText = !item.imageUrl || Boolean(item.body);
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10 bg-[#020308]">
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- presigned URL จาก TOS ไม่อยู่ใน images.domains
        <img
          src={item.imageUrl}
          alt={item.title}
          className="block max-h-[78vh] w-full object-contain"
        />
      )}
      {showText && (
        <div className="bg-white/[0.05] px-6 py-5 text-left">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-white/70">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ background: meta.color }}
            />
            {meta.label}
          </span>
          <h2 className="mt-2 text-xl font-semibold leading-snug text-white">
            {item.title}
          </h2>
          {item.body && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">
              {item.body}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** popup ประกาศบนหน้า public — แสดงประกาศที่ยังไม่เคยปิด, ปิดแล้วจำไว้ในเครื่อง */
export default function AnnouncementModal() {
  const [items, setItems] = useState<IAnnouncement[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const carousel = useRef<CarouselRef>(null);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    let cancelled = false;
    fetchActive()
      .then((all) => {
        const seen = new Set(readSeen());
        const unseen = all.filter((item) => !seen.has(seenId(item)));
        if (cancelled || unseen.length === 0) return;
        setItems(unseen);
        setOpen(true);
      })
      .catch((error) => console.warn("[announcement] load failed", error));
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    writeSeen(items.map(seenId));
    setOpen(false);
  };

  if (items.length === 0) return null;
  const many = items.length > 1;

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      closable={false}
      centered
      width="min(480px, 92vw)"
      transitionName={reducedMotion ? "" : undefined}
      maskTransitionName={reducedMotion ? "" : undefined}
      styles={{
        content: { padding: 0, background: "transparent", boxShadow: "none" },
        mask: {
          background: "rgba(2, 3, 8, 0.78)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      <div className="relative">
        <button
          type="button"
          onClick={close}
          aria-label="Close announcement"
          className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#020308]/80 text-white transition-colors hover:bg-[#6C72FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6C72FF]"
        >
          <X size={18} />
        </button>

        <Carousel
          ref={carousel}
          dots={false}
          infinite={false}
          speed={reducedMotion ? 0 : 400}
          adaptiveHeight
          afterChange={setIndex}
        >
          {items.map((item) => (
            <div key={item.id}>
              <AnnouncementSlide item={item} />
            </div>
          ))}
        </Carousel>

        {many && (
          <div className="mt-3 flex items-center justify-center gap-3 text-sm text-white/80">
            <button
              type="button"
              aria-label="Previous announcement"
              disabled={index === 0}
              onClick={() => carousel.current?.prev()}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6C72FF] disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span aria-live="polite">
              {index + 1} / {items.length}
            </span>
            <button
              type="button"
              aria-label="Next announcement"
              disabled={index === items.length - 1}
              onClick={() => carousel.current?.next()}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6C72FF] disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
