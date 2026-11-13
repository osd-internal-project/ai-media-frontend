import { useEffect, type ComponentProps } from "react";
import type { ImageInputProps } from "../../chat-generate-image";
import ChatImageInput from "../seedream1/chat-image-input";

const RESOLUTION_OPTIONS = ["1k", "1.5k", "2k"];
// 5.5 accepts 921,600–4,624,220 px; every ratio at these scales stays inside it.
const RESOLUTION_SCALE: Record<string, number> = {
  "1k": 0.5,
  "1.5k": 0.75,
  "2k": 1,
};
const BACKGROUND_OPTIONS = [
  { key: "auto", label: "Auto" },
  { key: "transparent", label: "Transparent" },
];

/** Seedream 5.5 form: 1 image, 1K/1.5K/2K, 10 refs, optional transparent background */
export default function ChatImageInputSeedream3(props: ImageInputProps) {
  const { selectedMaximumImage, setSelectedMaximumImage, setGroupMode } = props;

  // Count/group state is shared with the seedream1 form; 5.5 rejects both.
  useEffect(() => {
    if (selectedMaximumImage !== 1) setSelectedMaximumImage(1);
    setGroupMode(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChatImageInput
      // Props differ only in handler signatures; same cast as image-form-renderer.
      {...(props as unknown as ComponentProps<typeof ChatImageInput>)}
      resolutionOptions={RESOLUTION_OPTIONS}
      resolutionScale={RESOLUTION_SCALE}
      maxRefImages={10}
      showGroupAndCount={false}
      backgroundOptions={BACKGROUND_OPTIONS}
    />
  );
}
