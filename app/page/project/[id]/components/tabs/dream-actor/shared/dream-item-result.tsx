import React, { FC, useRef, useState, useEffect } from "react";
import { Card, Typography, Divider, Row, Col, Button, Space } from "antd";

import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import { Message } from "../chat-generate-dreamactor";
import DreamActionBar from "./action-bar";
import useResponsive from "@/app/hooks/useResponsive";
import { Trash2, User } from "lucide-react";
import VideoItem from "../../../chat-components/video-player";

interface Props {
  message: Message;
  onDownloadVideo: (fileName: string, id: string) => void;
  onShareVideo: (taskId: string, id: string, status: boolean) => void;
  onDelete: (taskId: string, id: string) => void;
  onDeleteMessage: (messageId: string) => void;
  semantic: any;
}

const DreamactorResultItem: FC<Props> = ({
  message,
  onDownloadVideo,
  onShareVideo,
  onDelete,
  onDeleteMessage,
  semantic,
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
      styles={{ body: { padding: isMobile ? 0 : isTablet ? 8 : 12 } }}
    >
      {/* HEADER */}
      {(isMobile || isTablet) ? (
        <div style={{ marginBottom: 8, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, width: "100%", flexWrap: "wrap" }}>
              <Typography.Text style={{ fontSize: metaFontSize, color: semantic.colorPrimary, fontWeight: 400, whiteSpace: "nowrap" }}>{message.resolution || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: metaFontSize, color: semantic.colorTextSecondary, whiteSpace: "nowrap" }}>{message.ratio || ""}</Typography.Text>
              <Typography.Text style={{ fontSize: metaFontSize, fontWeight: 600, color: semantic.colorPrimary, whiteSpace: "nowrap" }}>{message.generateConfig?.modelName || ""}</Typography.Text>
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
                  style={{ fontSize: isMobile ? 12 : 13, padding: 0, marginLeft: 4, color: semantic.colorPrimary }}
                  onClick={() => setShowFullPrompt((v) => !v)}
                >
                  {showFullPrompt ? "ย่อ" : "...ดูเพิ่มเติม"}
                </Button>
              )}
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
              {/* <Button
                type="text"
                danger
                icon={<Trash2 size={14} />}
                size="small"
                style={{ padding: 0 }}
                onClick={() => onDeleteMessage(message.id)}
              /> */}
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
                {message.ratio || ""}
              </Typography.Text>
            </Col>
            <Col flex="none">
              <Typography.Text
                style={{
                  fontSize: metaFontSize,
                  fontWeight: 600,
                  color: semantic.colorPrimary,
                  whiteSpace: "nowrap",
                }}
              >
                {message.generateConfig?.modelName || ""}
              </Typography.Text>
            </Col>
            <Col flex="none">
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
            <Col flex="none">
              <Space size={8} style={{ alignItems: "center", flexShrink: 0 }}>
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
                  onClick={() => onDeleteMessage(message.id)}
                />
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
                  style={{ fontSize: isMobile ? 12 : 13, padding: 0, marginLeft: 4, color: semantic.colorPrimary }}
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
