import React, { FC } from "react";
import { Button, Space, message as antMessage  } from "antd";
import {
  DownloadOutlined,
  StarFilled,
  StarOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { Message, VideoMessage } from "../chat-generate-dreamactor";

interface DreamActionBarProps {
  item: VideoMessage;
  message: Message;
  onDownload: (fileName: string, id: string) => void;
    onToggleFavorite: (taskId: string, id: string, status: boolean) => void;
    onDelete: (taskId: string, id: string) => void;
}

const DreamActionBar: FC<DreamActionBarProps> = ({
  item,
  message,
  onDownload,
  onToggleFavorite,
  onDelete,
}) => {
  return (
    <div className="image-actions">
      <Space size={4}>
        {/* LIKE */}
        <Button
          size="middle"
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
            background: item.status ? "#faad14" : "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />

        {/* COPY */}
        <Button
          size="middle"
          icon={<CopyOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(message.prompt || "");
            antMessage.success("Copied");
          }}
          style={{
            background: "rgba(40,40,40,0.85)",
            border: "none",
          }}
        />

        {/* DOWNLOAD */}
        <Button
          size="middle"
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
export default DreamActionBar;