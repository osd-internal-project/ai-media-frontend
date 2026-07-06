"use client";

import React from "react";
import {
  Button,
  Flex,
  Image,
  Tooltip,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import type { RcFile, UploadChangeParam } from "antd/es/upload";
import { ImageIcon, LoaderCircle, Plus, X } from "lucide-react";

interface WorkflowUploadProps {
  semantic: Record<string, unknown>;
  files: UploadFile[];
  handleUploadChange: (info: UploadChangeParam) => void;
  beforeUpload: (file: RcFile) => boolean;
  onRemoveFile: (file: UploadFile) => void;
  maxUploadFiles?: number;
  disabled?: boolean;
  /** Accepted MIME types passed to the underlying Upload */
  accept?: string;
  /** Allow selecting multiple files at once (false for single first/last slots) */
  multiple?: boolean;
  /** Small caption shown above the tiles (e.g. "First frame") */
  label?: string;
  /** Shows a spinner on the add tile while an upload is in flight */
  isLoadingUpload?: boolean;
  /** Extra action node rendered after the add (+) tile, e.g. a Draw button */
  extraActions?: React.ReactNode;
}

/**
 * Minimal reference-file uploader for the workflow edit form.
 * Renders a compact row of thumbnails plus a small add button — no card,
 * section title, or description (kept lean for the canvas card).
 */
const WorkflowUpload: React.FC<WorkflowUploadProps> = ({
  semantic,
  files,
  handleUploadChange,
  beforeUpload,
  onRemoveFile,
  maxUploadFiles = 8,
  disabled = false,
  accept,
  multiple = true,
  label,
  isLoadingUpload = false,
  extraActions,
}) => {
  const colorBorder = semantic.colorBorder as string;
  const colorBgBase = semantic.colorBgBase as string;
  const colorBgElevated = semantic.colorBgElevated as string;
  const colorTextSecondary = semantic.colorTextSecondary as string;

  const tiles = (
    <Flex gap={6} wrap align="center">
      {files.map((file) => {
        // Prefer server/`data:` sources only — never a `blob:` object URL, which
        // the app CSP blocks. The handler sets `thumbUrl` (a `data:` URL) for
        // instant local preview; the placeholder icon covers the brief gap.
        const source =
          file.thumbUrl ||
          file.url ||
          (typeof file.preview === "string" ? file.preview : "");

        return (
          <Flex
            key={file.uid}
            style={{ position: "relative", width: 44, height: 44 }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid ${colorBorder}`,
                background: colorBgElevated,
              }}
            >
              {source ? (
                <Image
                  src={source}
                  alt={file.name}
                  preview={false}
                  width={44}
                  height={44}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Flex
                  align="center"
                  justify="center"
                  style={{ width: "100%", height: "100%" }}
                >
                  <ImageIcon size={14} style={{ color: colorTextSecondary }} />
                </Flex>
              )}
            </div>

            <Button
              size="small"
              shape="circle"
              type="primary"
              danger
              icon={<X size={10} />}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemoveFile(file);
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
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
          onRemove={(file) => {
            onRemoveFile(file);
            return false;
          }}
          accept={accept}
          multiple={multiple}
          maxCount={maxUploadFiles}
          showUploadList={false}
          disabled={disabled || isLoadingUpload}
        >
          <Tooltip
            title={`Upload files (${files.length}/${maxUploadFiles})`}
            placement="top"
          >
            <Flex
              align="center"
              justify="center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                border: `2px dashed ${colorBorder}`,
                background: colorBgBase,
                cursor: "pointer",
              }}
            >
              {isLoadingUpload ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                  style={{ color: colorTextSecondary }}
                />
              ) : (
                <Plus size={16} style={{ color: colorTextSecondary }} />
              )}
            </Flex>
          </Tooltip>
        </Upload>
      )}

      {extraActions}
    </Flex>
  );

  if (!label) return tiles;

  return (
    <Flex vertical gap={4}>
      <Typography.Text style={{ fontSize: 11, color: colorTextSecondary }}>
        {label}
      </Typography.Text>
      {tiles}
    </Flex>
  );
};

export default WorkflowUpload;
