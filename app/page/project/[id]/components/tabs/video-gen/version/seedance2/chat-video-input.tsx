import React, { useEffect, useState, type CSSProperties } from "react";
import { formPanel } from "@/app/theme/surface";
import { RATIO_SIZE_MAP } from "./sizes";
import {
  Button,
  Flex,
  Form,
  Image,
  Modal,
  Slider,
  Space,
  Tooltip,
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
  AudioLines,
  Image as ImageIconLucide,
  Video,
} from "lucide-react";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import Quata from "@/app/page/project/component/quata";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import UploadSection from "../../shared/upload-section";
import DrawToImage from "../../../image-gen/shared/draw-to-image";
import PromptSection from "./prompt-section";
import { getCapability } from "../../../workflow/workflow-capabilities";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import PromptTemplateSection from "../../../../tab-layout/generate-section/prompt-template-section";
import SettingSection from "../../../../tab-layout/generate-section/setting-section";
import BrandKitSection, {
  type AppliedBrandKit,
} from "../../../../tab-layout/generate-section/brand-kit-section";

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
  selectedModel?: TMasterModelType;
  organizationId?: string;
  //Fix Muti
  files: UploadFile[];
  handleUploadChangeMuti: (info: UploadChangeParam) => void;
  beforeUploadMuti: (file: RcFile) => boolean;
  onRemoveFileMuti: (file: UploadFile) => Promise<void>;
  projectId: string;
};

