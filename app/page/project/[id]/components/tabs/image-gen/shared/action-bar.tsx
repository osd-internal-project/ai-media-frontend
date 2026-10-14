import React from "react";
import { Button, Space } from "antd";
import {
  StarFilled,
  StarOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { aiCaveColors } from "@/app/theme/themeConfig";

interface ActionBarProps {
  item: {
    id: string;
    status?: boolean;
    fileName?: string;
    imageUrl?: string;
  };
  message: any;

  onToggleFavorite: (taskId: string, id: string, status: boolean) => void;
  onDownload: (fileName: string, id: string) => void;
  onDelete: (taskId: string, id: string) => void;

  messageApi: any;
}

const ActionBar: React.FC<ActionBarProps> = ({
  item,
  message,
  onToggleFavorite,
  onDownload,
  onDelete,
  messageApi,
}) => {
  /**
   * Copy the generated image itself to the clipboard (not the prompt text).
   * Fetches the image and normalizes it to PNG — the async Clipboard API only
   * reliably supports `image/png` for image writes across browsers.
   */
  const handleCopyImage = async () => {
    const url = item.imageUrl;
    if (!url) {
      messageApi.error("No image to copy");
      return;
    }
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      messageApi.error("Copying images is not supported in this browser");
      return;
    }

    // Lazy PNG blob — passed as a promise so Safari keeps the user gesture.
    const toPngBlob = async (): Promise<Blob> => {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      if (blob.type === "image/png") return blob;

      // Re-encode non-PNG (e.g. JPEG/WebP) via canvas. Using a blob-derived
      // bitmap avoids cross-origin canvas tainting.
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported");
      ctx.drawImage(bitmap, 0, 0);
      const png = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!png) throw new Error("Failed to encode image");
      return png;
    };

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": toPngBlob() }),
      ]);
      messageApi.success("Copied Image");
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : "Failed to copy image",
      );
    }
  };

  return (
    <div className="image-actions">
      <Space size={4}>
        {/* LIKE */}
        <Button
          size="middle"
          className="action-bar-btn like-btn"
          icon={
            item.status ? (
              <StarFilled style={{ color: "#fff", fontSize: 18 }} />
            ) : (
              <StarOutlined style={{ color: "#fff", fontSize: 18 }} />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(message.taskId, item.id, !!item.status);
          }}
          style={{
            background: item.status
              ? aiCaveColors.warning
              : "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />

        {/* COPY */}
        {/* <Button
          size="middle"
          className="action-bar-btn default-btn"
          icon={<CopyOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            handleCopyImage();
          }}
          style={{
            background: "rgba(40,40,40,0.85)",
            border: "none",
          }}
        /> */}

        {/* DOWNLOAD */}
        <Button
          size="middle"
          className="action-bar-btn default-btn"
          icon={<DownloadOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(item.fileName || "image.jpg", item.id);
          }}
          style={{
            background: "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />

        {/* DELETE */}
        {/* <Button
          size="middle"
          danger
          className="action-bar-btn delete-btn"
          icon={<DeleteOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(message.taskId, item.id);
          }}
          style={{
            background: "rgba(40,40,40,0.85)",
            border: "none",
          }}
        /> */}
      </Space>
    </div>
  );
};

export default ActionBar;