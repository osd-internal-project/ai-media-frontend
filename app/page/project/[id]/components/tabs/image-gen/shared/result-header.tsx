import React, { FC, useMemo } from "react";
import { canvasBg } from "@/app/theme/surface";
import { Flex, Space, Typography, Tag, Button, theme } from "antd";
import { useThemeMode } from "@/app/components/ThemeProvider";

interface Message {
  imageUrls?: { id: string }[];
}

interface ResultHeaderProps {
  messages: Message[];
  onClear: () => void;
}

const ResultHeader: FC<ResultHeaderProps> = ({ messages, onClear }) => {
  const { token } = theme.useToken();
  const { mode } = useThemeMode();
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
        background: canvasBg(mode),
        // ปิดช่อง padding ของ scroll container เหนือ header ไม่ให้เห็นรูปเลื่อนผ่าน
        boxShadow: `0 -16px 0 ${canvasBg(mode)}`,
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