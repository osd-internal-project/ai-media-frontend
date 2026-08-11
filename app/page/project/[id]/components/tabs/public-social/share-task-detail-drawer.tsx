"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  Image,
  Spin,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import { axiosCore } from "@/app/lib/axios/axios";
import ActivityShareServices from "@/app/services/activity-share.service";
import {
  ActivityShareDetail,
  ActivityShareLog,
  SHARE_STATUS_COLORS,
  TARGET_STATUS_COLORS,
  isVideoType,
} from "@/app/common/activity-share.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import PlatformIcon from "./platform-icon";

interface ShareTaskDetailDrawerProps {
  shareId: string | null;
  open: boolean;
  onClose: () => void;
}

/** สีจุดบน timeline ตามชนิดของเหตุการณ์ */
const LOG_DOT_COLORS: Readonly<Record<string, string>> = {
  CREATE: "blue",
  UPDATE: "blue",
  APPROVE: "green",
  REJECT: "red",
  SEND: "gold",
  PUBLISH_START: "gray",
  PUBLISH_SUCCESS: "green",
  PUBLISH_FAIL: "red",
  RETRY: "gold",
  CANCEL: "gray",
};

/**
 * แปลง action ของ log เป็นข้อความที่คนอ่านรู้เรื่อง
 *
 * @param log แถว log
 * @returns ข้อความสรุปเหตุการณ์
 */
function describeLog(log: ActivityShareLog): string {
  const actor = log.actorType === "SYSTEM" ? "System" : "User";
  switch (log.action) {
    case "CREATE":
      return `${actor} created the share task`;
    case "UPDATE":
      return `${actor} edited the share task`;
    case "APPROVE":
      return `${actor} approved the share task`;
    case "REJECT":
      return `${actor} rejected the share task`;
    case "SEND":
      return `${actor} sent it to the publishing queue`;
    case "PUBLISH_START":
      return "Publishing started";
    case "PUBLISH_SUCCESS":
      return "Published successfully";
    case "PUBLISH_FAIL":
      return "Publishing failed";
    case "RETRY":
      return `${actor} retried the failed targets`;
    default:
      return `${log.action} → ${log.toStatus}`;
  }
}

/**
 * Drawer แสดงรายละเอียดงาน share + ไทม์ไลน์จาก activity_share_log
 *
 * ไทม์ไลน์คือเหตุผลหลักที่ตาราง log มีอยู่ — ผู้ใช้เห็นได้ว่าใครอนุมัติเมื่อไร
 * และแต่ละ platform พังเพราะอะไร
 */
const ShareTaskDetailDrawer: React.FC<ShareTaskDetailDrawerProps> = ({
  shareId,
  open,
  onClose,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const activityShareServices = useMemo(
    () => ActivityShareServices(axiosCore),
    []
  );

  const [detail, setDetail] = useState<ActivityShareDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!shareId) return;
    setLoading(true);
    try {
      setDetail(await activityShareServices.findOne(shareId));
    } catch (error) {
      console.error("Failed to load share detail:", error);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [shareId, activityShareServices]);

  useEffect(() => {
    if (open) fetchDetail();
  }, [open, shareId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      destroyOnHidden
      title="Share task"
    >
      {loading && (
        <Flex justify="center" style={{ padding: 48 }}>
          <Spin />
        </Flex>
      )}

      {!loading && !detail && <Empty description="Share task not found" />}

      {!loading && detail && (
        <Flex vertical gap={20}>
          <Flex align="center" gap={8}>
            <Tag color={SHARE_STATUS_COLORS[detail.status]}>
              {detail.status}
            </Tag>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              created {dayjs(detail.createdAt).format("DD MMM YYYY HH:mm")}
            </Typography.Text>
          </Flex>

          {detail.status === "REJECTED" && detail.reviewNote && (
            <Alert
              type="error"
              showIcon
              message="Rejected"
              description={detail.reviewNote}
            />
          )}

          {/* Media */}
          <div>
            <Typography.Text strong>Media</Typography.Text>
            <Flex wrap gap={8} style={{ marginTop: 8 }}>
              {detail.media.map((item) => (
                <div key={item.galleryId} style={{ position: "relative" }}>
                  <Image
                    width={84}
                    height={84}
                    src={item.thumbnailUrl || item.url || ""}
                    alt="share media"
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                  {isVideoType(item.typeGenerate) && (
                    <Tag
                      style={{ position: "absolute", left: 4, bottom: 4 }}
                      color="blue"
                    >
                      video
                    </Tag>
                  )}
                </div>
              ))}
            </Flex>
          </div>

          {/* Content */}
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Caption">
              {detail.caption || (
                <Typography.Text type="secondary">—</Typography.Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Hashtags">
              {detail.hashtags.length > 0 ? (
                detail.hashtags.map((tag) => <Tag key={tag}>#{tag}</Tag>)
              ) : (
                <Typography.Text type="secondary">—</Typography.Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Link">
              {detail.linkUrl ? (
                <a href={detail.linkUrl} target="_blank" rel="noreferrer">
                  {detail.linkUrl}
                </a>
              ) : (
                <Typography.Text type="secondary">—</Typography.Text>
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* Targets */}
          <div>
            <Typography.Text strong>Destinations</Typography.Text>
            <Flex vertical gap={8} style={{ marginTop: 8 }}>
              {detail.targets.map((target) => (
                <Flex
                  key={target.id}
                  align="center"
                  justify="space-between"
                  gap={8}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${semantic.colorBorderSecondary}`,
                  }}
                >
                  <Flex align="center" gap={10}>
                    <PlatformIcon platform={target.platform} size={26} />
                    <div>
                      <Typography.Text>
                        {target.socialAccount?.displayName ?? target.platform}
                      </Typography.Text>
                      {target.errorMessage && (
                        <div>
                          <Typography.Text
                            type="danger"
                            style={{ fontSize: 12 }}
                          >
                            {target.errorMessage}
                          </Typography.Text>
                        </div>
                      )}
                    </div>
                  </Flex>
                  <Flex align="center" gap={8}>
                    {target.remoteUrl && (
                      <a
                        href={target.remoteUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open the published post"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <Tag color={TARGET_STATUS_COLORS[target.status]}>
                      {target.status}
                    </Tag>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </div>

          {/* Timeline */}
          <div>
            <Typography.Text strong>History</Typography.Text>
            <Timeline
              style={{ marginTop: 12 }}
              items={detail.logs.map((log) => ({
                color: LOG_DOT_COLORS[log.action] ?? "gray",
                children: (
                  <Flex vertical gap={2}>
                    <Typography.Text>{describeLog(log)}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(log.createdAt).format("DD MMM YYYY HH:mm:ss")}
                      {log.fromStatus
                        ? ` · ${log.fromStatus} → ${log.toStatus}`
                        : ` · ${log.toStatus}`}
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
          </div>
        </Flex>
      )}
    </Drawer>
  );
};

export default ShareTaskDetailDrawer;
