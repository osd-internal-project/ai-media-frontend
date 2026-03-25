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
        <Button
          size="middle"
          className="action-bar-btn default-btn"
          icon={<CopyOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(message.prompt || "");
            messageApi.success("Copied");
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
            onDownload(item.fileName || "image.jpg", item.id);
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

export default ActionBar;