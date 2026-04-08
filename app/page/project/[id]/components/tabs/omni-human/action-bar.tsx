import React, { FC } from "react";
import { Button, Space } from "antd";
import {
  StarFilled,
  StarOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { aiCaveColors } from "@/app/theme/themeConfig";
import { Message, VideoMessage } from "./chat-generate-omnihumen";

interface OmniActionBarProps {
  item: VideoMessage;
  message: Message;
  onToggleFavorite: (taskId: string, id: string, status: boolean) => void;
  onDownload: (fileName: string, id: string) => void;
  onDelete: (taskId: string, id: string) => void;
  messageApi: any;
}

const OmniActionBar: FC<OmniActionBarProps> = ({
  item,
  message,
  onToggleFavorite,
  onDownload,
  onDelete,
  messageApi,
}) => {
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
            if (!item.id) return;
            onToggleFavorite(message.taskId, item.id, !!item.status);
          }}
          style={{
            background: item.status
              ? aiCaveColors.warning
              : "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />

        {/* COPY PROMPT */}
        <Button
          size="middle"
          className="action-bar-btn default-btn"
          icon={<CopyOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(message.prompt || "");
            messageApi?.success?.("Copied");
          }}
          style={{
            background: "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />

        {/* DOWNLOAD */}
        <Button
          size="middle"
          className="action-bar-btn default-btn"
          icon={<DownloadOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            if (!item.id) return;
            onDownload(item.fileName || "video.mp4", item.id);
          }}
          style={{
            background: "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />

        {/* DELETE */}
        <Button
          size="middle"
          danger
          className="action-bar-btn delete-btn"
          icon={<DeleteOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            if (!item.id) return;
            onDelete(message.taskId, item.id);
          }}
          style={{
            background: "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />
      </Space>
    </div>
  );
};

export default OmniActionBar;