import React from "react";
import {
  RectangleHorizontal,
  RectangleVertical,
  Sparkles,
  Square,
  Zap,
  ZapIcon,
} from "lucide-react";
import { Button, Card, Flex, Form, FormInstance, type UploadFile } from "antd";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";
import UploadSection from "../../../../tab-layout/generate-section/upload-section";
import PromptSection from "../../../../tab-layout/generate-section/prompt-section";
import PromptTemplateSection from "../../../../tab-layout/generate-section/prompt-template-section";
import SettingSection from "../../../../tab-layout/generate-section/setting-section";
import Quata from "@/app/page/project/component/quata";
import BrandKitSection from "../../../../tab-layout/generate-section/brand-kit-section";

// Helper to join CI prompt and main prompt with connector
function joinCiPrompt(ciPrompt: string, mainPrompt: string): string {
  if (!mainPrompt) return ciPrompt;
  if (!ciPrompt) return mainPrompt;
  // Main prompt first, then CI prompt with connector
  return (
    mainPrompt.trim() +
    "\n\n---\n(BrandKit Prompt: ส่วนเสริมจาก BrandKit)\n" +
    ciPrompt.trim()
  );
}
type Props = {
  setGroupMode: (groupMode: string | undefined) => void;
  groupMode: string;
  setSelectedRatio: (ratio: string) => void;
  selectedRatio: string;
  setSelectedResolution: (resolution: string) => void;
  selectedResolution: string;
  setSelectedMaximumImage: (selectedMaximumImage: number) => void;
  selectedMaximumImage: number;
  form: FormInstance;
  files: UploadFile[];
  handleUploadChange: (info: UploadChangeParam) => void;
  beforeUpload: (file: RcFile) => boolean;
  onRemoveFile: (file: UploadFile) => void;
  submitting: boolean;
  handleSendMessage: (values: any) => void;
  isLoadingUpload: boolean;
  setSelectedWidth: (width: number) => void;
  setSelectedHeight: (height: number) => void;
  handleUsePromptGuide: (prompt: TPromptGuide) => void;
  usedCredit: { used?: number; total?: number };
  cerrentUsedCredit: number;
  fetchCerrentUsedCredit: () => void;
  organizationId?: string;
  selectedModel?: string;
  projectId: string;
};

