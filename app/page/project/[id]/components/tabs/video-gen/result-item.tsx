import React, { FC } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import { Card, Flex, Space, Typography, Tag, Button, Divider, Row, Col } from "antd";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { Message, VideoMessage } from "./chat-generate-video";
import { message as antdMessage } from "antd";
import VideoItem from "./video-player";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import Paragraph from "antd/es/skeleton/Paragraph";
import { Volume, Volume1, VolumeX } from "lucide-react";

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
      {contextHolder}

      {/* HEADER */}
      {isMobile || isTablet ? (
        <div style={{ marginBottom: 8, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, width: "100%" }}>
              <Typography.Text style={{ fontSize: 15, color: semantic.colorPrimary, fontWeight: 400, whiteSpace: "nowrap" }}>{message.resolution || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 15, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.ratio || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 15, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.duration || ""} s</Typography.Text>
              <Typography.Text style={{ fontSize: 15, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.generateConfig?.generateAudio ? (<Volume1 color="green" size={14} />) : (<VolumeX size={14} />)}</Typography.Text>
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
                fontSize: 14,
                color: semantic.colorTextSecondary,
                whiteSpace: "nowrap",
              }}
            >
              {message.generateConfig?.generateAudio ? (
                <Volume1 color="green" size={14} />
              ) : (
                <VolumeX size={14} />
              )}
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
