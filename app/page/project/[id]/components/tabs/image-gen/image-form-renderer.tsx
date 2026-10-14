import { type FC } from "react";
import ChatGenerateImage, {
  type ImageChatProps,
  type ImageInputProps,
} from "./chat-generate-image";
import { getImageModelConfig } from "../../tab-layout/model-registry";
import ChatImageInput from "./version/seedream1/chat-image-input";

/** Maps a model's `sendConfig.type` → form component. Payload config is sourced
 *  from the shared model-registry so it cannot drift from the workflow. */
const formComponentByType: Record<string, FC<ImageInputProps>> = {
  seedream1: ChatImageInput as FC<ImageInputProps>,
};

const ImageFormRenderer: FC<ImageChatProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type || "";
  const config = getImageModelConfig(props.selectedAIModel);
  const FormComponent = formComponentByType[type];

  if (!config || !FormComponent) return <></>;

  return (
    <ChatGenerateImage
      {...props}
      modelConfig={config}
      FormComponent={FormComponent}
    />
  );
};

export default ImageFormRenderer;
