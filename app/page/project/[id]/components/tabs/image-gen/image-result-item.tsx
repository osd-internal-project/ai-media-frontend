import React, { FC } from "react";
import useResponsive from "@/app/hooks/useResponsive";
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
  Popover,
  Tooltip,
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
  const { isMobile,isTablet } = useResponsive();

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
      {isMobile || isTablet ? (
        <div style={{ marginBottom: 8, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, width: "100%" }}>
              <Typography.Text style={{ fontSize: 15, color: semantic.colorPrimary, fontWeight: 400, whiteSpace: "nowrap" }}>{message.resolution || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 15, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.ratio || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 15, fontWeight: 600, color: semantic.colorPrimary, whiteSpace: "nowrap" }}>{message.generateConfig?.modelName || ""}</Typography.Text>
            </div>
            <Typography.Text
              ellipsis
              style={{
                color: semantic.colorTextSecondary,
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              {message.prompt}
            </Typography.Text>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
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
                style={{ padding: 0 }}
                onClick={() =>
                  setMessages((prev) => prev.filter((m) => m.id !== message.id))
                }
              >
                🗑
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Row gutter={8} align="middle" style={{ marginBottom: 8, flexWrap: "nowrap", overflowX: "auto" }}>
          <Col flex="none">
            <Typography.Text
              style={{
                fontSize: 14,
                color: semantic.colorPrimary,
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              {message.resolution || ""}
            </Typography.Text>
          </Col>
          <Col flex="none">
            <Typography.Text
              style={{
                fontSize: 14,
                color: semantic.colorTextSecondary,
                whiteSpace: "nowrap",
              }}
            >
              {message.generateConfig?.ratio || ""}
            </Typography.Text>
          </Col>
          <Col flex="none">
            <Typography.Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: semantic.colorPrimary,
                whiteSpace: "nowrap",
              }}
            >
              {message.generateConfig?.modelName || ""}
            </Typography.Text>
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}>
            <Typography.Text
              ellipsis
              style={{
                color: semantic.colorTextSecondary,
                fontSize: 14,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              {message.prompt}
            </Typography.Text>
          </Col>
          <Col flex="none">
            <Space
              size={8}
              style={{
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12 }}
              >
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
                  setMessages((prev) => prev.filter((m) => m.id !== message.id))
                }
              >
                🗑
              </Button>
            </Space>
          </Col>
        </Row>
      )}

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
        (message.genneratedStatus === "SUCCESS" && !message.imageUrls)) && (
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
                <Col
                  key={imgUrl.id}
                  xs={isMobile ? 24 : 12}
                  sm={12}
                  md={12}
                  lg={6}
                >
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 8,
                      aspectRatio: `${message.generateConfig.width} / ${message.generateConfig.height}`,
                      marginBottom: isMobile ? 8 : 0,
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
                        borderRadius: isMobile ? 6 : 8,
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
                                imageUrls: msg.imageUrls.filter(
                                  (img) => img.id !== id,
                                ),
                              };
                            }
                            return msg;
                          }),
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
