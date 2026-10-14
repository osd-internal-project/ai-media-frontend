"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Calendar, Flex, Spin, Tooltip, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { axiosCore } from "@/app/lib/axios/axios";
import CommunityPostServices from "@/app/services/community-post.service";
import {
  COMMUNITY_STATUS_COLORS,
  CommunityPostListItem,
} from "@/app/common/community-post.type";

/** โพสต์สูงสุดที่ดึงมาวางบนปฏิทิน 1 เดือน */
const CALENDAR_FETCH_SIZE = 200;

interface PostCalendarProps {
  organizationId: string;
  onOpenDetail: (id: string) => void;
  refreshToken: number;
}

/**
 * ปฏิทินของโพสต์ที่ตั้งเวลาไว้และที่เผยแพร่ไปแล้ว
 *
 * ตอบคำถามที่หน้า list ตอบไม่ได้: เดือนนี้มีอะไรจะขึ้นบ้าง และวันไหนแน่นเกินไป
 * โพสต์ที่ยังไม่อนุมัติไม่ขึ้นปฏิทินเพราะยังไม่มีวันที่จะเกิดขึ้นจริง
 */
const PostCalendar: React.FC<PostCalendarProps> = ({
  organizationId,
  onOpenDetail,
  refreshToken,
}) => {
  const services = useMemo(() => CommunityPostServices(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();

  const [rows, setRows] = useState<CommunityPostListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRows = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      // ดึงทั้ง SCHEDULED และ PUBLISHED แยกกัน เพราะ API กรอง status ได้ทีละค่า
      const [scheduled, published] = await Promise.all([
        services.findMany({
          organizationId,
          status: "SCHEDULED",
          pageSize: CALENDAR_FETCH_SIZE,
        }),
        services.findMany({
          organizationId,
          status: "PUBLISHED",
          pageSize: CALENDAR_FETCH_SIZE,
        }),
      ]);
      setRows([...scheduled.data, ...published.data]);
    } catch (error) {
      console.error("Failed to load calendar:", error);
      messageApi.error("Could not load the calendar");
    } finally {
      setLoading(false);
    }
  }, [organizationId, services, messageApi]);

  useEffect(() => {
    fetchRows();
  }, [refreshToken, organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** จัดกลุ่มโพสต์ตามวัน เพื่อให้ cellRender ไม่ต้องกวาดทั้ง array ทุกช่อง */
  const byDate = useMemo(() => {
    const map = new Map<string, CommunityPostListItem[]>();
    for (const post of rows) {
      const when = post.publishedAt ?? post.scheduledAt;
      if (!when) continue;
      const key = dayjs(when).format("YYYY-MM-DD");
      const bucket = map.get(key);
      if (bucket) bucket.push(post);
      else map.set(key, [post]);
    }
    return map;
  }, [rows]);

  const renderCell = useCallback(
    (value: Dayjs) => {
      const posts = byDate.get(value.format("YYYY-MM-DD"));
      if (!posts?.length) return null;

      return (
        <Flex vertical gap={2} style={{ margin: 0, padding: 0 }}>
          {posts.slice(0, 3).map((post) => (
            <Tooltip
              key={post.id}
              title={`${dayjs(post.publishedAt ?? post.scheduledAt).format(
                "HH:mm"
              )} · ${post.title}`}
            >
              <div
                onClick={(event) => {
                  // กันไม่ให้ Calendar เปลี่ยนวันที่เลือกเวลาคลิกที่โพสต์
                  event.stopPropagation();
                  onOpenDetail(post.id);
                }}
                style={{
                  cursor: "pointer",
                  fontSize: 11,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Badge
                  color={COMMUNITY_STATUS_COLORS[post.status]}
                  text={
                    <span style={{ fontSize: 11 }}>
                      {post.title || "Untitled"}
                    </span>
                  }
                />
              </div>
            </Tooltip>
          ))}
          {posts.length > 3 && (
            <span style={{ fontSize: 11, opacity: 0.65 }}>
              +{posts.length - 3} more
            </span>
          )}
        </Flex>
      );
    },
    [byDate, onOpenDetail]
  );

  if (loading) {
    return (
      <Flex justify="center" style={{ padding: 64 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={12}>
      {contextHolder}
      <Alert
        type="info"
        showIcon
        message="Scheduled and published posts only"
        description="Posts still waiting for approval have no date yet, so they do not appear here."
      />
      <Calendar cellRender={renderCell} />
    </Flex>
  );
};

export default PostCalendar;
