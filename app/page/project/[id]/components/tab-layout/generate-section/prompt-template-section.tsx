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
      {/* Compact but unmistakably a button: indigo outline and tint, not a bare text link. */}
      <Button
        data-tour="template"
        size="small"
        icon={<Presentation size={14} />}
        onClick={handleOpenModal}
        disabled={!organizationId || !selectedModel}
        style={{
          alignSelf: "flex-start",
          height: 32,
          paddingInline: 12,
          fontSize: 13,
          fontWeight: 500,
          color: "#A29EF2",
          background: "rgba(111, 106, 222, 0.10)",
          borderColor: "rgba(111, 106, 222, 0.45)",
        }}
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
          modalZIndex={1300}
        />
      )}
    </>
  );
}
