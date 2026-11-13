import type { ImageModelConfig } from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";
import { seedr2Config } from "../seedream2/config";

/** seedr3: Seedream 5.5 — Seedream 5.0 Pro payload plus a transparent background */
export const seedr3Config: ImageModelConfig = {
  buildSubmitPayload: (values, state, tempTaskId) => ({
    ...seedr2Config.buildSubmitPayload(values, state, tempTaskId),
    ...(state.selectedBackground === "transparent" && {
      background: "transparent",
    }),
  }),
  features: seedr2Config.features,
};
