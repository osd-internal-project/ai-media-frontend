import { type FC } from "react";
import ChatGenerateOmnihumen, {
  type OmniHumanChatProps,
  type OmniInputProps,
} from "./chat-generate-omnihumen";
import type { OmniModelConfig } from "../../tab-layout/types/generator-config.type";
import { omih1Config } from "./version/omnihuman/config";
import ChatOmnihumenInput from "./version/omnihuman/chat-omnihumen-input";

/** Registry maps selectedAIModel.description (lowercase) → { config, FormComponent }.
 *  Add a new entry here when a new OmniHuman model is introduced — no orchestrator changes needed. */
const omniModelRegistry: Record<
  string,
  { config: OmniModelConfig; FormComponent: FC<OmniInputProps> }
> = {
  omnihuman: {
    config: omih1Config,
    FormComponent: ChatOmnihumenInput as FC<OmniInputProps>,
  },
};

const OmnihumenFormRenderer: FC<OmniHumanChatProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type.toLowerCase() || "";
  const entry = omniModelRegistry[type];
  if (!entry) return <></>;
  return (
    <ChatGenerateOmnihumen
      {...props}
      modelConfig={entry.config}
      FormComponent={entry.FormComponent}
    />
  );
};

export default OmnihumenFormRenderer;
