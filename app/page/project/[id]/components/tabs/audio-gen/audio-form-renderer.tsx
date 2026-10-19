import { FC } from "react";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import ChatGenerateAudio, { AudioInputProps } from "./chat-generate-audio";
import SeedAudio1Input from "./version/seedaudio1/chat-audio-input";
import { getAudioModelConfig } from "../../tab-layout/model-registry";

export interface AudioFormRendererProps {
  teamView: boolean;
  projectId: string;
  userId?: string;
  activeKey: string;
  projectRole?: string | null;
  username?: string;
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  setDisableTab: (disable: boolean) => void;
}

/** Maps a model's `sendConfig.type` → form component. Payload config comes from model-registry. */
const formComponentByType: Record<string, FC<AudioInputProps>> = {
  seedaudio1: SeedAudio1Input,
};

const AudioFormRenderer: FC<AudioFormRendererProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type || "";
  const config = getAudioModelConfig(props.selectedAIModel);
  const FormComponent = formComponentByType[type];

  if (!config || !FormComponent) return <></>;

  return (
    <ChatGenerateAudio
      {...props}
      modelConfig={config}
      FormComponent={FormComponent}
    />
  );
};

export default AudioFormRenderer;
