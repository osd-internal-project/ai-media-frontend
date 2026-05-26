import type {
  DreamactorModelConfig,
  DreamactorFormState,
  DreamactorGeneratePayload,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** dreac1: DreamActor v1 — portrait image + drive video input */
export const dreac1Config: DreamactorModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: DreamactorFormState,
    tempTaskId: string,
  ): DreamactorGeneratePayload => {
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
      duration: state.selectedDuration,
      projectId: state.projectId,
      userId: state.userId,
      organizationId: state.organizationId,
    };
  },
  features: {
    showSeed: true,
    resolutionOptions: ["720p", "1080p"],
    maxDuration: 30,
  },
};
