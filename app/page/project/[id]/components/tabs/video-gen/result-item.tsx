import React, { FC, useState, useRef, useEffect } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import { Card, Space, Typography, Button, Divider, Row, Col } from "antd";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { Message, VideoMessage } from "./chat-generate-video";
import { message as antdMessage } from "antd";
import VideoItem from "./video-player";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { Volume1, VolumeX, User, Trash2 } from "lucide-react";

interface Props {
  message: Message;
  index: number;
  semantic: any;
  aiCaveColors: any;

  onShareVideo: (taskId: string, id: string, status: boolean) => void;
  onDownloadVideo: (fileName: string, id: string) => void;

  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
}

const VideoResultItem: FC<Props> = ({
  message,
  index,
  semantic,
  aiCaveColors,
  onShareVideo,
  onDownloadVideo,
  setMessages,
  selectedAIModel,
}) => {
  const [messageApi, contextHolder] = antdMessage.useMessage();

  const isLoading =
    message.genneratedStatus === "PENDING" ||
    message.genneratedStatus === "PROCESSING";

  const isError =
    message.genneratedStatus === "FAIL" ||
    (message.genneratedStatus === "SUCCESS" &&
      (!message.imageUrls || message.imageUrls.length === 0));

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
      styles={{ body: { padding: isMobile ? 0 : isTablet ? 8 : 12, background: "none" } }}
    >
      {contextHolder}

      {/* HEADER */}
      {isMobile || isTablet ? (
        <div style={{ marginBottom: 8, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 6, width: "100%", flexWrap: "wrap" }}>
              <Typography.Text style={{ fontSize: metaFontSize, color: semantic.colorPrimary, fontWeight: 400, whiteSpace: "nowrap" }}>{message.resolution || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: metaFontSize, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.ratio || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: metaFontSize, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.duration || ""} s</Typography.Text>
              <Typography.Text style={{ fontSize: metaFontSize, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.generateAudio ? (<Volume1 color="green" size={metaFontSize} />) : (<VolumeX size={metaFontSize} />)}</Typography.Text>
              <Typography.Text style={{ fontSize: metaFontSize, fontWeight: 600, color: semantic.colorPrimary, whiteSpace: "nowrap", marginRight: 6 }}>{message.generateConfig?.modelName || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: metaFontSize, color: semantic.colorTextSecondary, fontWeight: 400, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
                  <User size={metaFontSize} style={{ marginRight: 2, verticalAlign: "middle" }} />
                  {message.users?.fullname || message.users?.username || "-"}
                </span>
              </Typography.Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
              <Typography.Text
                ref={promptRef}
                style={{
                  color: semantic.colorTextSecondary,
                  fontSize: promptFontSize,
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
                  style={{ color: semantic.colorPrimary, fontSize: isMobile ? 12 : 13, padding: 0, marginLeft: 4 }}
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
                icon={<Trash2 size={14} />}
                size="small"
                style={{ padding: 0 }}
                onClick={() =>
                  setMessages((prev) => prev.filter((m) => m.id !== message.id))
                }
              >
                
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
                  color: semantic.colorTextSecondary,
                  whiteSpace: "nowrap",
                }}
              >
                {message.generateConfig?.duration || ""} s
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
                {message.generateConfig?.generateAudio ? (
                  <Volume1 color="green" size={metaFontSize} />
                ) : (
                  <VolumeX size={metaFontSize} />
                )}
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
                <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
                  <User size={metaFontSize} style={{ marginRight: 2, verticalAlign: "middle" }} />
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
                <Button
                  type="text"
                  icon={<Trash2 size={12} />}
                  danger
                  size="small"
                  onClick={() =>
                    setMessages((prev) => prev.filter((m) => m.id !== message.id))
                  }
                >
                  
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
                  fontSize: promptFontSize,
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
                  style={{ color: semantic.colorPrimary, fontSize: isMobile ? 12 : 13, padding: 0, marginLeft: 4 }}
                  onClick={() => setShowFullPrompt((v) => !v)}
                >
                  {showFullPrompt ? "ย่อ" : "...ดูเพิ่มเติม"}
                </Button>
              )}
            </Col>
          </Row>
        </>
      )}
    

      <Divider style={{ margin: "14px 0" }} />

      {/* LOADING */}
      {isLoading && <AiImageLoader />}

      {/* ERROR */}
      {isError && (
        <Typography.Text style={{ color: semantic.colorError }}>
          Generate failed
        </Typography.Text>
      )}

      {/* VIDEOS */}
      {message.genneratedStatus === "SUCCESS" &&
        message.imageUrls?.length > 0 && (
          <div
            style={{
              marginTop: 8,
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                ? "repeat(2, 1fr)"
                : "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {message.imageUrls.map((video: VideoMessage, i) => (
              <VideoItem
                key={video.id || `${message.taskId}-${i}`}
                videoData={video}
                taskId={message.taskId!}
                messagePrompt={message.prompt}
                onDownloadVideo={onDownloadVideo}
                onShareVideo={(taskId, id, status) => {
                  onShareVideo(taskId, id, status);
                }}
              />
            ))}
          </div>
        )}
    </Card>
  );
};

export default VideoResultItem;
