import type {
  VideoModelConfig,
  VideoGeneratePayload,
  VideoFormState,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** seeda2: uses unified multi-file array; empty image array */
export const seeda2Config: VideoModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: VideoFormState,
    tempTaskId: string,
  ): VideoGeneratePayload => ({
    taskId: tempTaskId,
    model: state.selectedAIModel?.modelType ?? undefined,
    prompt: values.prompt as string,
    image: [],
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
  }),
  features: {
    maxDuration: 15,
    uploadMode: "multi-file",
    showDraftMode: true,
    supportAudio: true,
  },
  promptSectionProps: {
    showAiAssist: false,
  },
};
