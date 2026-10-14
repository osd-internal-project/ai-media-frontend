import { TMasterModelType } from "@/app/common/master-model-type.type";
import { FC } from "react";
export interface VideoFormManagerProps {
  teamView: boolean;
  projectId: string;
  userId?: string;
  activeKey:
    | "image"
    | "video"
    | "omnihumen"
    | "dreamactor"
    | "library"
    | "activity"
    | "editor";
  projectRole?: string | null;
  promptGuideOpenStatus: boolean;
  username?: string;
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  setDisableTab: (disable: boolean) => void;
  onSetPromptTextRef?: React.RefObject<((id: number) => Promise<void>) | null>;
}

import ChatGenerateVideo, { VideoInputProps } from "./chat-generate-video";
import Seeda1Input from "./version/seedance1/chat-video-input";
import Seeda2Input from "./version/seedance2/chat-video-input";
import { getVideoModelConfig } from "../../tab-layout/model-registry";

/** Maps a model's `sendConfig.type` → form component. Payload config is sourced
 *  from the shared model-registry so it cannot drift from the workflow. */
const formComponentByType: Record<string, FC<VideoInputProps>> = {
  seedance1: Seeda1Input as FC<VideoInputProps>,
  seedance2: Seeda2Input as FC<VideoInputProps>,
};

const VideoFormRenderer: FC<VideoFormManagerProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type || "";
  const config = getVideoModelConfig(props.selectedAIModel);
  const FormComponent = formComponentByType[type];

  if (!config || !FormComponent) return <></>;

  return (
    <ChatGenerateVideo
      {...props}
      modelConfig={config}
      FormComponent={FormComponent}
    />
  );
};

export default VideoFormRenderer;
