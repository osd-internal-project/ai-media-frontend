import React, { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Plus, Video, X, Eye, AudioLines } from "lucide-react";
import {
  Button,
  Card,
  Flex,
  Image,
  Modal,
  Tooltip,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import { RcFile, UploadChangeParam } from "antd/es/upload";

type Props = {
  semantic: Record<string, any>;
  files?: UploadFile[];
  isLoadingUpload?: boolean;
  handleUploadChange?: (info: UploadChangeParam) => void;
  beforeUpload?: (file: RcFile) => boolean;
  onRemoveFile: (file: UploadFile) => void;
  maxUploadFiles?: number;
  sectionTitle?: string;
  description?: string;
  uploadTooltipText?: string;
  renderContent?: React.ReactNode;
  accept?: string;
};

export default function UploadSection({
  semantic,
  files = [],
  isLoadingUpload = false,
  handleUploadChange,
  beforeUpload,
  onRemoveFile,
  maxUploadFiles = 15,
  sectionTitle = "Uploads",
  description,
  uploadTooltipText,
  renderContent,
  accept,
}: Props) {
  const displayDescription =
    description ?? `Reference Images (optional, max ${maxUploadFiles})`;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewFileType, setPreviewFileType] = useState<
    "image" | "video" | "audio"
  >("image");
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
    const isAudio =
      file.type?.startsWith("audio/") || /\.(mp3|wav|ogg)$/i.test(file.name);

    setPreviewImage(source);
    setPreviewFileType(isAudio ? "audio" : isVideo ? "video" : "image");
    setPreviewOpen(true);
  };
  return (
    <Flex vertical gap={8}>
      <Typography.Text
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: semantic.colorTextSecondary,
        }}
      >
        {sectionTitle}
      </Typography.Text>
      <Card
        variant="borderless"
        style={{
          background: semantic.colorBgContainer,
          border: `1px solid ${semantic.colorBorder}`,
          borderRadius: 12,
        }}
        styles={{ body: { padding: 12 } }}
      >
        {renderContent ? (
          renderContent
        ) : (
          <Flex vertical gap={8}>
            <Flex align="flex-start" justify="space-between">
              <Typography.Text
                style={{
                  fontSize: 12,
                  color: semantic.colorTextSecondary,

                  flex: 1,
                  minWidth: 0, // สำคัญสำหรับ flex
                  whiteSpace: "normal", // ✅ อนุญาตให้ขึ้นบรรทัดใหม่
                  wordBreak: "break-word", // กันคำยาวทะลุ
                }}
              >
                {displayDescription}
              </Typography.Text>

              {files.length > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Typography.Text
                    style={{
                      fontSize: 12,
                      color: semantic.colorPrimary,
                      fontWeight: 600,
                      whiteSpace: "nowrap", // ✅ ขวาอยู่บรรทัดเดียวเสมอ
                    }}
                  >
                    {files.length}/{maxUploadFiles}
                  </Typography.Text>
                </div>
              )}
            </Flex>

            <Flex gap={8} wrap>
              {files.map((file, index) => {
                const source =
                  file.thumbUrl ||
                  file.url ||
                  (typeof file.preview === "string" ? file.preview : "") ||
                  (file.originFileObj
                    ? URL.createObjectURL(file.originFileObj)
                    : "");
                const fileType = file.type;

                return (
                  <div
                    key={file.uid || index}
                    style={{
                      width: 80,
                      height: 80,
                      position: "relative",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `1px solid ${semantic.colorBorder}`,
                      background: semantic.colorBgElevated,
                    }}
                  >
                    {fileType?.includes("video") ? (
                      <Flex
                        vertical
                        align="center"
                        justify="center"
                        style={{ width: "100%", height: "100%" }}
                      >
                        <video
                          src={source}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Flex>
                    ) : fileType?.includes("audio") ? (
                      <Flex
                        vertical
                        align="center"
                        justify="center"
                        style={{ width: "100%", height: "100%" }}
                      >
                        <AudioLines
                          size={20}
                          style={{ color: semantic.colorPrimary }}
                        />
                      </Flex>
                    ) : (
                      <Image
                        src={source}
                        alt={file.name}
                        preview={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(4px)",
                        padding: "2px 4px",
                      }}
                    >
                      <Typography.Text
                        style={{
                          display: "block",
                          color: "#fff",
                          fontSize: 10,
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {file.name}
                      </Typography.Text>
                    </div>

                    <Flex
                      className="upload-item-overlay"
                      gap={4}
                      justify="center"
                      align="center"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        opacity: 0,
                        transition: "opacity 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0";
                      }}
                    >
                      <Button
                        size="small"
                        type="text"
                        style={{
                          color: "#fff",
                          padding: 4,
                          minWidth: "auto",
                          height: "auto",
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openPreview(file);
                        }}
                        icon={<Eye size={14} />}
                      />
                      <Button
                        size="small"
                        type="text"
                        style={{
                          color: "#ff4d4f",
                          padding: 4,
                          minWidth: "auto",
                          height: "auto",
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onRemoveFile(file);
                        }}
                        icon={<X size={14} />}
                      />
                    </Flex>
                  </div>
                );
              })}

              {files.length < maxUploadFiles && (
                <Upload
                  fileList={files}
                  onChange={(info) => handleUploadChange?.(info)}
                  beforeUpload={beforeUpload}
                  onRemove={(file) => {
                    onRemoveFile?.(file);
                    return false;
                  }}
                  multiple
                  maxCount={maxUploadFiles}
                  showUploadList={false}
                  disabled={isLoadingUpload}
                  accept={accept}
                >
                  <Tooltip
                    title={
                      uploadTooltipText ??
                      `Upload files (${files.length}/${maxUploadFiles})`
                    }
                    placement="top"
                  >
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        border: `2px dashed ${semantic.colorBorder}`,
                        background: semantic.colorBgBase,
                        cursor: "pointer",
                      }}
                    >
                      {isLoadingUpload ? (
                        <LoadingOutlined
                          style={{ color: semantic.colorTextSecondary }}
                        />
                      ) : (
                        <Plus
                          size={18}
                          style={{ color: semantic.colorTextSecondary }}
                        />
                      )}
                    </Flex>
                  </Tooltip>
                </Upload>
              )}
            </Flex>
          </Flex>
        )}
      </Card>
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
        ) : previewFileType === "audio" ? (
          <audio controls autoPlay src={previewImage} style={{ width: 300 }} />
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
