/** รายการเดียวของ Access (Organization.accessCodes / Plan.accessCodes) ที่ฟอร์ม org และ plan ใช้ร่วมกัน */
export type AccessCodeOption = { label: string; value: string };

export const ACCESS_CODE_GROUPS: { title: string; options: AccessCodeOption[] }[] = [
  {
    title: "Generate",
    options: [
      { label: "Image", value: "image" },
      { label: "Video", value: "video" },
      { label: "OmniHuman", value: "omni" },
      { label: "DreamActor", value: "dream" },
      { label: "Audio", value: "audio" },
    ],
  },
  {
    title: "Tools",
    options: [
      { label: "Workflow", value: "workflow" },
      { label: "Editor", value: "editor" },
    ],
  },
  {
    title: "Share & events",
    options: [
      { label: "Social media", value: "social" },
      { label: "Photo Event", value: "photo_event" },
    ],
  },
];

export const ACCESS_CODES: AccessCodeOption[] = ACCESS_CODE_GROUPS.flatMap((group) => group.options);

/** master_model_type.type → ชื่อกลุ่ม (ค่าใน DB ของ OmniHuman สะกด `omnihumen`) */
export const MODEL_TYPE_LABELS: Record<string, string> = {
  image: "Image",
  video: "Video",
  omnihumen: "OmniHuman",
  dreamactor: "DreamActor",
  audio: "Audio",
};

/** เทียบแบบ set — ลำดับใน DB ไม่แน่นอน */
export const sameSet = <T,>(a: T[] | null | undefined, b: T[] | null | undefined): boolean => {
  const left = new Set(a ?? []);
  const right = new Set(b ?? []);
  return left.size === right.size && [...left].every((value) => right.has(value));
};
