import React, { FC, useMemo } from "react";
import { Flex, Space, Typography, Tag, Button, theme } from "antd";

interface Message {
  imageUrls?: { id: string }[];
}

interface ResultHeaderProps {
  messages: Message[];
  onClear: () => void;
}

const ResultHeader: FC<ResultHeaderProps> = ({ messages, onClear }) => {
  const { token } = theme.useToken();
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
        background: token.colorBgBase,
        // ปิดช่อง padding ของ scroll container เหนือ header ไม่ให้เห็นรูปเลื่อนผ่าน
        boxShadow: `0 -16px 0 ${token.colorBgBase}`,
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