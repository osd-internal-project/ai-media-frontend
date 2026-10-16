import type {
  ImageModelConfig,
  ImageFormState,
  ImageGeneratePayload,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** seedr2: Seedream 5.0 Pro — one image per request, no group generation */
export const seedr2Config: ImageModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: ImageFormState,
    tempTaskId: string,
  ): ImageGeneratePayload => ({
    taskId: tempTaskId,
    model: state.selectedAIModel?.modelType ?? undefined,
    prompt: values.prompt as string,
    image: state.refImages.map((img) => img.imagePath),
    sequentialImageGeneration: "disabled",
    resolution: state.selectedResolution,
    maxImages: 1,
    watermark: false,
    ratio: state.selectedRatio,
    projectId: state.projectId,
    userId: state.userId,
    width: state.selectedWidth,
    height: state.selectedHeight,
    imageGenerateType: "disabled",
    typeGenerate: "image",
    organizationId: state.organizationId,
  }),
  features: {
    maxImages: 1,
    supportReferenceImage: true,
  },
};
