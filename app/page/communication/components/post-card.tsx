"use client";

import React, { useMemo } from "react";
import { Button, Dropdown, Flex, Image, Tooltip, Typography } from "antd";
import { Eye, ExternalLink, Heart, Images, MoreVertical } from "lucide-react";
import { CommunityPostListItem } from "@/app/common/community-post.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import StatusTag from "./status-tag";

export interface PostCardAction {
  key: string;
  label: string;
  danger?: boolean;
}

interface PostCardProps {
  post: CommunityPostListItem;
  /** ชื่อ project ที่ resolve มาแล้ว — การ์ดไม่ยิง API เอง */
  projectName?: string;
  actions: PostCardAction[];
  onOpen: (id: string) => void;
  onAction: (key: string, post: CommunityPostListItem) => void;
}

/**
 * การ์ด 1 ใบในหน้า Posts
 *
 * เอารูปขึ้นก่อนข้อความโดยตั้งใจ — ผู้ใช้จำงานของตัวเองจากภาพที่สร้าง ไม่ใช่จาก
 * caption ซึ่งหลายใบขึ้นต้นคล้ายกัน
 */
const PostCard: React.FC<PostCardProps> = ({
  post,
  projectName,
  actions,
  onOpen,
  onAction,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);

  const isPublished = post.status === "PUBLISHED";

  return (
    <Flex
      vertical
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${semantic.colorBorder}`,
        background: semantic.colorBgContainer,
      }}
    >
      <div
        onClick={() => onOpen(post.id)}
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          cursor: "pointer",
          background: semantic.colorBgElevated,
        }}
      >
        {post.previewUrl ? (
          <Image
            src={post.previewUrl}
            alt={post.title}
            preview={false}
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Flex
            align="center"
            justify="center"
            style={{ height: "100%", color: semantic.colorTextTertiary }}
          >
            <Images size={28} />
          </Flex>
        )}

        {post.mediaCount > 1 && (
          <span
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 11,
              color: "#fff",
              background: "rgba(0,0,0,.55)",
            }}
          >
            <Flex align="center" gap={4}>
              <Images size={12} /> {post.mediaCount}
            </Flex>
          </span>
        )}

        <span
          style={{
            position: "absolute",
            left: 8,
            bottom: 8,
          }}
        >
          <StatusTag status={post.status} scheduledAt={post.scheduledAt} />
        </span>
      </div>

      <Flex vertical gap={8} style={{ padding: 12 }}>
        <Flex justify="space-between" align="flex-start" gap={8}>
          <Typography.Text
            strong
            ellipsis={{ tooltip: post.title }}
            style={{ cursor: "pointer" }}
            onClick={() => onOpen(post.id)}
          >
            {post.title || "Untitled"}
          </Typography.Text>

          {actions.length > 0 && (
            <Dropdown
              trigger={["click"]}
              menu={{
                items: actions.map((action) => ({
                  key: action.key,
                  label: action.label,
                  danger: action.danger,
                })),
                onClick: ({ key }) => onAction(key, post),
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreVertical size={15} />}
              />
            </Dropdown>
          )}
        </Flex>

        <Typography.Text
          type="secondary"
          ellipsis
          style={{ fontSize: 12 }}
        >
          {projectName ?? "—"}
        </Typography.Text>

        <Flex justify="space-between" align="center">
          <Flex align="center" gap={12}>
            {isPublished ? (
              <>
                <Tooltip title="Views">
                  <Flex align="center" gap={4}>
                    <Eye size={13} color={semantic.colorTextTertiary} />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {post.viewCount.toLocaleString()}
                    </Typography.Text>
                  </Flex>
                </Tooltip>
                <Tooltip title="Likes">
                  <Flex align="center" gap={4}>
                    <Heart size={13} color={semantic.colorTextTertiary} />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {post.likeCount.toLocaleString()}
                    </Typography.Text>
                  </Flex>
                </Tooltip>
              </>
            ) : (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {post.authorDisplayName}
              </Typography.Text>
            )}
          </Flex>

          {isPublished && (
            <Tooltip title="Open the public page">
              <Button
                type="text"
                size="small"
                href={`/community/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                icon={<ExternalLink size={14} />}
              />
            </Tooltip>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PostCard;
