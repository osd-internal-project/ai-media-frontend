import React, { useState } from "react";
import { Loader2, RefreshCw, Wand2 } from "lucide-react";
import { Button, Flex, Form, Mentions, Typography } from "antd";
import type { ChatGenerateType } from "@/app/services/chat-assistant.types";
import AssistantModal from "../../../../assistant/assistant-modal";

type Props = {
  semantic: Record<string, any>;
  onAiAssist?: (prompt: string) => Promise<string | void> | string | void;
  isAiAssisting?: boolean;
  fieldName?: string;
  title?: string;
  placeholder?: string;
  requiredMessage?: string;
  maxLength?: number;
  rows?: number;
  showAiAssist?: boolean;
  showRegenerateButton?: boolean;
  aiAssistLabel?: string;
  aiAssistThinkingLabel?: string;
  regenerateLabel?: string;
  required?: boolean;
  mentionOptions?: any[];
  projectId: string;
  /** แท็บ generate ที่เปิดอยู่ — กำหนดบทบาทของผู้ช่วยแชท */
  generateType?: ChatGenerateType;
};

export default function PromptSection({
  semantic,
  onAiAssist,
  isAiAssisting,
  fieldName = "prompt",
  title = "Prompt",
  placeholder = "Describe what you want to create... Be specific about style, lighting, mood, and details for best results.",
  requiredMessage = "Please enter your prompt",
  maxLength = 6000,
  rows = 6,
  showAiAssist = true,
  showRegenerateButton = true,
  aiAssistLabel = "AI Assist",
  aiAssistThinkingLabel = "Thinking...",
  regenerateLabel = "Regenerate with AI",
  required = true,
  mentionOptions = [],
  projectId,
  generateType,
}: Props) {
  const form = Form.useFormInstance();
  const promptText = (Form.useWatch(fieldName, form) as string) || "";
  const [internalLoading, setInternalLoading] = useState(false);
  const [openAssistant, setOpenAssistant] = useState<boolean>(false);
  const loading = isAiAssisting ?? internalLoading;

  const handleAiAssistClick = async () => {
    setOpenAssistant(true);
  };

  return (
    <Flex vertical gap={8}>
      <Flex align="center" justify="space-between">
        <Typography.Text
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: semantic.colorTextSecondary,
          }}
        >
          {title}
        </Typography.Text>
        {showAiAssist && (
          <Button
            size="small"
            type="text"
            onClick={handleAiAssistClick}
            icon={<Wand2 size={12} />}
            style={{
              height: 24,
              paddingInline: 8,
              borderRadius: 6,
              fontSize: 11,
              color: semantic.colorPrimary,
              background: `${semantic.colorPrimary}1A`,
            }}
          >
            {"AI Assist"}
          </Button>
        )}
      </Flex>

      <Form.Item
        name={fieldName}
        style={{ margin: 0, padding: 0 }}
        rules={[
          {
            required: required,
            message: requiredMessage,
          },
        ]}
      >
        <Mentions
          autoSize={{ minRows: rows }}
          maxLength={maxLength}
          placeholder={placeholder}
          options={mentionOptions}
          style={{
            width: "100%",
            minHeight: 110,
            backgroundColor: semantic.colorBgElevated,
            color: semantic.colorTextBase,
            padding: "10px",
            borderRadius: "0.5rem",
            borderColor: semantic.colorBorder,
          }}
        />
      </Form.Item>

      <Flex justify="space-between" align="center">
        <Typography.Text
          style={{ fontSize: 10, color: semantic.colorTextSecondary }}
        >
          {promptText.length}/{maxLength}
        </Typography.Text>
      </Flex>

      {openAssistant && (
        <AssistantModal
          openAssistant={openAssistant}
          setOpenAssistant={setOpenAssistant}
          projectId={projectId}
          generateType={generateType}
          onUsePrompt={(text) => {
            form.setFieldValue(fieldName, text);
            setOpenAssistant(false);
          }}
        />
      )}
    </Flex>
  );
}
