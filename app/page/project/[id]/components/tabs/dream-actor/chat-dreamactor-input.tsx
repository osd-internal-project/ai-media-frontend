import React, { useState, type CSSProperties } from "react";
import {
  Eye,
  ImagePlus,
  Play,
  RefreshCcw,
  Video,
  X,
  Zap,
  ZapIcon,
  ZapOff,
} from "lucide-react";
import {
  Button,
  Flex,
  Form,
  InputNumber,
  Modal,
  Space,
  Typography,
  Upload,
  type FormInstance,
  type UploadFile,
  Image,
  Card,
} from "antd";
import { RcFile } from "antd/es/upload";
import {
  TPromptGuide,
  TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import UploadSection from "../../tab-layout/generate-section/upload-section";
import PromptSection from "../../tab-layout/generate-section/prompt-section";
// import PromptTemplateSection from "../../tab-layout/generate-section/promt-template-section";
import SettingSection from "../../tab-layout/generate-section/setting-section";
import BrandKitSection from "../../tab-layout/generate-section/brand-kit-section";
import Quata from "@/app/page/project/component/quata";

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
  setFastMode: (fastMode: boolean) => void;
  fastMode: boolean;
  onRemoveFile: (file: UploadFile) => void;
  setSelectedWidth: (width: number) => void;
  setSelectedHeight: (height: number) => void;
  promptGuideTemplates: TPromptGuideTemplate[];
  fetchVideoPromptGuides: () => Promise<void>;
  handleUsePromptGuide: (template: TPromptGuide) => void;
  usedCredit: { used?: number; total?: number };
  cerrentUsedCredit: number;
};

export default function ChatDreamactorInput({
  selectedResolution,
  setSelectedResolution,
  form,
  filesFirst,
  filesLast,
  handleUploadChange,
  handleSendMessage,
  isLoadingUpload,
  submitting,
  setFastMode,
  fastMode,
  promptGuideTemplates,
  fetchVideoPromptGuides,
  handleUsePromptGuide,
  usedCredit,
  cerrentUsedCredit,
}: Props) {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewFileType, setPreviewFileType] = useState<"image" | "video">(
    "image",
  );

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution);
    form.setFieldValue("resolution", resolution);
  };

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

    const source = file.url || (file.preview as string) || "";
    const isVideo =
      file.type?.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);

    setPreviewImage(source);
    setPreviewFileType(isVideo ? "video" : "image");
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
    type: "image" | "video",
    file?: UploadFile,
  ) => (
    <Upload
      listType="picture-card"
      maxCount={1}
      accept={type === "image" ? "image/*" : "video/*"}
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
          {type === "video" ? (
            <Flex
              vertical
              align="center"
              justify="center"
              gap={4}
              style={{ width: "100%", height: "100%", padding: 8 }}
            >
              <Play size={20} style={{ color: semantic.colorPrimary }} />
              <Typography.Text
                ellipsis
                style={{
                  fontSize: 10,
                  maxWidth: "100%",
                  color: semantic.colorTextSecondary,
                }}
              >
                {file.name}
              </Typography.Text>
            </Flex>
          ) : (
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
          )}

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
              icon={<Eye size={12} />}
            />
            <Button
              size="small"
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
              icon={<RefreshCcw size={12} />}
            />
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
          {type === "video" ? <Video size={16} /> : <ImagePlus size={16} />}
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
        name="dreamactor-gen"
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
                  Upload Portrait & Drive Video
                </Typography.Text>
                <Space size={8} style={{ width: "100%" }}>
                  <div style={{ flex: 1 }}>
                    {renderUploadTile("Portrait *", 0, "image", filesFirst[0],)}
                  </div>
                  <div style={{ flex: 1 }}>
                    {renderUploadTile(
                      "Drive Video *",
                      1,
                      "video",
                      filesLast[0],
                    )}
                  </div>
                </Space>
              </Flex>
            }
          />

          <PromptSection
            semantic={semantic}
            placeholder="Describe what you want to actor video...\n\nBe specific about style, lighting, mood, and details for best results."
            rows={5}
            maxLength={2000}
            required={false}
          />

          {/* <PromptTemplateSection
            promptGuideTemplates={promptGuideTemplates}
            fetchPromptGuides={fetchVideoPromptGuides}
            handleUsePromptGuide={handleUsePromptGuide}
            buttonText="Browse Prompt Templates"
          /> */}

          <SettingSection
            semantic={semantic}
            selectedResolution={selectedResolution}
            handleResolutionChange={handleResolutionChange}
            showModeSection={false}
            showRatioSection={false}
            showCountSection={false}
            resolutionOptions={["720p", "1080p"]}
            extraContent={
              <>
                <Flex gap={8}>
                  <Button
                    onClick={() => {
                      const next = !fastMode;
                      setFastMode(next);
                      form.setFieldValue("fastMode", next);
                    }}
                    icon={
                      fastMode ? <ZapIcon size={14} /> : <ZapOff size={14} />
                    }
                    style={{
                      borderRadius: 8,
                      borderColor: fastMode
                        ? semantic.colorPrimary
                        : semantic.colorBorder,
                      background: fastMode
                        ? `${semantic.colorPrimary}1A`
                        : "transparent",
                      color: fastMode
                        ? semantic.colorPrimary
                        : semantic.colorTextSecondary,
                    }}
                  >
                    Fast mode
                  </Button>
                </Flex>

                <Form.Item name="seed" style={{ margin: 0 }}>
                  <InputNumber
                    placeholder="(Optional) Seed"
                    style={{ width: "100%" }}
                    controls={false}
                  />
                </Form.Item>
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
            Generate
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
        {previewFileType === "video" ? (
          <video
            controls
            autoPlay
            style={{
              width: "auto",
              maxHeight: "80vh",
              maxWidth: "90vw",
              borderRadius: 8,
            }}
            src={previewImage}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
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
        )}
      </Modal>
    </Flex>
  );
}
