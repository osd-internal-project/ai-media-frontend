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
import { seeda1Config } from "./version/seedance1/config";
import { seeda2Config } from "./version/seedance2/config";
import Seeda1Input from "./version/seedance1/chat-video-input";
import Seeda2Input from "./version/seedance2/chat-video-input";
import type { VideoModelConfig } from "../../tab-layout/types/generator-config.type";

const videoModelRegistry: Record<
  string,
  { config: VideoModelConfig; FormComponent: FC<VideoInputProps> }
> = {
  seedance1: {
    config: seeda1Config,
    FormComponent: Seeda1Input as FC<VideoInputProps>,
  },
  seedance2: {
    config: seeda2Config,
    FormComponent: Seeda2Input as FC<VideoInputProps>,
  },
};

const VideoFormRenderer: FC<VideoFormManagerProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type|| "";
  const entry = videoModelRegistry[type || ""];

  if (!entry) return <></>;

  return (
    <ChatGenerateVideo
      {...props}
      modelConfig={entry.config}
      FormComponent={entry.FormComponent}
    />
  );
};

export default VideoFormRenderer;
