import React, { FC } from "react";
import useResponsive from "@/app/hooks/useResponsive";
import { Card, Flex, Space, Typography, Tag, Divider, Row, Col, Button } from "antd";
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
      styles={{ body: { padding: 12 } }}
    >
      {/* HEADER */}
      {(isMobile || isTablet) ? (
        <div style={{ marginBottom: 8, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, width: "100%" }}>
              <Typography.Text style={{ fontSize: 15, color: "#1677ff", fontWeight: 400, whiteSpace: "nowrap" }}>{message.resolution || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: 15, fontWeight: 600, color: "#1677ff", whiteSpace: "nowrap" }}>{message.generateConfig?.modelName || ""}</Typography.Text>
            </div>
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
            </div>
          </div>
        </div>
      ) : (
        <Row gutter={8} align="middle" style={{ marginBottom: 8, flexWrap: "nowrap", overflowX: "auto" }}>
          <Col flex="none">
            <Typography.Text
              style={{
                fontSize: 14,
                color: "#1677ff",
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
                fontWeight: 600,
                color: "#1677ff",
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
          </Col>
        </Row>
      )}
     
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
              <Col key={video.id} xs={isMobile ? 24 : 24} sm={12} md={12} lg={8}>
                <div style={{ position: "relative", marginBottom: isMobile ? 8 : 0 }}>
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