import type {
  ImageModelConfig,
  ImageFormState,
  ImageGeneratePayload,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** seedr1: standard image generation — reference images as flat array */
export const seedr1Config: ImageModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: ImageFormState,
    tempTaskId: string,
  ): ImageGeneratePayload => ({
    taskId: tempTaskId,
    model: state.selectedAIModel?.modelType ?? undefined,
    prompt: values.prompt as string,
    image: state.refImages.map((img) => img.imagePath),
    sequentialImageGeneration: "auto",
    resolution: state.selectedResolution,
    maxImages: state.selectedMaximumImage,
    watermark: false,
    ratio: state.selectedRatio,
    projectId: state.projectId,
    userId: state.userId,
    width: state.selectedWidth,
    height: state.selectedHeight,
    imageGenerateType: state.groupMode,
    typeGenerate: "image",
    organizationId: state.organizationId,
  }),
  features: {
    maxImages: 4,
    supportReferenceImage: true,
  },
};
