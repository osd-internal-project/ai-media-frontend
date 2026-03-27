import React, { useState } from "react";
import { Button } from "antd";
import { Presentation } from "lucide-react";
import { TPromptGuide } from "@/app/common/prompt-guide.type";
import BrowsePromptModal from "./browse-prompt-modal";

type Props = {
  handleUsePromptGuide: (prompt: TPromptGuide) => void;
  buttonText?: string;
  organizationId?: string;
  selectedModel?: string;
};

export default function PromptTemplateSection({
  handleUsePromptGuide,
  buttonText = "Browse Prompt Templates",
  organizationId,
  selectedModel,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Button
        block
        icon={<Presentation size={14} />}
        onClick={handleOpenModal}
        disabled={!organizationId || !selectedModel}
      >
        {buttonText}
      </Button>
      {organizationId && selectedModel && (
        <BrowsePromptModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onUseTemplate={(template) => {
            handleUsePromptGuide(template);
            handleCloseModal();
          }}
          organizationId={organizationId}
          selectedModel={selectedModel}
        />
      )}
    </>
  );
}
