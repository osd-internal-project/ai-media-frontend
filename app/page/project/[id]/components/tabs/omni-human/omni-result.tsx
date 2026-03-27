import React, { FC } from "react";
import { Card, Flex, Space, Typography, Tag, Divider, Row, Col } from "antd";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";

import VideoItem from "../video-gen/video-player";
import { Message } from "./chat-generate-omnihumen";
import OmniActionBar from "./action-bar";

interface Props {
  message: Message;
  index: number;
  semantic: any;
  onDownloadVideo: any;
  onShareVideo: any;
  setMessages: any;
  messageApi: any;
}

const OmniResultItem: FC<Props> = ({
  message,
  index,
  semantic,
  onDownloadVideo,
  onShareVideo,
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
      styles={{ body: { padding: 12 } }}
    >
      {/* HEADER */}
      <Flex justify="space-between" align="center">
        <Space>
                  <Typography.Text strong>#{message.taskId}</Typography.Text>

          <Tag>
            {message.imageUrls?.length || 0} videos
          </Tag>

          <Typography.Text
            ellipsis
            style={{ maxWidth: 300 }}
          >
            "{message.prompt}"
          </Typography.Text>
        </Space>

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(message.createdAt).toLocaleString()}
        </Typography.Text>
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
          <Typography.Text type="danger">
            Generate failed
          </Typography.Text>
        </Card>
      )}

      {/* SUCCESS */}
      {message.genneratedStatus === "SUCCESS" &&
        message.imageUrls?.length > 0 && (
          <Row gutter={[8, 8]}>
            {message.imageUrls.map((video, i) => (
              <Col key={video.id} xs={24} sm={12} md={12} lg={8}>
                <div style={{ position: "relative" }}>
                  <VideoItem
                    videoData={video}
                    onDownloadVideo={onDownloadVideo}
                    onShareVideo={(taskId, id, status) =>
                      onShareVideo(message.taskId, id, status)
                    }
                    taskId={message.taskId}
                  />

                  <OmniActionBar
                    item={video}
                    message={message}
                    onDownload={onDownloadVideo}
                     onToggleFavorite={onShareVideo}
                     messageApi={messageApi}
                    onDelete={(taskId, id) => {
                      setMessages((prev: Message[]) =>
                        prev.map((msg) =>
                          msg.taskId === taskId
                            ? {
                                ...msg,
                                imageUrls: msg.imageUrls.filter(
                                  (v) => v.id !== id,
                                ),
                              }
                            : msg,
                        ),
                      );
                    }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        )}
    </Card>
  );
};

export default OmniResultItem;