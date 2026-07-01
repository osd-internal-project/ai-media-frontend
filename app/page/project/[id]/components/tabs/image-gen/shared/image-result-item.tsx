import React, { FC, useEffect, useRef, useState } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import {
  Card,
  Space,
  Typography,
  Button,
  Divider,
  Row,
  Col,
  Image,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { ImageOff, Trash2, User } from "lucide-react";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import ActionBar from "./action-bar";
import { Message } from "../chat-generate-image";
import ImageSmartReference from "./image-smart-reference";
import { MediaSkeleton } from "../../../shared/smart-media";

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
  const { isMobile, isTablet } = useResponsive();
  const metaFontSize = isMobile ? 11 : isTablet ? 12 : 14;
  const promptFontSize = isMobile ? 13 : isTablet ? 14 : 16;

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
      setIsOverflow(
        (prev) =>
          prev ||
          el.scrollWidth > el.clientWidth ||
          el.scrollHeight > el.clientHeight,
      );
    }
    // eslint-disable-next-line
  }, [message.prompt, isMobile, isTablet]);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.prompt);
      messageApi.success("Copied Prompt");
    } catch (err: any) {
      messageApi.error("Copied Prompt Failed");
    }
  };
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
      styles={{
        body: { padding: isMobile ? 0 : isTablet ? 8 : 12, background: "none" },
      }}
    >
      {/* HEADER */}
      {isMobile || isTablet ? (
        <div style={{ marginBottom: 8, width: "100%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 6,
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              <Typography.Text
                style={{
                  fontSize: metaFontSize,
                  color: semantic.colorPrimary,
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                }}
              >
                {message.resolution || ""}
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: metaFontSize,
                  color: semantic.colorTextSecondary,
                  whiteSpace: "nowrap",
                }}
              >
                {message.generateConfig?.ratio || ""}
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: metaFontSize,
                  fontWeight: 600,
                  color: semantic.colorPrimary,
                  whiteSpace: "nowrap",
                  marginRight: 6,
                }}
              >
                {message.generateConfig?.modelName || ""}
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: metaFontSize,
                  color: semantic.colorTextSecondary,
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <User
                    size={metaFontSize}
                    style={{ marginRight: 2, verticalAlign: "middle" }}
                  />
                  {message.users?.fullname || message.users?.username || "-"}
                </span>
              </Typography.Text>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 2 }}
            >
              <Typography.Text
                ref={promptRef}
                style={{
                  color: semantic.colorTextSecondary,
                  fontSize: promptFontSize,
                  fontStyle: "italic",
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
                  style={{
                    color: semantic.colorPrimary,
                    fontSize: isMobile ? 12 : 13,
                    padding: 0,
                    marginLeft: 4,
                  }}
                  onClick={() => setShowFullPrompt((v) => !v)}
                >
                  {showFullPrompt ? "Show less" : "...Show more"}
                </Button>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
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
                icon={<Trash2 size={12} />}
                size="small"
                style={{ padding: 0 }}
                onClick={() =>
                  setMessages((prev) => prev.filter((m) => m.id !== message.id))
                }
              ></Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Row
            gutter={8}
            align="middle"
            style={{ marginBottom: 8, flexWrap: "nowrap", overflowX: "auto" }}
          >
            <Col flex="none">
              <Typography.Text
                style={{
                  fontSize: metaFontSize,
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
                  fontSize: metaFontSize,
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
                  fontSize: metaFontSize,
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
                  fontSize: metaFontSize,
                  color: semantic.colorTextSecondary,
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <User
                    size={metaFontSize}
                    style={{ marginRight: 2, verticalAlign: "middle" }}
                  />
                  {message.users?.fullname || message.users?.username || "-"}
                </span>
                <ImageSmartReference
                  referenceImages={message.referenceImages}
                />
              </Typography.Text>
            </Col>
            <Col
              flex="auto"
              style={{
                minWidth: 0,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Space
                size={8}
                style={{
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: isMobile ? 11 : 12 }}
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
                {/* <Button
                type="text"
                icon={<Trash2 size={14} />}
                danger
                size="small"
                onClick={() =>
                  setMessages((prev) => prev.filter((m) => m.id !== message.id))
                }
              >
               
              </Button> */}
              </Space>
            </Col>
          </Row>
          <Row>
            <Col
              flex="auto"
              style={{ minWidth: 0, display: "flex", alignItems: "center" }}
            >
              <Typography.Text
                ref={promptRef}
                style={{
                  color: semantic.colorTextSecondary,
                  fontSize: promptFontSize,
                  fontStyle: "italic",
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
              <Space>
                {isOverflow && (
                  <Button
                    type="link"
                    size="small"
                    style={{
                      color: semantic.colorPrimary,
                      fontSize: isMobile ? 12 : 13,
                      padding: 0,
                      marginLeft: 4,
                    }}
                    onClick={() => setShowFullPrompt((v) => !v)}
                  >
                    {showFullPrompt ? "Show less" : "...Show more"}
                  </Button>
                )}
                {/* ปุ่ม Copy เพิ่มเติมเข้ามาตรงนี้ */}
                <Button
                  type="text"
                  size="small"
                  icon={
                    <CopyOutlined
                      style={{ color:'#888'}}
                    />
                  }
                  style={{
                    color: semantic.colorTextDescription,
                    fontSize: isMobile ? 12 : 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={handleCopy}
                />
              </Space>
            </Col>
          </Row>
        </>
      )}

      <Divider style={{ margin: "14px 0" }} />
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
                      placeholder={<MediaSkeleton rounded={isMobile ? 6 : 8} />}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: isMobile ? 6 : 8,
                      }}
                    />

                    {/* File size label */}
                    {message.generateConfig?.width &&
                      message.generateConfig?.height && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 6,
                            left: 6,
                            background: "rgba(0,0,0,0.55)",
                            borderRadius: 4,
                            padding: "1px 6px",
                            pointerEvents: "none",
                          }}
                        >
                          <Typography.Text
                            style={{
                              color: "#fff",
                              fontSize: isMobile ? 10 : 11,
                              fontWeight: 500,
                              lineHeight: 1.4,
                            }}
                          >
                            {message.generateConfig.width}×
                            {message.generateConfig.height}
                          </Typography.Text>
                        </div>
                      )}

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
