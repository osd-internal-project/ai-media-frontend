import React, { FC, useMemo } from "react";
import { Flex, Space, Typography, Tag, Button } from "antd";

interface VideoMessage {
  id?: string;
}

interface Message {
  genneratedStatus?: string;
  imageUrls?: VideoMessage[];
}

interface ResultHeaderProps {
  messages: Message[];
  onClear: () => void;
}

const ResultHeader: FC<ResultHeaderProps> = ({ messages, onClear }) => {
  // ✅ นับจำนวน video ทั้งหมด
  const totalVideos = useMemo(() => {
    return messages.reduce(
      (acc, m) => acc + (m.imageUrls?.length || 0),
      0,
    );
  }, [messages]);

  // ✅ นับจำนวนงาน
  const totalTasks = messages.length;

  // ✅ นับสถานะกำลัง generate
  const processingCount = useMemo(() => {
    return messages.filter(
      (m) =>
        m.genneratedStatus === "PENDING" ||
        m.genneratedStatus === "PROCESSING",
    ).length;
  }, [messages]);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        padding: "10px 12px",
        background: "inherit",
        backdropFilter: "blur(6px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Flex justify="space-between" align="center">
        <Space size={8}>
          <Typography.Title level={5} style={{ margin: 0 }}>
           Results
          </Typography.Title>

          {/* จำนวน task */}
          {/* <Tag>{totalTasks} tasks</Tag> */}

          {/* จำนวน video */}
          <Tag >{totalVideos}</Tag>

          {/* กำลัง generate */}
          {processingCount > 0 && (
            <Tag color="gold">{processingCount} processing</Tag>
          )}
        </Space>

        <Button
          danger
          size="small"
          onClick={onClear}
          disabled={messages.length === 0}
        >
          Clear All
        </Button>
      </Flex>
    </div>
  );
};

export default ResultHeader;