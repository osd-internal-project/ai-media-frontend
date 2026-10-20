import React from "react";
import { Tag } from "antd";

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  success: { color: "success", label: "Success" },
  pending: { color: "processing", label: "Pending" },
  failed: { color: "error", label: "Failed" },
};

export default function LogStatusTag({ status }: { status: string | null }) {
  const key = (status || "").toLowerCase();
  const tag = STATUS_TAG[key] ?? { color: "default", label: status || "Unknown" };
  return (
    <Tag color={tag.color} style={{ marginInlineEnd: 0 }}>
      {tag.label}
    </Tag>
  );
}
