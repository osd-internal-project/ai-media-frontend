import React, { FC, useEffect, useRef, useState } from "react";
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
import { ImageOff, User } from "lucide-react";
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

  // State for show more/less prompt
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  // ปุ่ม more/ย่อ จะโชว์เมื่อ overflow เท่านั้น
   const [isOverflow, setIsOverflow] = useState(false);
  const promptRef = useRef<HTMLSpanElement>(null);

  // เมื่อข้อความล้น ให้จำสถานะ overflow ไว้จนกว่า message.prompt เปลี่ยน
  useEffect(() => {
    if (promptRef.current) {
      const el = promptRef.current;
      // ถ้าเคย overflow แล้ว ให้คงไว้จนกว่าจะเปลี่ยนข้อความใหม่
      setIsOverflow(prev => prev || el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
    }
    // eslint-disable-next-line
  }, [message.prompt, isMobile, isTablet]);

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
      styles={{ body: { padding: isMobile? 0 :  12, background: "none" } }}
    >
      {/* HEADER */}
      {isMobile || isTablet ? (
        <div style={{ marginBottom: 8, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 6, width: "100%" }}>
              <Typography.Text style={{ fontSize: 11, color: semantic.colorPrimary, fontWeight: 400, whiteSpace: "nowrap" }}>{message.resolution || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 11, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.ratio || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 11, fontWeight: 600, color: semantic.colorPrimary, whiteSpace: "nowrap", marginRight: 6 }}>{message.generateConfig?.modelName || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 11, color: semantic.colorTextSecondary, fontWeight: 400, whiteSpace: "nowrap",display: "inline-flex",
                alignItems: "center",
                gap: 4,}}>
                 <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
                <User size={12} style={{ marginRight: 2, verticalAlign: "middle" }} />
                {message.users?.fullname || message.users?.username || "-"}
              </span>
              </Typography.Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
              <Typography.Text
                ref={promptRef}
                style={{
                  color: semantic.colorTextSecondary,
                  fontSize: 14,
                  fontStyle: 'italic',
                  overflow: showFullPrompt ? "visible" : "hidden",
                  textOverflow: showFullPrompt ? "unset" : "ellipsis",
                  whiteSpace: showFullPrompt ? "normal" : "nowrap",
                  display: "block",
                  width: "100%",
                  minWidth: 0,
                  maxWidth: "100%",
                }}
              >
                {`"${message.prompt}"`}
              </Typography.Text>
              {isOverflow && (
                <Button
                  type="link"
                  size="small"
                  color={semantic.colorPrimary}
                  style={{ fontSize: 12, padding: 0, marginLeft: 4 }}
                  onClick={() => setShowFullPrompt((v) => !v)}
                >
                  {showFullPrompt ? "ย่อ" : "...ดูเพิ่มเติม"}
                </Button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
              <Typography.Text type="secondary" style={{ fontSize: 10 }}>
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
          <>
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
                fontSize: isMobile || isTablet ? 13 : 14,
                fontWeight: 600,
                color: semantic.colorPrimary,
                whiteSpace: "nowrap",
                marginRight: 8,
              }}
            >
              {message.generateConfig?.modelName || ""}
            </Typography.Text>
            <Typography.Text
              style={{
                fontSize: isMobile || isTablet ? 13 : 14,
                color: semantic.colorTextSecondary,
                fontWeight: 400,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
                <User size={isMobile || isTablet ? 13 : 14} style={{ marginRight: 2, verticalAlign: "middle" }} />
                {message.users?.fullname || message.users?.username || "-"}
              </span>
            </Typography.Text>
          </Col>
          <Col flex="auto" style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
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
            <Row>
              <Col flex="auto" style={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
                <Typography.Text
                  ref={promptRef}
                  style={{
                    color: semantic.colorTextSecondary,
                    fontSize: 16,
                    fontStyle: 'italic',
                    overflow: showFullPrompt ? "visible" : "hidden",
                    textOverflow: showFullPrompt ? "unset" : "ellipsis",
                    whiteSpace: showFullPrompt ? "normal" : "nowrap",
                    display: "block",
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                  }}
                >
                  {`"${message.prompt}"`}
                </Typography.Text>
                {isOverflow && (
                  <Button
                    type="link"
                    size="small"
                    style={{ fontSize: 14, padding: 0, marginLeft: 4 }}
                    onClick={() => setShowFullPrompt((v) => !v)}
                  >
                    {showFullPrompt ? "ย่อ" : "...ดูเพิ่มเติม"}
                  </Button>
                )}
              </Col>
            </Row></>
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
