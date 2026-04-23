import React, { FC, useMemo } from "react";
import { Flex, Space, Typography, Tag, Button } from "antd";

interface Message {
  imageUrls?: { id: string }[];
}

interface ResultHeaderProps {
  messages: Message[];
  onClear: () => void;
}

const ResultHeader: FC<ResultHeaderProps> = ({ messages, onClear }) => {
  const totalImages = useMemo(() => {
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
        padding: "8px 12px",
        background: "inherit",
        backdropFilter: "blur(6px)",
      }}
    >
      <Flex justify="space-between" align="center">
        <Space>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Result
          </Typography.Title>
          <Tag>{totalImages}</Tag>
        </Space>

        {/* <Button danger size="small" onClick={onClear}>
          Clear All
        </Button> */}
      </Flex>
    </div>
  );
};

export default ResultHeader;