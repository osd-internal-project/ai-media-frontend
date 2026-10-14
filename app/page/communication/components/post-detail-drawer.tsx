"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Image,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { ExternalLink, Eye, Heart, PlayCircle } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import CommunityPostServices from "@/app/services/community-post.service";
import {
  CommunityPostDetail,
  isVideoType,
} from "@/app/common/community-post.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import StatusTag from "./status-tag";

interface PostDetailDrawerProps {
  postId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * รายละเอียดโพสต์ 1 ใบ พร้อมสื่อทั้งหมดและไทม์ไลน์ว่าใครทำอะไรเมื่อไหร่
 *
 * ไทม์ไลน์มาจาก community_post_log ซึ่ง append-only — เป็นคำตอบเดียวที่เชื่อถือ
 * ได้เวลามีคนถามว่า "ใครอนุมัติอันนี้" หรือ "ทำไมมันขึ้นตอนตีสอง"
 */
const PostDetailDrawer: React.FC<PostDetailDrawerProps> = ({
  postId,
  open,
  onClose,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const services = useMemo(() => CommunityPostServices(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();

  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      setPost(await services.findOne(postId));
    } catch (error) {
      console.error("Failed to load post detail:", error);
      messageApi.error("Could not load this post");
    } finally {
      setLoading(false);
    }
  }, [postId, services, messageApi]);

  useEffect(() => {
    if (open && postId) fetchDetail();
    if (!open) setPost(null);
  }, [open, postId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={post?.title || "Post detail"}
      extra={
        post?.status === "PUBLISHED" && (
          <Button
            size="small"
            icon={<ExternalLink size={14} />}
            href={`/community/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Public page
          </Button>
        )
      }
    >
      {contextHolder}

      {loading || !post ? (
        <Flex justify="center" style={{ padding: 64 }}>
          <Spin />
        </Flex>
      ) : (
        <Flex vertical gap={16}>
          <Flex align="center" gap={12} wrap>
            <StatusTag status={post.status} scheduledAt={post.scheduledAt} />
            {post.status === "PUBLISHED" && (
              <Flex align="center" gap={12}>
                <Flex align="center" gap={4}>
                  <Eye size={14} color={semantic.colorTextTertiary} />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {post.viewCount.toLocaleString()} views
                  </Typography.Text>
                </Flex>
                <Flex align="center" gap={4}>
                  <Heart size={14} color={semantic.colorTextTertiary} />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {post.likeCount.toLocaleString()} likes
                  </Typography.Text>
                </Flex>
              </Flex>
            )}
          </Flex>

          {post.status === "REJECTED" && post.reviewNote && (
            <Alert
              type="error"
              showIcon
              message="Sent back for changes"
              description={post.reviewNote}
            />
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: 8,
            }}
          >
            {post.media.map((item) => (
              <div
                key={`${item.galleryId}-${item.order}`}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: semantic.colorBgElevated,
                }}
              >
                <Image
                  src={item.thumbnailUrl || item.url || ""}
                  alt={post.title}
                  width="100%"
                  height="100%"
                  style={{ objectFit: "cover" }}
                />
                {isVideoType(item.typeGenerate) && (
                  <span
                    style={{
                      position: "absolute",
                      left: 6,
                      bottom: 6,
                      color: "#fff",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))",
                    }}
                  >
                    <PlayCircle size={16} />
                  </span>
                )}
              </div>
            ))}
          </div>

          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {post.caption || (
              <Typography.Text type="secondary">No caption</Typography.Text>
            )}
          </Typography.Paragraph>

          {post.hashtags.length > 0 && (
            <Flex wrap gap={4}>
              {post.hashtags.map((tag) => (
                <Tag key={tag}>#{tag}</Tag>
              ))}
            </Flex>
          )}

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Author">
              {post.authorDisplayName}
            </Descriptions.Item>
            <Descriptions.Item label="Shown as">
              {post.organizationDisplayName || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Prompt visible publicly">
              {post.showPrompt ? "Yes" : "No"}
            </Descriptions.Item>
            {post.linkUrl && (
              <Descriptions.Item label="Link">
                <a href={post.linkUrl} target="_blank" rel="noopener noreferrer">
                  {post.linkUrl}
                </a>
              </Descriptions.Item>
            )}
            {post.publishedAt && (
              <Descriptions.Item label="Published">
                {dayjs(post.publishedAt).format("D MMM YYYY HH:mm")}
              </Descriptions.Item>
            )}
            {post.unpublishedAt && (
              <Descriptions.Item label="Taken down">
                {dayjs(post.unpublishedAt).format("D MMM YYYY HH:mm")}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider style={{ margin: "4px 0" }} />

          <Typography.Text strong>History</Typography.Text>
          <Timeline
            items={post.logs.map((log) => ({
              color:
                log.action === "REJECT"
                  ? "red"
                  : log.action === "PUBLISH"
                    ? "green"
                    : "blue",
              children: (
                <Flex vertical gap={2}>
                  <Typography.Text style={{ fontSize: 13 }}>
                    {log.action}
                    {log.fromStatus ? ` · ${log.fromStatus} → ${log.toStatus}` : ""}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(log.createdAt).format("D MMM YYYY HH:mm")}
                    {log.actorType === "SYSTEM" ? " · scheduled automatically" : ""}
                  </Typography.Text>
                  {log.note && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      “{log.note}”
                    </Typography.Text>
                  )}
                </Flex>
              ),
            }))}
          />
        </Flex>
      )}
    </Drawer>
  );
};

export default PostDetailDrawer;
