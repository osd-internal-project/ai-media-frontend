import React, { FC } from "react";
import {
  Card,
  Flex,
  Space,
  Typography,
  Tag,
  Button,
  Divider,
} from "antd";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { Message, VideoMessage } from "./chat-generate-video";
import { message as antdMessage } from "antd";
import VideoItem from "./video-player";
import { TMasterModelType } from "@/app/common/master-model-type.type";

interface Props {
  message: Message;
  index: number;
  semantic: any;
  aiCaveColors: any;

  onShareVideo: (taskId: string, id: string, status: boolean) => void;
  onDownloadVideo: (fileName: string, id: string) => void;

  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  selectedAIModel:
    | (TMasterModelType & { capabilities?: string[] })
    | undefined;
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
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Space>
          <Typography.Text >#{message.taskId}</Typography.Text>

          <Tag
            style={{
              color: aiCaveColors?.dreamActor,
              border: `1.5px solid ${semantic.colorBorder}`,
              background: "transparent",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 8,
              padding: "2px 10px",
            }}
          >
            {message.imageUrls?.length || 0} videos
          </Tag>

          <Typography.Text
            ellipsis
            style={{ maxWidth: 300, color: semantic.colorTextSecondary }}
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
        gridTemplateColumns: "repeat(4, 1fr)",
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