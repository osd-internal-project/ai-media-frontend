import React, { FC, useMemo } from "react";
import { Flex, Space, Typography, Tag, Button } from "antd";
import { Message } from "../chat-generate-dreamactor";

interface ResultHeaderProps {
  messages: Message[];
  onClear: () => void;
}

const DreamactorResultHeader: FC<ResultHeaderProps> = ({
  messages,
  onClear,
}) => {
  const totalVideos = useMemo(() => {
    return messages.reduce(
      (acc, m) => acc + (m.imageUrls?.length || 0),
      0,
    );
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
        <Space>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Result
          </Typography.Title>

          <Tag>{totalVideos}</Tag>
        </Space>

        {/* <Button danger size="small" onClick={onClear}>
          Clear All
        </Button> */}
      </Flex>
    </div>
  );
};

export default DreamactorResultHeader;