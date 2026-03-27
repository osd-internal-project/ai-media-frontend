import React, { FC } from "react";
import {
  Card,
  Flex,
  Space,
  Typography,
  Tag,
  Button,
  Divider,
  Row,
  Col,
  Image,
} from "antd";
import { ImageOff } from "lucide-react";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import ActionBar from "./action-bar";
import { Message } from "./chat-generate-image";



interface Props {
  message: Message;
  index: number;
  semantic: any;
  aiCaveColors: any;
  onShareImage: any;
  onDownloadImage: any;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messageApi: any;
}

const ResultItem: FC<Props> = ({
  message,
  index,
  semantic,
  aiCaveColors,
  onShareImage,
  onDownloadImage,
  setMessages,
  messageApi,
}) => {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 24,
        borderRadius: 12,
        border: "none",
        background: "none",
        boxShadow: "none",
      }}
      styles={{ body: { padding: 12, background: "none" } }}
    >
      {/* HEADER */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Space>
          <Typography.Text >#{message.taskId}</Typography.Text>

          <Tag
            style={{
              color: aiCaveColors.dreamActor,
              border: `1.5px solid ${semantic.colorBorder}`,
              background: "transparent",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 8,
              padding: "2px 10px",
            }}
          >
            {message.imageUrls?.length || 0} imgs
          </Tag>

          <Typography.Text
            ellipsis
            style={{
              maxWidth: 300,
              color: semantic.colorTextSecondary,
            }}
          >
            "{message.prompt}"
          </Typography.Text>
        </Space>

        <Space>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(message.createdAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography.Text>

          <Button
            type="text"
            danger
            size="small"
            onClick={() =>
              setMessages((prev) =>
                prev.filter((m) => m.id !== message.id),
              )
            }
          >
            🗑
          </Button>
        </Space>
      </Flex>

      <Divider style={{ margin: "16px 0" }} />

      {/* LOADING */}
      {(message.genneratedStatus === "PENDING" ||
        message.genneratedStatus === "PROCESSING") && (
        <Card
          size="small"
          style={{
            marginTop: 8,
            borderRadius: 8,
            borderColor: semantic.colorBorder,
            background: semantic.colorBgElevated,
          }}
          styles={{ body: { padding: 8 } }}
        >
          <AiImageLoader />
        </Card>
      )}

      {/* ERROR */}
      {(message.genneratedStatus === "FAILED" ||
        (message.genneratedStatus === "SUCCESS" &&
          !message.imageUrls)) && (
        <Card
          size="small"
          style={{
            marginTop: 8,
            borderRadius: 8,
            borderColor: semantic.colorErrorBorder,
            background: semantic.colorErrorBg,
          }}
          styles={{ body: { padding: 8 } }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ImageOff
              style={{
                fontSize: 40,
                color: semantic.colorError,
                marginBottom: 8,
              }}
            />
            <Typography.Text style={{ color: semantic.colorError }}>
              Generate failed
            </Typography.Text>
          </div>
        </Card>
      )}

      {/* IMAGES */}
      {message.genneratedStatus === "SUCCESS" &&
        message.imageUrls &&
        message.imageUrls.length > 0 && (
          <Row gutter={[8, 8]} style={{ marginTop: 8, width: "100%" }}>
            <Image.PreviewGroup>
              {message.imageUrls.map((imgUrl, i) => (
                <Col key={imgUrl.id} xs={12} sm={12} md={6} lg={6}>
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 8,
                      aspectRatio: `${message.generateConfig.width} / ${message.generateConfig.height}`,
                    }}
                    className="image-item"
                  >
                    <Image
                      src={imgUrl.imageUrl}
                      alt={`Generated ${i + 1}`}
                      width="100%"
                      height="100%"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                <ActionBar
  item={imgUrl}
  message={message}
  onToggleFavorite={onShareImage}
  onDownload={onDownloadImage}
  onDelete={(taskId, id) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.taskId === taskId) {
          return {
            ...msg,
            imageUrls: msg.imageUrls.filter((img) => img.id !== id),
          };
        }
        return msg;
      })
    );
  }}
  messageApi={messageApi}
/>
                  </div>
                </Col>
              ))}
            </Image.PreviewGroup>
          </Row>
        )}
    </Card>
  );
};

export default ResultItem;


