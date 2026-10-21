// omnihumen-result-header.tsx
import React, { FC, useMemo } from "react";
import { Flex, Space, Typography, Tag, Button, theme } from "antd";
import { Message } from "../chat-generate-omnihumen";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getCanvasBg } from "@/app/theme/themeConfig";

interface ResultHeaderProps {
  messages: Message[];
  onClear: () => void;
}

const OmnihumenResultHeader: FC<ResultHeaderProps> = ({
  messages,
  onClear,
}) => {
  const { token } = theme.useToken();
  const { mode } = useThemeMode();
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
         background: getCanvasBg(mode),
         // ปิดช่อง padding ของ scroll container เหนือ header ไม่ให้เห็นรูปเลื่อนผ่าน
         boxShadow: `0 -16px 0 ${getCanvasBg(mode)}`,
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

export default OmnihumenResultHeader;