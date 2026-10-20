"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Collapse,
  Descriptions,
  Drawer,
  Empty,
  Image,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";
import { axiosCore } from "@/app/lib/axios/axios";
import LogsServices from "@/app/services/logs.service";
import type { IGenerationLogDetail } from "@/app/common/dashbaord";
import {
  generationTypeColors,
  generationTypeLabel,
  isGenerationTypeKey,
  type GenerationTypeKey,
} from "@/app/common/generation-type";
import { formatNumber } from "@/app/utils/format";
import useResponsive from "@/app/hooks/useResponsive";
import {
  SmartImage,
  SmartVideo,
} from "@/app/page/project/[id]/components/shared/smart-media";
import AudioPlayer from "@/app/page/project/[id]/components/shared/audio-player";
import LogStatusTag from "./log-status-tag";

type MediaKind = "image" | "video" | "audio";

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm)$/i;

/** Picks the player from the type, falling back to the file extension for unknown types. */
const mediaKindOf = (type: GenerationTypeKey | null, url: string): MediaKind => {
  if (type === "audio") return "audio";
  if (type === "image") return "image";
  if (type) return "video";
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    // Not an absolute URL; test the raw string.
  }
  if (AUDIO_EXT.test(path)) return "audio";
  if (VIDEO_EXT.test(path)) return "video";
  return "image";
};

type LogDetailDrawerProps = {
  organizationId: string | undefined;
  /** Log to show; null closes the drawer. */
  logId: string | null;
  onClose: () => void;
};

/** One generation as its creator saw it: the result first, then what produced it. */
export default function LogDetailDrawer({
  organizationId,
  logId,
  onClose,
}: LogDetailDrawerProps) {
  const { token } = theme.useToken();
  const { isMobile } = useResponsive();
  const logsServices = useMemo(() => LogsServices(axiosCore), []);
  const [detail, setDetail] = useState<IGenerationLogDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!logId || !organizationId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);

    logsServices
      .findDetail(logId, organizationId)
      .then((next) => {
        if (!cancelled) setDetail(next);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to load generation detail", err);
        setError("Couldn't load this generation. Check your connection and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logId, organizationId, logsServices, reloadKey]);

  const typeKey = detail?.type ?? null;
  const typeColor = isGenerationTypeKey(typeKey)
    ? generationTypeColors(token)[typeKey]
    : token.colorTextQuaternary;
  const isPending = (detail?.status || "").toLowerCase() === "pending";

  const renderMedia = (item: IGenerationLogDetail) => {
    if (item.resultUrl.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            isPending
              ? "Still generating. The result appears here when it finishes."
              : "No result file was saved for this generation."
          }
        />
      );
    }

    const kinds = item.resultUrl.map((url) => mediaKindOf(item.type, url));

    if (kinds.every((kind) => kind === "image")) {
      return (
        <Image.PreviewGroup>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns:
                item.resultUrl.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr",
            }}
          >
            {item.resultUrl.map((url, index) => (
              <Image
                key={url}
                src={url}
                alt={`Result ${index + 1}`}
                style={{ borderRadius: token.borderRadiusLG, width: "100%" }}
              />
            ))}
          </div>
        </Image.PreviewGroup>
      );
    }

    return (
      <Space direction="vertical" style={{ width: "100%" }} size={8}>
        {item.resultUrl.map((url, index) =>
          kinds[index] === "audio" ? (
            <AudioPlayer
              key={url}
              src={url}
              ariaLabel={`Result ${index + 1}`}
              preload="metadata"
              seed={item.id}
            />
          ) : kinds[index] === "video" ? (
            <SmartVideo
              key={url}
              src={url}
              poster={item.thumbnailUrl ?? undefined}
              controls
              preload="metadata"
              wrapperStyle={{
                borderRadius: token.borderRadiusLG,
                background: token.colorFillTertiary,
                aspectRatio: "16 / 9",
              }}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <SmartImage
              key={url}
              src={url}
              alt={`Result ${index + 1}`}
              wrapperStyle={{ borderRadius: token.borderRadiusLG }}
              style={{ objectFit: "contain" }}
            />
          ),
        )}
      </Space>
    );
  };

  return (
    <Drawer
      open={Boolean(logId)}
      onClose={onClose}
      width={isMobile ? "100%" : 560}
      destroyOnClose
      title={
        detail ? (
          <Space size={8} wrap>
            <span>{detail.projectName || "Unknown project"}</span>
            <Tag color={typeColor} style={{ marginInlineEnd: 0 }}>
              {generationTypeLabel(typeKey)}
            </Tag>
            <LogStatusTag status={detail.status} />
          </Space>
        ) : (
          "Generation"
        )
      }
    >
      {loading && <Skeleton.Image active style={{ width: "100%", height: 240 }} />}
      {loading && <Skeleton active paragraph={{ rows: 6 }} className="mt-4" />}

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button size="small" onClick={() => setReloadKey((key) => key + 1)}>
              Retry
            </Button>
          }
        />
      )}

      {detail && (
        <Space direction="vertical" style={{ width: "100%" }} size={20}>
          {renderMedia(detail)}

          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Prompt
            </Typography.Text>
            <Typography.Paragraph
              copyable={detail.prompt ? { text: detail.prompt } : false}
              ellipsis={{ rows: 6, expandable: true, symbol: "Show more" }}
              style={{ marginTop: 4, marginBottom: 0, whiteSpace: "pre-wrap" }}
            >
              {detail.prompt || "No prompt"}
            </Typography.Paragraph>
          </div>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Created by">
              {detail.userFullname || "Unknown user"}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {dayjs(detail.createdAt).format("D MMM YYYY, HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Credits">
              {formatNumber(detail.usedCredit)}
            </Descriptions.Item>
            {detail.usedImage > 0 && (
              <Descriptions.Item label="Images">
                {formatNumber(detail.usedImage)}
              </Descriptions.Item>
            )}
            {detail.ratio && (
              <Descriptions.Item label="Aspect ratio">{detail.ratio}</Descriptions.Item>
            )}
            {detail.resolution && (
              <Descriptions.Item label="Resolution">
                {detail.resolution}
              </Descriptions.Item>
            )}
            {detail.generateAudio !== null && typeKey !== "audio" && (
              <Descriptions.Item label="With audio">
                {detail.generateAudio ? "Yes" : "No"}
              </Descriptions.Item>
            )}
            {detail.taskId && (
              <Descriptions.Item label="Task ID">
                <Typography.Text copyable style={{ fontSize: 12 }}>
                  {detail.taskId}
                </Typography.Text>
              </Descriptions.Item>
            )}
          </Descriptions>

          {detail.referenceImages.length > 0 && (
            <div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Reference images
              </Typography.Text>
              <Image.PreviewGroup>
                <div className="flex flex-wrap gap-2 mt-1">
                  {detail.referenceImages.map((url, index) => (
                    <Image
                      key={`${url}-${index}`}
                      src={url}
                      alt={`Reference ${index + 1}`}
                      width={72}
                      height={72}
                      style={{ objectFit: "cover", borderRadius: token.borderRadius }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}

          {detail.generateConfig != null && (
            <Collapse
              size="small"
              items={[
                {
                  key: "raw",
                  label: "Generation settings (raw)",
                  children: (
                    <pre
                      style={{
                        margin: 0,
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        color: token.colorTextSecondary,
                      }}
                    >
                      {JSON.stringify(detail.generateConfig, null, 2)}
                    </pre>
                  ),
                },
              ]}
            />
          )}
        </Space>
      )}
    </Drawer>
  );
}
