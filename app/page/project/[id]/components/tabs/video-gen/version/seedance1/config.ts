import type {
  VideoModelConfig,
  VideoGeneratePayload,
  VideoFormState,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** seeda1: first + last frame images (workflow) plus reference files (Gen tab). */
export const seeda1Config: VideoModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: VideoFormState,
    tempTaskId: string,
  ): VideoGeneratePayload => {
    const firstImage = state.refImageFirst[0] ?? null;
    const lastImage = state.refImageLast[0] ?? null;
    const image: (string | undefined)[] = firstImage
      ? [firstImage.imagePath, lastImage?.imagePath]
      : [];

    return {
      taskId: tempTaskId,
      model: state.selectedAIModel?.modelType ?? undefined,
      prompt: values.prompt as string,
      image,
      files: state.computedFiles,
      sequentialImageGeneration: "auto",
      resolution: state.selectedResolution,
      maxImages: 0,
      watermark: false,
      ratio: state.selectedRatio,
      projectId: state.projectId,
      userId: state.userId,
      width: state.selectedWidth,
      height: state.selectedHeight,
      imageGenerateType: "",
      typeGenerate: "video",
      duration: state.selectedDuration,
      generateAudio: state.selectedAudio,
      draft: state.draftMode,
      organizationId: state.organizationId,
    };
  },
  features: {
    maxDuration: 12,
    uploadMode: "first-last",
    showDraftMode: true,
    supportAudio: true,
  },
  promptSectionProps: {
    showAiAssist: false,
  },
};
