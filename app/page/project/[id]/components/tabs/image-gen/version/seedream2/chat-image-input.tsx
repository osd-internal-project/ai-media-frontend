import { useEffect, type ComponentProps } from "react";
import type { ImageInputProps } from "../../chat-generate-image";
import ChatImageInput from "../seedream1/chat-image-input";

const RESOLUTION_OPTIONS = ["1k", "2k"];
// Pro caps output at ~4.19M px, so 2K is the base map and 1K is half of it.
const RESOLUTION_SCALE: Record<string, number> = { "1k": 0.5, "2k": 1 };

/** Seedream 5.0 Pro form: seedream1 layout limited to 1 image, 1K/2K, 10 refs */
export default function ChatImageInputSeedream2(props: ImageInputProps) {
  const { selectedMaximumImage, setSelectedMaximumImage, setGroupMode } = props;

  // Count/group state is shared with the seedream1 form; Pro rejects both.
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
    />
  );
}
