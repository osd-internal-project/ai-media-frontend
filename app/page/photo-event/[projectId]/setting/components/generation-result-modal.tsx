"use client";

import React, { useMemo } from "react";
import { Button, Image, Modal, QRCode, Space, Typography, message } from "antd";
import { Copy, Download, ExternalLink } from "lucide-react";
import type { IPhotoEventGeneration } from "@/app/common/photo-event.type";
import PhotoEventService from "@/app/services/photo-event.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { buildPhotoShareUrl } from "@/app/utils/photo-event";

interface GenerationResultModalProps {
  generation: IPhotoEventGeneration | null;
  onClose: () => void;
}

export default function GenerationResultModal({
  generation,
  onClose,
}: GenerationResultModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const photoEventService = useMemo(() => PhotoEventService(axiosCore), []);
  const shareUrl = generation ? buildPhotoShareUrl(generation.id) : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      messageApi.success("Link copied");
    } catch {
      messageApi.error("Cannot copy link");
    }
  };

  return (
    <Modal
      open={Boolean(generation)}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
      title={generation?.templateTitle || "Generated photo"}
    >
      {contextHolder}
      {generation?.resultUrl && (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px", maxWidth: 380 }}>
            <Image
              src={generation.resultUrl}
              alt="Generated photo"
              style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 12 }}
            />
          </div>
          <Space direction="vertical" size={16} style={{ flex: "1 1 220px", alignItems: "center" }}>
            <QRCode value={shareUrl} size={220} bgColor="#ffffff" color="#000000" />
            <Typography.Text type="secondary">Scan to download</Typography.Text>
            <Space wrap>
              <Button icon={<Copy size={14} />} onClick={copyLink}>
                Copy link
              </Button>
              <Button
                icon={<ExternalLink size={14} />}
                href={shareUrl}
                target="_blank"
              >
                Open
              </Button>
              <Button
                type="primary"
                icon={<Download size={14} />}
                href={photoEventService.publicDownloadUrl(generation.id)}
              >
                Download
              </Button>
            </Space>
          </Space>
        </div>
      )}
    </Modal>
  );
}
