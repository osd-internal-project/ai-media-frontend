import React, { FC } from "react";
import { Card, Flex, Space, Typography, Tag, Divider, Row, Col } from "antd";

import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import VideoItem from "../video-gen/video-player";
import { Message } from "./chat-generate-dreamactor";
import DreamActionBar from "./action-bar";
import useResponsive from "@/app/hooks/useResponsive";

interface Props {
  message: Message;
  onDownloadVideo: (fileName: string, id: string) => void;
  onShareVideo: (taskId: string, id: string, status: boolean) => void;
  onDelete: (taskId: string, id: string) => void;
}

const DreamactorResultItem: FC<Props> = ({
  message,
  onDownloadVideo,
  onShareVideo,
  onDelete,
}) => {
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
      styles={{ body: { padding: 12 } }}
    >
      {/* HEADER */}
      {/* <Flex justify="space-between" align="center">
        <Space>
          <Typography.Text strong>#{message.taskId}</Typography.Text>

          <Tag>{message.imageUrls?.length || 0} videos</Tag>

          <Typography.Text ellipsis style={{ maxWidth: 300 }}>
            {message.prompt || ""} */}
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
              color: "#1677ff",
            }}
          >
            {message.resolution || ""}
          </Typography.Text>

          <Typography.Text
            style={{
              fontSize: isMobile ? 15 : 14,
              fontWeight: 600,
              color: "#1677ff",
            }}
          >
            {message.generateConfig?.modelName || ""}
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
        </Space>
      </Flex>

      <Divider />

      {/* LOADING */}
      {(message.genneratedStatus === "PENDING" ||
        message.genneratedStatus === "PROCESSING") && (
        <Card size="small">
          <AiImageLoader />
        </Card>
      )}

      {/* ERROR */}
      {(message.genneratedStatus === "FAILED" ||
        message.genneratedStatus === "FAIL") && (
        <Card size="small">
          <Typography.Text type="danger">Generate failed</Typography.Text>
        </Card>
      )}

      {/* SUCCESS */}
      {message.genneratedStatus === "SUCCESS" &&
        message.imageUrls?.length > 0 && (
          <Row gutter={[8, 8]}>
            {message.imageUrls.map((video, i) => (
              <Col
                key={video.id || i}
                xs={isMobile ? 24 : 24}
                sm={12}
                md={12}
                lg={8}
              >
                <div
                  style={{
                    position: "relative",
                    marginBottom: isMobile ? 8 : 0,
                  }}
                >
                  <VideoItem
                    videoData={video}
                    onDownloadVideo={onDownloadVideo}
                    onShareVideo={() =>
                      video.id &&
                      onShareVideo(message.taskId, video.id, !!video.status)
                    }
                    taskId={message.taskId}
                  />

                  <DreamActionBar
                    item={video}
                    message={message}
                    onDownload={onDownloadVideo}
                    onToggleFavorite={onShareVideo}
                    onDelete={onDelete}
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}
    </Card>
  );
};
export default DreamactorResultItem;
