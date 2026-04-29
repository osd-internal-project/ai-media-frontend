import { TMasterModelType } from "@/app/common/master-model-type.type";
import { FC } from "react";
interface VideoChatProps {
  teamView: boolean;
  projectId: string;
  userId?: string;
  activeKey:
    | "image"
    | "video"
    | "omnihumen"
    | "dreamactor"
    | "library"
    | "activity";
  projectRole?: string | null;
  promptGuideOpenStatus: boolean;
  username?: string; // Added username
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  setDisableTab: (disable: boolean) => void;
  onSetPromptTextRef?: React.MutableRefObject<
    ((id: number) => Promise<void>) | null
  >;
}
import Seeda1 from "./version/seeda1/chat-generate-video";
import Seeda2 from "./version/seeda1/chat-generate-video";

const FormVersionManager: FC<VideoChatProps> = (props) => {
  const { selectedAIModel } = props;
  const description = selectedAIModel?.description?.toLowerCase() || "";
  switch (description) {
    case "seeda1":
      return <Seeda1 {...props} />;
    case "seeda2":
      return <Seeda2 {...props} />;
    default:
      return <></>; // default version
  }
};
export default FormVersionManager;
