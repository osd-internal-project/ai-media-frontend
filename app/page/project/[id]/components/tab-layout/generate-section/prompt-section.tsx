import React, { useState } from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { formPanel } from "@/app/theme/surface";
import { Loader2, RefreshCw, Wand2 } from "lucide-react";
import { Button, Flex, Form, Input, Typography } from "antd";
import type { ChatGenerateType } from "@/app/services/chat-assistant.types";
import AssistantModal from "../../assistant/assistant-modal";
import { useChatAssistantEnabled } from "@/app/hooks/useChatAssistantEnabled";

const { TextArea } = Input;

type Props = {
  semantic: Record<string, any>;
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
  projectId: string;
  /** แท็บ generate ที่เปิดอยู่ — กำหนดบทบาทของผู้ช่วยแชท */
  generateType?: ChatGenerateType;
  /** characters the brand kit adds to this prompt; counted against the same limit */
  kitChars?: number;
};

export default function PromptSection({
  semantic,
  isAiAssisting,
  fieldName = "prompt",
  title = "Prompt",
  placeholder = "Describe what you want to create...\n\nBe specific about style, lighting, mood, and details for best results.",
  requiredMessage = "Please enter your prompt",
  maxLength = 2000,
  rows = 6,
  showAiAssist = true,
  aiAssistLabel = "AI Assist",
  aiAssistThinkingLabel = "Thinking...",
  required = true,
  projectId,
  generateType,
  kitChars = 0,
}: Props) {
  const { mode } = useThemeMode();
  const form = Form.useFormInstance();
  const promptText = (Form.useWatch(fieldName, form) as string) || "";
  const [internalLoading, setInternalLoading] = useState(false);
  const [openAssistant, setOpenAssistant] = useState<boolean>(false);
  const assistantEnabled = useChatAssistantEnabled();
  const loading = isAiAssisting ?? internalLoading;

  const handleAiAssistClick = async () => {
    setOpenAssistant(true);
  };
  return (
    <Flex vertical gap={8} data-tour="prompt">
      <Flex align="center" justify="space-between">
        <Typography.Text
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: semantic.colorTextSecondary,
          }}
        >
          {title}
        </Typography.Text>
        <Flex align="center" gap={8}>
        {/* Counter rides the label row instead of a row of its own. */}
        <Typography.Text
          style={{
            fontSize: 12,
            color:
              promptText.length + kitChars > maxLength
                ? semantic.colorError
                : semantic.colorTextSecondary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {promptText.length}
          {kitChars > 0 && ` + kit ${kitChars}`}/{maxLength}
        </Typography.Text>
        {assistantEnabled && showAiAssist && (
          <Button
            size="small"
            type="text"
            onClick={handleAiAssistClick}
            // disabled={loading || !onAiAssist}
            icon={
              loading ? (
                <Loader2
                  size={12}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Wand2 size={12} />
              )
            }
            style={{
              height: 24,
              paddingInline: 8,
              borderRadius: 6,
              fontSize: 11,
              color: semantic.colorPrimary,
              background: `${semantic.colorPrimary}1A`,
            }}
          >
            {loading ? aiAssistThinkingLabel : aiAssistLabel}
          </Button>
        )}
        </Flex>
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
        <TextArea
          // Grows with the prompt so a short one leaves room for the settings below.
          autoSize={{ minRows: Math.min(rows, 3), maxRows: 10 }}
          maxLength={maxLength}
          placeholder={placeholder}
          style={{
            width: "100%",
            resize: "none",
            backgroundColor: formPanel(mode).field,
            color: semantic.colorTextBase,
            padding: "10px",
            borderRadius: "0.5rem",
            borderColor: semantic.colorBorder,
          }}
        />
      </Form.Item>


      {/* {showRegenerateButton && promptText.trim() && (
        <Button
          block
          type="text"
          onClick={handleAiAssistClick}
          disabled={loading || !onAiAssist}
          icon={<RefreshCw size={12} />}
          style={{
            height: 30,
            fontSize: 12,
            color: semantic.colorTextSecondary,
            borderRadius: 8,
          }}
        >
          {regenerateLabel}
        </Button>
      )} */}
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