export default function ChatVideoInput(props: Props) {
  const {
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
    //Fix Muti
    files,
    handleUploadChangeMuti,
    beforeUploadMuti,
    onRemoveFileMuti,
    projectId,
  } = props;


  // Kit applied to this generation; the backend composes its text (null = switch off or no default kit)
  const [brandKit, setBrandKit] = React.useState<AppliedBrandKit | null>(null);
  const handleSendMessageWithCi = (values: Record<string, unknown>) => {
    handleSendMessage({ ...values, brandKitId: brandKit?.id });
  };
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

  const capability = getCapability(selectedModel);
  const supportsDraft = selectedModel?.sendConfig?.supportDraft === true;
  // Provider renders drafts at 480p only; any other resolution is rejected.
  const resolutionOptions =
    supportsDraft && draftMode
      ? ["480p"]
      : capability?.resolutions ?? ["480p", "720p", "1080p"];
  const durationRange = capability?.duration ?? { min: 4, max: 15 };

  useEffect(() => {
    if (draftMode && !supportsDraft) setDraftMode(false);
    if (draftMode && supportsDraft && selectedResolution !== "480p") {
      handleResolutionChange("480p");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftMode, supportsDraft]);

  // Switching model can leave values the new model rejects — snap them back into range.
  useEffect(() => {
    if (!resolutionOptions.includes(selectedResolution)) {
      handleResolutionChange(
        resolutionOptions.includes("720p") ? "720p" : resolutionOptions[0],
      );
    }
    const clamped = Math.min(
      Math.max(selectedDuration, durationRange.min),
      durationRange.max,
    );
    if (clamped !== selectedDuration) {
      setSelectedDuration(clamped);
      form.setFieldValue("duration", clamped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel?.id]);

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

  const renderUploadTile = (
    label: string,
    index: 0 | 1,
    file?: UploadFile,
    accept?: string,
  ) => (
    <Upload
      listType="picture-card"
      maxCount={1}
      accept={accept}
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

  const mentionOptions = files
    .filter((f) => f && f.name)
    .map((f) => {
      const isVideo =
        f.type?.startsWith("video/") || f.name.startsWith("video");
      const isAudio =
        f.type?.startsWith("audio/") || f.name.startsWith("audio");
      const source =
        f.thumbUrl ||
        f.url ||
        (typeof f.preview === "string" ? f.preview : "") ||
        (f.originFileObj ? URL.createObjectURL(f.originFileObj) : "");

      const icon = isAudio ? (
        <AudioLines size={14} style={{ color: semantic.colorTextSecondary }} />
      ) : isVideo ? (
        source ? (
          <video
            src={source}
            style={{
              width: 14,
              height: 14,
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
        ) : (
          <Video size={14} style={{ color: semantic.colorTextSecondary }} />
        )
      ) : source ? (
        <img
          src={source}
          alt={f.name}
          style={{ width: 14, height: 14, objectFit: "cover", borderRadius: 2 }}
        />
      ) : (
        <ImageIconLucide
          size={14}
          style={{ color: semantic.colorTextSecondary }}
        />
      );

      return {
        value: f.name,
        label: (
          <Flex gap={8} align="center">
            {icon}
            <Typography.Text style={{ fontSize: 12 }}>{f.name}</Typography.Text>
          </Flex>
        ),
      };
    });

  return (
    <Flex vertical style={{ height: "100%", minHeight: 0 }}>
      <Form
        name="video-gen"
        form={form}
        onFinish={handleSendMessageWithCi}
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
            files={files}
            isLoadingUpload={isLoadingUpload}
            handleUploadChange={handleUploadChangeMuti}
            beforeUpload={beforeUploadMuti}
            onRemoveFile={onRemoveFileMuti}
            maxUploadFiles={8}
            description="Upload Reference (optional, image, video, audio, max 8)"
            accept="image/*,video/*,audio/*"
            extraActions={
              <DrawToImage
                files={files}
                handleUploadChange={handleUploadChangeMuti}
                semantic={semantic}
                disabled={isLoadingUpload || files.length >= 8}
              />
            }
          />
          <PromptSection
            kitChars={brandKit?.usedChars}
            generateType="video"
            semantic={semantic}
            placeholder="Describe what you want to create... Be specific about style, lighting, mood, and details for best results.  Use @ to reference upload files ,such as @image1, @image2, @video1, @audio1"
            rows={5}
            maxLength={8000}
            required={true}
            mentionOptions={mentionOptions}
            projectId={projectId}
          />

          <PromptTemplateSection
            handleUsePromptGuide={handleUsePromptGuide}
            organizationId={organizationId}
            selectedModel={selectedModel?.modelType || undefined}
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
            resolutionOptions={resolutionOptions}
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
                    min={durationRange.min}
                    max={durationRange.max}
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

                  {supportsDraft && (
                    <Tooltip
                      title={
                        selectedModel?.sendConfig?.supportDraftFinal === true
                          ? "ร่าง 480p ราคาถูกเพื่อดูภาพรวมก่อน แล้วค่อยสร้างตัวจริง 1080p/4K จากผลลัพธ์"
                          : "ร่าง 480p ราคาถูกเพื่อดูภาพรวมก่อนสร้างจริง"
                      }
                    >
                      <Button
                        aria-pressed={draftMode}
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
                        Draft 480p
                      </Button>
                    </Tooltip>
                  )}
                </Flex>
              </>
            }
          />
          <BrandKitSection
            semantic={semantic}
            generateType="video"
            onKitChange={setBrandKit}
            projectId={projectId}
          />
        </Flex>

        <Flex
          align="center"
          gap={12}
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: `1px solid ${semantic.colorBorder}`,
            background: formPanel(mode).bg,
            paddingInline: 12,
            paddingBlock: 12,
          }}
        >
          <div data-tour="quota" style={{ flex: 1, minWidth: 0 }}>
            <Quata
              projectId={projectId}
                            creditUsed={usedCredit.used || 0}
              creditTotal={usedCredit.total || 0}
              size="small"
              cerrentUsedCredit={cerrentUsedCredit}
            />
          </div>
          <Button
            type="primary"
            data-tour="generate"
            htmlType="submit"
            disabled={submitting}
            style={{
              color: "white",
              border: "none",
              height: 36,
              borderRadius: 8,
              fontWeight: 600,
            }}
            loading={submitting}
          >
            Generate Video
          </Button>
        </Flex>
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
