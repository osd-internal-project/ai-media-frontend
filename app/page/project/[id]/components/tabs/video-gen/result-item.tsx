import React, { FC } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import { Card, Flex, Space, Typography, Tag, Button, Divider } from "antd";
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

  const { isMobile } = useResponsive();

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
      <Flex
        justify={isMobile ? "start" : "space-between"}
        align={isMobile ? "start" : "center"}
        style={{
          marginBottom: 8,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 4 : 0,
        }}
      >
        <Space
          // direction={isMobile ? "vertical" : "horizontal"}
          size={isMobile ? 2 : 8}
          style={{ width: isMobile ? "100%" : undefined }}
        >
          {/* <Typography.Text
              style={{ fontWeight: 600, fontSize: isMobile ? 15 : 14 }}
            >
              #{message.taskId}
            </Typography.Text> */}
          <Typography.Text
            style={{
              fontSize: isMobile ? 15 : 14,
              color: semantic.colorPrimary,
            }}
          >
            {message.resolution || ""}
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: isMobile ? 15 : 14,
              color: semantic.colorTextSecondary,
            }}
          >
            {message.generateConfig?.ratio || ""}
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: isMobile ? 15 : 14,
              color: semantic.colorTextSecondary,
            }}
          >
            {message.generateConfig?.duration || ""} s
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: isMobile ? 15 : 14,
              color: semantic.colorTextSecondary,
            }}
          >
            {message.generateConfig?.generateAudio ? (
              <Volume1 color="green" size={14} />
            ) : (
              <VolumeX size={14} />
            )}
          </Typography.Text>

          <Typography.Text
            style={{
              fontSize: isMobile ? 15 : 14,
              fontWeight: 600,
              color: semantic.colorPrimary,
            }}
          >
            {message.generateConfig?.modelName || ""}
          </Typography.Text>

          <Typography.Text
            ellipsis
            style={{
              maxWidth: isMobile ? 180 : 300,
              color: semantic.colorTextSecondary,
              fontSize: isMobile ? 13 : 14,
            }}
          >
            {message.prompt}
          </Typography.Text>
        </Space>
        <Space
          // direction={isMobile ? "vertical" : "horizontal"}
          size={isMobile ? 2 : 8}
          style={{
            marginTop: isMobile ? 6 : 0,
            alignItems: isMobile ? "flex-start" : "center",
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
            danger
            size="small"
            style={{ padding: isMobile ? 0 : undefined }}
            onClick={() =>
              setMessages((prev) => prev.filter((m) => m.id !== message.id))
            }
          >
            🗑
          </Button>
        </Space>
      </Flex>

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
              gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
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
