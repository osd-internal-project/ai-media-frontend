import type { TMasterModelType } from "@/app/common/master-model-type.type";
import type {
  ImageModelConfig,
  VideoModelConfig,
} from "./types/generator-config.type";
import { seedr1Config } from "../tabs/image-gen/version/seedream1/config";
import { seeda1Config } from "../tabs/video-gen/version/seedance1/config";
import { seeda2Config } from "../tabs/video-gen/version/seedance2/config";

/**
 * Single source of truth mapping a model's `sendConfig.type` to its payload
 * config (`buildSubmitPayload` + `features`). Config objects are plain data
 * (no React components) so this module is cheap to import anywhere, including
 * the workflow form.
 *
 * The form renderers keep their own type→FormComponent maps; only the config
 * lookup is centralised here so the workflow and the Gen tabs cannot drift.
 */
const imageConfigByType: Readonly<Record<string, ImageModelConfig>> = {
  seedream1: seedr1Config,
};

const videoConfigByType: Readonly<Record<string, VideoModelConfig>> = {
  seedance1: seeda1Config,
  seedance2: seeda2Config,
};

/**
 * Resolve the image model config for a given model.
 * @param model The selected master model (uses `sendConfig.type` as the key).
 * @returns The matching `ImageModelConfig`, or `undefined` if unsupported.
 */
export const getImageModelConfig = (
  model: TMasterModelType | undefined,
): ImageModelConfig | undefined => {
  const type = model?.sendConfig?.type;
  return type ? imageConfigByType[type] : undefined;
};

/**
 * Resolve the video model config for a given model.
 * @param model The selected master model (uses `sendConfig.type` as the key).
 * @returns The matching `VideoModelConfig`, or `undefined` if unsupported.
 */
export const getVideoModelConfig = (
  model: TMasterModelType | undefined,
): VideoModelConfig | undefined => {
  const type = model?.sendConfig?.type;
  return type ? videoConfigByType[type] : undefined;
};
