import type {
  AudioModelConfig,
  AudioGeneratePayload,
  AudioFormState,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** Seed Audio 1.0: ref เสียง ≤3 ช่อง (@Audio1..3) หรือรูป 1 รูป · ส่ง rate เฉพาะที่ไม่ใช่ 0 */
export const seedaudio1Config: AudioModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: AudioFormState,
    tempTaskId: string,
  ): AudioGeneratePayload => ({
    taskId: tempTaskId,
    model: state.selectedAIModel?.modelType ?? undefined,
    prompt: values.prompt as string,
    projectId: state.projectId,
    userId: state.userId,
    organizationId: state.organizationId,
    typeGenerate: "audio",
    references: state.references
      .filter((ref) => ref.value.trim())
      .map((ref) =>
        ref.mode === "speaker"
          ? { speaker: ref.value.trim() }
          : { url: ref.value.trim() },
      ),
    image: state.refImage ? [state.refImage.imagePath] : [],
    format: state.format,
    ...(state.sampleRate && { sampleRate: state.sampleRate }),
    ...(state.speechRate && { speechRate: state.speechRate }),
    ...(state.loudnessRate && { loudnessRate: state.loudnessRate }),
    ...(state.pitchRate && { pitchRate: state.pitchRate }),
    ...(state.enableSubtitle && { enableSubtitle: true }),
  }),
  features: {
    maxReferences: 3,
    maxReferenceSeconds: 30,
    formats: ["mp3", "wav", "ogg_opus"],
    sampleRates: [8000, 16000, 24000, 32000, 44100, 48000],
  },
};
