import type { TMasterModelType } from "@/app/common/master-model-type.type";

export interface RefImage {
  name: string;
  status: string;
  uid: string;
  url: string;
  imagePath: string;
}

export interface ComputedFileRef {
  type: string;
  url: string;
}

/** All form state passed from the generic orchestrator into buildSubmitPayload */
export interface VideoFormState {
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  /** First frame reference (first-last upload mode) */
  refImageFirst: RefImage[];
  /** Last frame reference (first-last upload mode) */
  refImageLast: RefImage[];
  /** Multi-file references (multi-file upload mode) */
  refImages: RefImage[];
  /** Resolved {type, url} file refs for multi-file mode */
  computedFiles: ComputedFileRef[];
  selectedResolution: string;
  selectedRatio: string;
  selectedWidth: number;
  selectedHeight: number;
  selectedDuration: number;
  selectedAudio: boolean;
  draftMode: boolean;
  projectId: string;
  userId: string;
  organizationId: string | undefined;
  username: string;
}

/** The payload emitted to socket "generate:video" */
export interface VideoGeneratePayload {
  taskId: string;
  model: string | undefined;
  prompt: string;
  image: (string | undefined)[];
  files: ComputedFileRef[];
  sequentialImageGeneration: string;
  resolution: string;
  maxImages: number;
  watermark: boolean;
  ratio: string;
  projectId: string;
  userId: string | undefined;
  width: number;
  height: number;
  imageGenerateType: string;
  typeGenerate: string;
  duration: number;
  generateAudio: boolean;
  draft: boolean;
  organizationId: string | undefined;
}

export interface VideoModelFeatures {
  maxDuration?: number;
  /** Controls which upload UI is shown and which state is populated */
  uploadMode?: "first-last" | "multi-file";
  showDraftMode?: boolean;
  supportAudio?: boolean;
}

export interface VideoModelConfig {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: VideoFormState,
    tempTaskId: string,
  ) => VideoGeneratePayload;
  features?: VideoModelFeatures;
  promptSectionProps?: {
    showAiAssist?: boolean;
  };
}

// ─── Image Gen ────────────────────────────────────────────────────────────────

export interface ImageFormState {
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  refImages: RefImage[];
  selectedResolution: string;
  selectedRatio: string;
  selectedWidth: number;
  selectedHeight: number;
  selectedMaximumImage: number;
  groupMode: string;
  projectId: string;
  userId: string;
  organizationId: string | undefined;
  username: string;
}

export interface ImageGeneratePayload {
  taskId: string;
  model: string | undefined;
  prompt: string;
  image: string[];
  sequentialImageGeneration: string;
  resolution: string;
  maxImages: number;
  watermark: boolean;
  ratio: string;
  projectId: string;
  userId: string | undefined;
  width: number;
  height: number;
  imageGenerateType: string;
  typeGenerate: string;
  organizationId: string | undefined;
}

export interface ImageModelConfig {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: ImageFormState,
    tempTaskId: string,
  ) => ImageGeneratePayload;
  features?: {
    maxImages?: number;
    supportReferenceImage?: boolean;
  };
}

// ─── Omni-Human ───────────────────────────────────────────────────────────────

export interface OmniFormState {
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  /** Portrait image reference */
  refImageFirst: RefImage[];
  /** Audio file reference */
  refImageLast: RefImage[];
  selectedResolution: string;
  selectedRatio: string;
  selectedDuration: number;
  fastMode: boolean;
  projectId: string;
  userId: string;
  organizationId: string | undefined;
  username: string;
}

export interface OmniGeneratePayload {
  taskId: string;
  model: string | undefined;
  prompt: string;
  image: (string | null)[];
  fastMode: boolean;
  seed: number;
  resolution: string;
  projectId: string;
  userId: string | undefined;
  duration: number;
  organizationId: string | undefined;
}

export interface OmniModelConfig {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: OmniFormState,
    tempTaskId: string,
  ) => OmniGeneratePayload;
  features?: {
    supportAudio?: boolean;
    showSeed?: boolean;
    resolutionOptions?: string[];
  };
}

// ─── Dream Actor ──────────────────────────────────────────────────────────────

export interface DreamactorFormState {
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  /** Portrait image reference */
  refImageFirst: RefImage[];
  /** Drive video reference */
  refImageLast: RefImage[];
  selectedResolution: string;
  selectedRatio: string;
  selectedDuration: number;
  fastMode: boolean;
  projectId: string;
  userId: string;
  organizationId: string | undefined;
  username: string;
}

export interface DreamactorGeneratePayload {
  taskId: string;
  model: string | undefined;
  prompt: string;
  image: (string | null)[];
  fastMode: boolean;
  seed: number;
  resolution: string;
  duration: number;
  projectId: string;
  userId: string | undefined;
  organizationId: string | undefined;
}

export interface DreamactorModelConfig {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: DreamactorFormState,
    tempTaskId: string,
  ) => DreamactorGeneratePayload;
  features?: {
    showSeed?: boolean;
    resolutionOptions?: string[];
    maxDuration?: number;
  };
}
