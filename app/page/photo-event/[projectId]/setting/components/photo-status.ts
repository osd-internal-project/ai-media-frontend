import type { IPhotoEventPhoto } from "@/app/common/photo-event.type";

export type TPhotoUsage = "unused" | "generating" | "generated" | "failed";

export const PHOTO_USAGE_META: Record<TPhotoUsage, { label: string; color: string }> = {
  unused: { label: "Not used", color: "default" },
  generating: { label: "Generating", color: "processing" },
  generated: { label: "Generated", color: "success" },
  failed: { label: "Failed", color: "error" },
};

/** รูปหนึ่งใบถูก generate ได้หลายครั้ง — งานที่กำลังรันสำคัญสุด ตามด้วยงานที่สำเร็จ */
export const getPhotoUsage = (photo: IPhotoEventPhoto): TPhotoUsage => {
  const statuses = photo.generations.map((g) => g.status);
  if (statuses.some((s) => s === "pending" || s === "processing")) return "generating";
  if (statuses.includes("success")) return "generated";
  if (statuses.includes("failed")) return "failed";
  return "unused";
};
