import React from "react";
import {
  CloseOutlined,
  FileAddFilled,
  LoadingOutlined,
} from "@ant-design/icons";
import { ImageIcon, ImagePlus, Plus } from "lucide-react";
import {
  Button,
  Card,
  Flex,
  Image,
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
  onRemoveFile?: (file: UploadFile) => void;
  maxUploadFiles?: number;
  sectionTitle?: string;
  description?: string;
  uploadTooltipText?: string;
  renderContent?: React.ReactNode;
  accept?: string;
  /** Extra action nodes rendered after the upload (+) button in the file row. */
  extraActions?: React.ReactNode;
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
  accept,
  uploadTooltipText,
  renderContent,
  extraActions,
}: Props) {
  const displayDescription =
    description ?? `Reference Images (optional, max ${maxUploadFiles})`;

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
            <Flex align="center" justify="space-between">
              <Typography.Text
                style={{ fontSize: 12, color: semantic.colorTextSecondary }}
              >
                {displayDescription}
              </Typography.Text>
              {files.length > 0 && (
                <Typography.Text
                  style={{
                    fontSize: 12,
                    color: semantic.colorPrimary,
                    fontWeight: 600,
                  }}
                >
                  {files.length}/{maxUploadFiles}
                </Typography.Text>
              )}
            </Flex>

            <Flex gap={8} wrap>
              {files.map((file) => {
                const source =
                  file.thumbUrl ||
                  file.url ||
                  (typeof file.preview === "string" ? file.preview : "") ||
                  (file.originFileObj
                    ? URL.createObjectURL(file.originFileObj)
                    : "");

                // Re-calculate the source on every render for local files might be expensive,
                // but for small amount of files it's okay.
                // Better to avoid memory leaks by revoking if possible, but keep it simple for now as it's a small UI component.

                return (
                  <Flex
                    key={file.uid}
                    style={{ position: "relative", width: 56, height: 56 }}
                  >
                    <Card
                      variant="borderless"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: `1px solid ${semantic.colorBorder}`,
                        background: semantic.colorBgElevated,
                      }}
                      styles={{
                        body: { padding: 0, width: "100%", height: "100%" },
                      }}
                    >
                      {source ? (
                        <Image
                          src={source}
                          alt={file.name}
                          preview={false}
                          width={56}
                          height={56}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Flex
                          align="center"
                          justify="center"
                          style={{ width: "100%", height: "100%" }}
                        >
                          <ImageIcon
                            size={16}
                            style={{ color: semantic.colorTextSecondary }}
                          />
                        </Flex>
                      )}
                    </Card>

                    <Button
                      size="small"
                      shape="circle"
                      type="primary"
                      danger
                      icon={<CloseOutlined style={{ fontSize: 10 }} />}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onRemoveFile?.(file);
                      }}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 16,
                        height: 16,
                        minWidth: 16,
                        padding: 0,
                      }}
                    />
                  </Flex>
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
                  accept={accept}
                  multiple
                  maxCount={maxUploadFiles}
                  showUploadList={false}
                  disabled={isLoadingUpload}
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
              {extraActions}
            </Flex>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}
