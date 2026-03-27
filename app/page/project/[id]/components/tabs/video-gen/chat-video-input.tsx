import React, { useState, type CSSProperties } from "react";
import {
  Button,
  Card,
  Flex,
  Form,
  Image,
  Modal,
  Slider,
  Space,
  Typography,
  Upload,
  type FormInstance,
  type UploadFile,
} from "antd";
import {
  Check,
  ImagePlus,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { RcFile } from "antd/es/upload";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import Quata from "@/app/page/project/component/quata";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import UploadSection from "../../tab-layout/generate-section/upload-section";
import PromptSection from "../../tab-layout/generate-section/prompt-section";
import PromptTemplateSection from "../../tab-layout/generate-section/prompt-template-section";
import SettingSection from "../../tab-layout/generate-section/setting-section";
import BrandKitSection from "../../tab-layout/generate-section/brand-kit-section";

type Props = {
  setSelectedRatio: (ratio: string) => void;
  selectedRatio: string;
  setSelectedResolution: (resolution: string) => void;
  selectedResolution: string;
  form: FormInstance;
  filesFirst: UploadFile[];
  filesLast: UploadFile[];
  handleUploadChange: ({
    index,
    file,
    fileList,
    status,
  }: {
    index: number;
    file: UploadFile;
    fileList: UploadFile[];
    status: "upload" | "remove";
  }) => void;
  handleSendMessage: (values: any) => void;
  isLoadingUpload: boolean;
  submitting: boolean;
  setSelectedDuration: (duration: number) => void;
  selectedDuration: number;
  setDraftMode: (draftMode: boolean) => void;
  draftMode: boolean;
  setSelectedAudio: (audio: boolean) => void;
  selectedAudio: boolean;
  setSelectedWidth: (width: number) => void;
  setSelectedHeight: (height: number) => void;
  promptGuideTemplates: TPromptGuideTemplate[];
  fetchVideoPromptGuides: () => Promise<void>;
  handleUsePromptGuide: (template: TPromptGuide) => void;
  usedCredit: { used?: number; total?: number };
  cerrentUsedCredit: number;
  selectedModel?: string;
  organizationId?: string;
};

export default function ChatVideoInput({
  selectedRatio,
  setSelectedRatio,
  selectedResolution,
  setSelectedResolution,
  form,
  filesFirst,
  filesLast,
  handleUploadChange,
  handleSendMessage,
  isLoadingUpload,
  submitting,
  setSelectedDuration,
  selectedDuration,
  setDraftMode,
  draftMode,
  setSelectedAudio,
  selectedAudio,
  setSelectedWidth,
  setSelectedHeight,
  handleUsePromptGuide,
  usedCredit,
  cerrentUsedCredit,
  selectedModel,
  organizationId,
}: Props) {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  // const RATIO_SIZE_MAP: Record<string, { width: number; height: number }> = {
  //   "1:1": { width: 2048, height: 2048 },
  //   "4:3": { width: 2304, height: 1728 },
  //   "3:4": { width: 1728, height: 2304 },
  //   "16:9": { width: 2560, height: 1440 },
  //   "9:16": { width: 1440, height: 2560 },
  //   "3:2": { width: 2496, height: 1664 },
  //   "2:3": { width: 1664, height: 2496 },
  //   "21:9": { width: 3024, height: 1296 },
  // };

  const RATIO_SIZE_MAP: Record<
    string,
    Record<string, { width: number; height: number }>
  > = {
    "480p": {
      "1:1": { width: 640, height: 640 },
      "4:3": { width: 752, height: 564 },
      "3:4": { width: 564, height: 752 },
      "16:9": { width: 864, height: 496 },
      "9:16": { width: 496, height: 864 },
      "21:9": { width: 992, height: 432 },
      "9:21": { width: 432, height: 992 },
    },
    "720p": {
      "1:1": { width: 960, height: 960 },
      "4:3": { width: 1112, height: 834 },
      "3:4": { width: 834, height: 1112 },
      "16:9": { width: 1280, height: 720 },
      "9:16": { width: 720, height: 1280 },
      "21:9": { width: 1470, height: 630 },
      "9:21": { width: 630, height: 1470 },
    },
    "1080p": {
      "1:1": { width: 1440, height: 1440 },
      "4:3": { width: 1664, height: 1248 },
      "3:4": { width: 1248, height: 1664 },
      "16:9": { width: 1920, height: 1080 },
      "9:16": { width: 1080, height: 1920 },
      "21:9": { width: 2205, height: 945 },
      "9:21": { width: 945, height: 2205 },
    },
  };
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const getRatioIcon = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        return <Square size={14} />;
      case "9:16":
      case "3:4":
      case "2:3":
        return <RectangleVertical size={14} />;
      default:
        return <RectangleHorizontal size={14} />;
    }
  };

  const handleRatioChange = (ratio: string) => {
    setSelectedRatio(ratio);
    const baseSize = RATIO_SIZE_MAP[selectedResolution][ratio];
    if (!baseSize) return;

    const scaleFactor = selectedResolution === "4k" ? 1.414 : 1;
    const newWidth = Math.round(baseSize.width * scaleFactor);
    const newHeight = Math.round(baseSize.height * scaleFactor);
    setSelectedWidth(newWidth);
    setSelectedHeight(newHeight);
    form.setFieldsValue({ width: newWidth, height: newHeight, ratio });
  };

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution);
    form.setFieldValue("resolution", resolution);

    const baseSize = RATIO_SIZE_MAP[resolution][selectedRatio];
    if (!baseSize) return;

    // const scaleFactor = resolution === "720p" ? 1.414 : 1;
    const newWidth = Math.round(baseSize.width);
    const newHeight = Math.round(baseSize.height);
    setSelectedWidth(newWidth);
    setSelectedHeight(newHeight);
    form.setFieldsValue({ width: newWidth, height: newHeight });
  };

  const ratioOptions = Object.keys(RATIO_SIZE_MAP[selectedResolution]).map(
    (ratio) => ({
      label: ratio,
      key: ratio,
      icon: getRatioIcon(ratio),
      onClick: () => handleRatioChange(ratio),
    }),
  );

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const openPreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string) || "");
    setPreviewOpen(true);
  };

  const uploadTileStyle: CSSProperties = {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 12,
    border: `1px dashed ${semantic.colorBorder}`,
    background: semantic.colorBgContainer,
    overflow: "hidden",
    position: "relative",
  };

  const renderUploadTile = (label: string, index: 0 | 1, file?: UploadFile) => (
    <Upload
      listType="picture-card"
      maxCount={1}
      showUploadList={false}
      fileList={file ? [file] : []}
      beforeUpload={() => false}
      disabled={isLoadingUpload}
      onChange={({ fileList }) => {
        const latest = fileList[fileList.length - 1];
        if (!latest) return;

        handleUploadChange({
          index,
          file: latest,
          fileList: [latest],
          status: "upload",
        });
      }}
      style={uploadTileStyle}
    >
      {file ? (
        <>
          <Image
            src={
              file.url ||
              file.thumbUrl ||
              (file.originFileObj
                ? URL.createObjectURL(file.originFileObj)
                : undefined)
            }
            alt={label}
            preview={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Flex
            gap={6}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <Button
              size="small"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openPreview(file);
              }}
            >
              View
            </Button>
            <Button
              size="small"
              danger
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleUploadChange({
                  index,
                  file,
                  fileList: [],
                  status: "remove",
                });
              }}
            >
              <X size={12} />
            </Button>
          </Flex>
        </>
      ) : (
        <Flex
          vertical
          align="center"
          justify="center"
          gap={4}
          style={{ color: semantic.colorTextSecondary }}
        >
          <ImagePlus size={16} />
          <Typography.Text
            style={{ fontSize: 11, color: semantic.colorTextSecondary }}
          >
            {label}
          </Typography.Text>
        </Flex>
      )}
    </Upload>
  );

  return (
    <Flex vertical style={{ height: "100%", minHeight: 0 }}>
      <Form
        name="video-gen"
        form={form}
        onFinish={handleSendMessage}
        autoComplete="off"
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
            sectionTitle="Uploads"
            renderContent={
              <Flex vertical gap={8}>
                <Typography.Text
                  style={{ fontSize: 12, color: semantic.colorTextSecondary }}
                >
                  Upload Frames *
                </Typography.Text>
                <Space size={8} style={{ width: "100%" }}>
                  <div style={{ flex: 1 }}>
                    {renderUploadTile("First Frame", 0, filesFirst[0])}
                  </div>
                  <div style={{ flex: 1 }}>
                    {renderUploadTile("Last Frame", 1, filesLast[0])}
                  </div>
                </Space>
              </Flex>
            }
          />

          <PromptSection
            semantic={semantic}
            placeholder="Describe what you want to video...\n\nBe specific about style, lighting, mood, and details for best results."
            rows={5}
            maxLength={2000}
          />

          <PromptTemplateSection
            handleUsePromptGuide={handleUsePromptGuide}
            organizationId={organizationId}
            selectedModel={selectedModel}
          />

          <SettingSection
            semantic={semantic}
            selectedResolution={selectedResolution}
            selectedRatio={selectedRatio}
            handleResolutionChange={handleResolutionChange}
            ratioOptions={ratioOptions}
            getRatioIcon={getRatioIcon}
            showModeSection={false}
            showCountSection={false}
            resolutionOptions={["480p", "720p", "1080p"]}
            extraContent={
              <>
                <Flex vertical gap={6}>
                  <Flex justify="space-between">
                    <Typography.Text
                      style={{
                        fontSize: 12,
                        color: semantic.colorTextSecondary,
                      }}
                    >
                      Duration
                    </Typography.Text>
                    <Typography.Text
                      style={{ fontSize: 12, color: semantic.colorPrimary }}
                    >
                      {selectedDuration}s
                    </Typography.Text>
                  </Flex>
                  <Slider
                    min={1}
                    max={12}
                    value={selectedDuration}
                    onChange={(value) => {
                      if (typeof value === "number") {
                        setSelectedDuration(value);
                        form.setFieldValue("duration", value);
                      }
                    }}
                    tooltip={{ open: false }}
                  />
                </Flex>

                <Flex gap={8}>
                  <Button
                    onClick={() => setSelectedAudio(!selectedAudio)}
                    icon={
                      selectedAudio ? (
                        <Volume2 size={14} />
                      ) : (
                        <VolumeX size={14} />
                      )
                    }
                    style={{
                      borderRadius: 8,
                      borderColor: selectedAudio
                        ? semantic.colorPrimary
                        : semantic.colorBorder,
                      background: selectedAudio
                        ? `${semantic.colorPrimary}1A`
                        : "transparent",
                      color: selectedAudio
                        ? semantic.colorPrimary
                        : semantic.colorTextSecondary,
                    }}
                  >
                    Enable Audio
                  </Button>

                  <Button
                    onClick={() => setDraftMode(!draftMode)}
                    icon={draftMode ? <Check size={14} /> : undefined}
                    style={{
                      borderRadius: 8,
                      borderColor: draftMode
                        ? semantic.colorPrimary
                        : semantic.colorBorder,
                      background: draftMode
                        ? `${semantic.colorPrimary}1A`
                        : "transparent",
                      color: draftMode
                        ? semantic.colorPrimary
                        : semantic.colorTextSecondary,
                    }}
                  >
                    Draft mode
                  </Button>
                </Flex>
              </>
            }
          />
        </Flex>

        <BrandKitSection semantic={semantic}>
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
              size="small"
              cerrentUsedCredit={cerrentUsedCredit}
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
            }}
            icon={<Zap size={16} fill="currentColor" />}
            loading={submitting}
          >
            Generate Video
          </Button>
        </BrandKitSection>
      </Form>

      <Modal
        open={previewOpen}
        title={null}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        destroyOnHidden
        width="auto"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="preview"
          style={{
            width: "auto",
            maxHeight: "80vh",
            maxWidth: "90vw",
            borderRadius: 8,
          }}
          src={previewImage}
        />
      </Modal>
    </Flex>
  );
}
