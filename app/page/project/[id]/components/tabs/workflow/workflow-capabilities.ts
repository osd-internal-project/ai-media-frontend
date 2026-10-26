import type { TMasterModelType } from "@/app/common/master-model-type.type";
import type { WorkflowBlockType } from "@/app/services/workflow.service";

/**
 * Per-model limits for the workflow canvas, keyed by `sendConfig.type`.
 * Parent rules must match the backend `src/workflow/workflow-capabilities.ts`;
 * option lists mirror the Gen tabs (seedream1/2, seedance1/2 inputs).
 */
export interface WorkflowModelCapability {
  acceptsParent: WorkflowBlockType[];
  /** none = always references, only = first/last frame, optional = seedance2 picks one mode per request */
  frames: "none" | "only" | "optional";
  /** Max inputs (parents + uploads) */
  maxInputs: number;
  resolutions: string[];
  /** Image size multiplier per resolution against the 2k base map */
  resolutionScale?: Record<string, number>;
  /** Max images per request (image models) */
  maxImages?: number;
  /** Duration range in seconds (video models) */
  duration?: { min: number; max: number };
}

const CAPABILITIES: Readonly<Record<string, WorkflowModelCapability>> = {
  seedream1: {
    acceptsParent: ["image"],
    frames: "none",
    maxInputs: 8,
    resolutions: ["2k", "4k"],
    resolutionScale: { "4k": 1.414 },
    maxImages: 4,
  },
  seedream2: {
    acceptsParent: ["image"],
    frames: "none",
    maxInputs: 10,
    resolutions: ["1k", "2k"],
    resolutionScale: { "1k": 0.5 },
    maxImages: 1,
  },
  seedance1: {
    acceptsParent: ["image"],
    frames: "only",
    maxInputs: 2,
    resolutions: ["480p", "720p", "1080p"],
    duration: { min: 4, max: 12 },
  },
  seedance2: {
    acceptsParent: ["image", "video"],
    frames: "optional",
    maxInputs: 8,
    resolutions: ["480p", "720p", "1080p"],
    duration: { min: 4, max: 15 },
  },
};

/**
 * Capability of a model, or undefined when the workflow has no rules for it.
 * `sendConfig.resolutions` / `sendConfig.duration` override the type defaults.
 */
export const getCapability = (
  model: TMasterModelType | undefined,
): WorkflowModelCapability | undefined => {
  const key = model?.sendConfig?.type;
  const base = key ? CAPABILITIES[key] : undefined;
  if (!base) return undefined;
  const { resolutions, duration } = model?.sendConfig ?? {};
  return {
    ...base,
    ...(resolutions && { resolutions }),
    ...(duration && { duration }),
  };
};

export type ParentPlan =
  | { ok: true; mode: "reference" | "frames" }
  | { ok: false; reason: string };

/**
 * Decide how parent outputs reach the model, or why they cannot.
 * @param uploadCount Files the user uploads in the form
 */
export const planParents = (
  model: TMasterModelType | undefined,
  parentKinds: WorkflowBlockType[],
  uploadCount: number,
): ParentPlan => {
  if (parentKinds.length === 0) return { ok: true, mode: "reference" };
  const cap = getCapability(model);
  if (!cap) return { ok: false, reason: "โมเดลนี้รับ input จากบล็อกอื่นไม่ได้" };
  const unsupported = parentKinds.find((k) => !cap.acceptsParent.includes(k));
  if (unsupported) {
    return {
      ok: false,
      reason: `ไม่รองรับ ${unsupported === "video" ? "วิดีโอ" : "รูปภาพ"} เป็น input`,
    };
  }
  const total = parentKinds.length + uploadCount;
  if (total > cap.maxInputs) {
    return { ok: false, reason: `รับ input ได้สูงสุด ${cap.maxInputs} ไฟล์` };
  }
  if (cap.frames === "only") return { ok: true, mode: "frames" };
  if (
    cap.frames === "optional" &&
    uploadCount === 0 &&
    parentKinds.length <= 2 &&
    parentKinds.every((k) => k === "image")
  ) {
    return { ok: true, mode: "frames" };
  }
  return { ok: true, mode: "reference" };
};

/** Label for the slot a parent fills, e.g. "First frame" or "Reference". */
export const parentRoleLabel = (
  plan: ParentPlan,
  index: number,
): string => {
  if (!plan.ok) return "ใช้ไม่ได้";
  if (plan.mode === "frames") return index === 0 ? "First frame" : "Last frame";
  return "Reference";
};
