import { type FC } from "react";
import ChatGenerateImage, {
  type ImageChatProps,
  type ImageInputProps,
} from "./chat-generate-image";
import type { ImageModelConfig } from "../../tab-layout/types/generator-config.type";
import { seedr1Config } from "./version/seedream1/config";
import ChatImageInput from "./version/seedream1/chat-image-input";

/** Registry maps selectedAIModel.description (lowercase) → { config, FormComponent }.
 *  Add a new entry here when a new image model is introduced — no orchestrator changes needed. */
const imageModelRegistry: Record<
  string,
  { config: ImageModelConfig; FormComponent: FC<ImageInputProps> }
> = {
  seedream1: {
    config: seedr1Config,
    FormComponent: ChatImageInput as FC<ImageInputProps>,
  },
};

const ImageFormRenderer: FC<ImageChatProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type.toLowerCase() || "";
  const entry = imageModelRegistry[type || ""];

  if (!entry) return <></>;

  return (
    <ChatGenerateImage
      {...props}
      modelConfig={entry.config}
      FormComponent={entry.FormComponent}
    />
  );
};

export default ImageFormRenderer;
