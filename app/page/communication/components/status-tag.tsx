"use client";

import React from "react";
import { Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import {
  COMMUNITY_STATUS_COLORS,
  COMMUNITY_STATUS_LABELS,
  CommunityPostStatus,
} from "@/app/common/community-post.type";

interface StatusTagProps {
  status: CommunityPostStatus;
  /** แสดงเวลาที่ตั้งไว้ต่อท้ายเมื่อสถานะเป็น SCHEDULED */
  scheduledAt?: string | null;
}

/**
 * Tag สถานะของโพสต์ — ใช้ทุกที่ที่ต้องแสดงสถานะ เพื่อไม่ให้สีกับข้อความหลุดจากกัน
 *
 * โพสต์ที่ตั้งเวลาไว้แสดงเวลาต่อท้ายด้วย เพราะ "Scheduled" เฉย ๆ ไม่ตอบคำถาม
 * ที่ผู้ใช้ถามจริงบนหน้า list ว่า "จะขึ้นเมื่อไหร่"
 */
const StatusTag: React.FC<StatusTagProps> = ({ status, scheduledAt }) => {
  const label = COMMUNITY_STATUS_LABELS[status] ?? status;

  if (status === "SCHEDULED" && scheduledAt) {
    const target = dayjs(scheduledAt);
    return (
      <Tooltip title={target.format("D MMM YYYY HH:mm")}>
        <Tag color={COMMUNITY_STATUS_COLORS[status]} style={{ marginInlineEnd: 0 }}>
          {label} · {target.format("D MMM HH:mm")}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tag color={COMMUNITY_STATUS_COLORS[status]} style={{ marginInlineEnd: 0 }}>
      {label}
    </Tag>
  );
};

export default StatusTag;
