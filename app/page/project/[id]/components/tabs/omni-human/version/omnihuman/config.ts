import type {
  OmniModelConfig,
  OmniFormState,
  OmniGeneratePayload,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** omih1: OmniHuman v1 — portrait image + audio input */
export const omih1Config: OmniModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: OmniFormState,
    tempTaskId: string,
  ): OmniGeneratePayload => {
    const firstImage = state.refImageFirst[0] ?? null;
    const lastImage = state.refImageLast[0] ?? null;
    return {
      taskId: tempTaskId,
      model: state.selectedAIModel?.modelType ?? undefined,
      prompt: values.prompt as string,
      image: [
        firstImage?.imagePath ?? null,
        lastImage?.imagePath ?? null,
      ],
      fastMode: state.fastMode,
      seed: values.seed as number,
      resolution: state.selectedResolution,
      projectId: state.projectId,
      userId: state.userId,
      duration: state.selectedDuration,
      organizationId: state.organizationId,
    };
  },
  features: {
    supportAudio: true,
    showSeed: true,
    resolutionOptions: ["720p", "1080p"],
  },
};
