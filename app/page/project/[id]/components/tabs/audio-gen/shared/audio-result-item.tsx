import React, { FC, useState } from "react";
import { Button, Card, Divider, Flex, Space, Typography } from "antd";
import type { GlobalToken } from "antd";
import {
  DownloadOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { User } from "lucide-react";
import useResponsive from "@/app/hooks/useResponsive";
import AiImageLoader from "@/app/components/AiImageLoader/AiImageLoader";
import ImageSmartReference from "../../image-gen/shared/image-smart-reference";
import { Message, isAudioLoading } from "./audio.types";

interface Props {
  message: Message;
  semantic: Partial<GlobalToken>;
  onShareAudio: (taskId: string, id: string, status: boolean) => void;
  onDownloadAudio: (fileName: string, id: string) => void;
}

const FORMAT_LABEL: Record<string, string> = {
  mp3: "MP3",
  wav: "WAV",
  ogg_opus: "OGG",
};

const AudioResultItem: FC<Props> = ({
  message,
  semantic,
  onShareAudio,
  onDownloadAudio,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const metaFontSize = isMobile ? 11 : isTablet ? 12 : 14;
  const config = message.generateConfig ?? {};

  const isLoading = isAudioLoading(message.genneratedStatus);
  const isError =
    message.genneratedStatus === "FAILED" ||
    (message.genneratedStatus === "SUCCESS" &&
      (!message.imageUrls || message.imageUrls.length === 0));
  const subtitleText = (config.subtitles ?? [])
    .map((line) => (typeof line.text === "string" ? line.text : ""))
    .filter(Boolean)
    .join(" ");

  const meta = [
    config.format ? FORMAT_LABEL[config.format] ?? config.format : "",
    typeof config.duration === "number" ? `${config.duration.toFixed(1)} s` : "",
  ].filter(Boolean);

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
      <Flex wrap gap={8} align="center" style={{ marginBottom: 8 }}>
        {meta.map((text) => (
          <Typography.Text
            key={text}
            style={{ fontSize: metaFontSize, color: semantic.colorTextSecondary }}
          >
            {text}
          </Typography.Text>
        ))}
        <Typography.Text
          style={{
            fontSize: metaFontSize,
            fontWeight: 600,
            color: semantic.colorPrimary,
          }}
        >
          {config.modelName || ""}
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: metaFontSize,
            color: semantic.colorTextSecondary,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <User size={metaFontSize} />
          {message.users?.fullname || message.users?.username || "-"}
          <ImageSmartReference referenceImages={message.referenceImages} />
        </Typography.Text>
        <Typography.Text
          type="secondary"
          style={{ fontSize: isMobile ? 11 : 12, marginLeft: "auto" }}
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
      </Flex>

      <Typography.Paragraph
        ellipsis={showFullPrompt ? false : { rows: 1 }}
        onClick={() => setShowFullPrompt((v) => !v)}
        style={{
          color: semantic.colorTextSecondary,
          fontSize: isMobile ? 13 : isTablet ? 14 : 16,
          fontStyle: "italic",
          marginBottom: 0,
          cursor: "pointer",
        }}
      >
        {`"${message.prompt}"`}
      </Typography.Paragraph>

      <Divider style={{ margin: "14px 0" }} />

      {isLoading && <AiImageLoader />}

      {isError && (
        <div>
          <Typography.Text style={{ color: semantic.colorError }}>
            Generate failed
          </Typography.Text>
          {message.errorMessage && (
            <Typography.Paragraph
              style={{ color: semantic.colorError, margin: "4px 0 0" }}
            >
              {message.errorMessage}
            </Typography.Paragraph>
          )}
        </div>
      )}

      {message.genneratedStatus === "SUCCESS" &&
        message.imageUrls?.map((audio, i) => (
          <Flex
            key={audio.id || `${message.taskId}-${i}`}
            vertical
            gap={8}
            style={{
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${semantic.colorBorder}`,
              background: semantic.colorBgContainer,
            }}
          >
            <Flex gap={8} align="center">
              <audio
                controls
                preload="metadata"
                src={audio.imageUrl}
                style={{ flex: 1, minWidth: 0 }}
                aria-label={`Generated audio for "${message.prompt}"`}
              />
              {audio.id && (
                <Space size={4}>
                  <Button
                    aria-label={audio.status ? "Remove from favorites" : "Add to favorites"}
                    icon={
                      audio.status ? (
                        <StarFilled style={{ color: semantic.colorWarning }} />
                      ) : (
                        <StarOutlined />
                      )
                    }
                    onClick={() =>
                      onShareAudio(message.taskId, audio.id!, !!audio.status)
                    }
                  />
                  <Button
                    aria-label="Download audio"
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      onDownloadAudio(audio.fileName || "audio.mp3", audio.id!)
                    }
                  />
                </Space>
              )}
            </Flex>
            {subtitleText && (
              <Typography.Paragraph
                type="secondary"
                style={{ fontSize: 13, marginBottom: 0 }}
              >
                {subtitleText}
              </Typography.Paragraph>
            )}
          </Flex>
        ))}
    </Card>
  );
};

export default AudioResultItem;
