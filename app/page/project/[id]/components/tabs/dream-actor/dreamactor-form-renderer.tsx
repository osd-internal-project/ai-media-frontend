import { type FC } from "react";
import ChatGenerateDreamactor, {
  type DreamactorChatProps,
  type DreamInputProps,
} from "./chat-generate-dreamactor";
import type { DreamactorModelConfig } from "../../tab-layout/types/generator-config.type";
import { dreac1Config } from "./version/dreamactor/config";
import ChatDreamactorInput from "./version/dreamactor/chat-dreamactor-input";

/** Registry maps selectedAIModel.description (lowercase) → { config, FormComponent }.
 *  Add a new entry here when a new DreamActor model is introduced — no orchestrator changes needed. */
const dreamactorModelRegistry: Record<
  string,
  { config: DreamactorModelConfig; FormComponent: FC<DreamInputProps> }
> = {
  dreamactor: {
    config: dreac1Config,
    FormComponent: ChatDreamactorInput as FC<DreamInputProps>,
  },
};

const DreamactorFormRenderer: FC<DreamactorChatProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type.toLowerCase() || "";
  const entry = dreamactorModelRegistry[type];
  if (!entry) return <></>;
  return (
    <ChatGenerateDreamactor
      {...props}
      modelConfig={entry.config}
      FormComponent={entry.FormComponent}
    />
  );
};

export default DreamactorFormRenderer;