export default function ChatImageInput({
  setGroupMode,
  groupMode,
  selectedRatio,
  setSelectedRatio,
  selectedResolution,
  setSelectedResolution,
  selectedMaximumImage,
  setSelectedMaximumImage,
  form,
  files,
  handleUploadChange,
  beforeUpload,
  onRemoveFile,
  submitting,
  handleSendMessage,
  isLoadingUpload,
  setSelectedWidth,
  setSelectedHeight,
  handleUsePromptGuide,
  usedCredit,
  cerrentUsedCredit,
  fetchCerrentUsedCredit,
  organizationId,
  selectedModel,
  projectId

}: Props) {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  const RATIO_SIZE_MAP: Record<string, { width: number; height: number }> = {
    "1:1": { width: 2048, height: 2048 },
    "4:3": { width: 2304, height: 1728 },
    "3:4": { width: 1728, height: 2304 },
    "16:9": { width: 2560, height: 1440 },
    "9:16": { width: 1440, height: 2560 },
    "3:2": { width: 2496, height: 1664 },
    "2:3": { width: 1664, height: 2496 },
    "21:9": { width: 3024, height: 1296 },
  };

  const groupModes = [
    {
      id: "auto",
      label: "Automatic",
      description: "Automatic trigger group diagram capability",
    },
    {
      id: "story",
      label: "Storybook",
      description: "Create an exclusive picture book",
    },
    {
      id: "comics",
      label: "Comics",
      description: "Generate anime and comic strips in one sentence",
    },
    {
      id: "disabled",
      label: "None",
      description: "No group generation mode",
    },
  ];

  const getRatioIcon = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        return <Square size={14} />;
      case "9:16":
      case "3:4":
      case "2:3":
        return <RectangleVertical size={14} />;
      case "16:9":
      case "4:3":
      case "3:2":
      case "21:9":
        return <RectangleHorizontal size={14} />;
      default:
        return <Square size={14} />;
    }
  };

  const handleRatioChange = (ratio: string) => {
    setSelectedRatio(ratio);
    const size = RATIO_SIZE_MAP[ratio];
    if (size) {
      const scaleFactor = selectedResolution === "4k" ? 1.414 : 1;
      const newWidth = Math.round(size.width * scaleFactor);
      const newHeight = Math.round(size.height * scaleFactor);
      setSelectedWidth(newWidth);
      setSelectedHeight(newHeight);
      form.setFieldsValue({
        width: newWidth,
        height: newHeight,
        ratio: ratio,
      });
    }
  };

  const ratioOptions = Object.keys(RATIO_SIZE_MAP).map((ratio) => ({
    label: ratio,
    key: ratio,
    icon: getRatioIcon(ratio),
    onClick: () => handleRatioChange(ratio),
  }));

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution);
    form.setFieldValue("resolution", resolution);

    const currentRatio = selectedRatio;
    const baseSize = RATIO_SIZE_MAP[currentRatio];

    if (baseSize) {
      const scaleFactor = resolution === "4k" ? 1.414 : 1;
      const newWidth = Math.round(baseSize.width * scaleFactor);
      const newHeight = Math.round(baseSize.height * scaleFactor);
      setSelectedWidth(newWidth);
      setSelectedHeight(newHeight);
      form.setFieldsValue({
        width: newWidth,
        height: newHeight,
      });
    }
  };

  // State to get CI prompt and active from BrandKitSection
  const [ciPrompt, setCiPrompt] = React.useState<string>("");
  const [ciActive, setCiActive] = React.useState<boolean>(true);

  // Custom handleSendMessage to combine CI prompt and main prompt
  const handleSendMessageWithCi = (values: any) => {
    let prompt = values.prompt || "";
    if (ciActive && ciPrompt) {
      prompt = joinCiPrompt(ciPrompt, prompt);
    }
    // Pass the combined prompt to the original handler
    handleSendMessage({ ...values, prompt });
  };

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        minHeight: 0,
      }}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleSendMessageWithCi}
        autoComplete="off"
        // onChange={fetchCerrentUsedCredit}
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Flex
          vertical
          gap={12}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingInline: 12,
            paddingBlock: 12,
          }}
        >
          <UploadSection
            semantic={semantic}
            files={files}
            isLoadingUpload={isLoadingUpload}
            handleUploadChange={handleUploadChange}
            beforeUpload={beforeUpload}
            onRemoveFile={onRemoveFile}
            maxUploadFiles={8}
            description="Reference Images (optional, max 8)"
          />

          <PromptSection
            semantic={semantic}
            placeholder="Describe what you want to image...\n\nBe specific about style, lighting, mood, and details for best results."
            required={true}
            projectId={projectId}
          />

          <PromptTemplateSection
            handleUsePromptGuide={handleUsePromptGuide}
            organizationId={organizationId}
            selectedModel={selectedModel}
          />

          <SettingSection
            semantic={semantic}
            groupMode={groupMode}
            setGroupMode={setGroupMode}
            groupModes={groupModes}
            selectedResolution={selectedResolution}
            selectedRatio={selectedRatio}
            handleResolutionChange={handleResolutionChange}
            ratioOptions={ratioOptions}
            getRatioIcon={getRatioIcon}
            selectedMaximumImage={selectedMaximumImage}
            setSelectedMaximumImage={setSelectedMaximumImage}
            ratioSizeMap={RATIO_SIZE_MAP}
          />
          <BrandKitSection
            semantic={semantic}
            onCiPromptChange={setCiPrompt}
            onActiveChange={setCiActive}
          />
        </Flex>

        <Flex
          vertical
          gap={8}
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: `1px solid ${semantic.colorBorder}`,
            background: semantic.colorBgContainer,
            paddingInline: 12,
            paddingBlock: 12,
          }}
        >
          <Card
            size="small"
            style={{
              borderRadius: 12,
              borderColor: semantic.colorBorder,
              background: semantic.colorBgElevated,
            }}
            styles={{ body: { padding: "8px 12px" } }}
          >
            <Quata
              title="Quota"
              creditUsed={usedCredit.used || 0}
              creditTotal={usedCredit.total || 0}
              cerrentUsedCredit={cerrentUsedCredit}
              size="small"
            />
          </Card>
          <Button
            block
            type="primary"
            htmlType="submit"
            disabled={submitting}
            style={{
              color: "white",
              border: "none",
              height: 40,
              borderRadius: 10,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${semantic.colorPrimary} 0%, ${semantic.colorPrimary} 50%, ${aiCaveColors.secondary} 100%)`,
            }}
            icon={<Sparkles size={16} />}
            loading={submitting}
          >
            Generate x {selectedMaximumImage}
          </Button>
        </Flex>
      </Form>
    </Flex>
  );
}
