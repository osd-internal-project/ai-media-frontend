"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Empty, Result, Skeleton, theme } from "antd";
import dayjs from "dayjs";
import { axiosCore } from "@/app/lib/axios/axios";
import LogsServices, { AdminAuditEntity, IAdminAuditEntry } from "@/app/services/logs.service";

const logsService = LogsServices(axiosCore);

const FIELD_LABELS: Record<string, string> = {
  maxUserAccess: "User limit",
  accessCodes: "Access",
  allowedModelIds: "AI models",
  status: "Status",
  isOpen: "System open",
  closedMessage: "Closed message",
  name: "Name",
  description: "Description",
  isActive: "Enabled",
  detailJson: "Quotas",
  appliedOrganizations: "Applied to organizations",
};

const formatValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined) return field === "maxUserAccess" ? "ไม่จำกัด" : "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : field === "allowedModelIds" ? "ทุก model" : "—";
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (typeof value === "object") {
    const applied = value as { scope?: string; count?: number };
    if (field === "appliedOrganizations") return `${applied.count ?? 0} orgs (${applied.scope ?? "?"})`;
    return JSON.stringify(value);
  }
  return String(value);
};

/** ประวัติการแก้ของ admin ต่อ 1 รายการ: ใคร เมื่อไร field ไหน เก่า → ใหม่ */
const AuditHistory: React.FC<{ entityName: AdminAuditEntity; entityId: string }> = ({ entityName, entityId }) => {
  const { token } = theme.useToken();
  const [entries, setEntries] = useState<IAdminAuditEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    setEntries(null);
    try {
      setEntries(await logsService.listAudit(entityName, entityId));
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
  }, [entityName, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  if (failed) {
    return (
      <Result
        status="warning"
        title="Could not load the change history"
        extra={<Button onClick={load}>Try again</Button>}
      />
    );
  }
  if (entries === null) return <Skeleton active paragraph={{ rows: 4 }} title={false} />;
  if (entries.length === 0) {
    return <Empty description="No changes recorded yet. Edits to limit, access and models will appear here." />;
  }

  return (
    <ol className="flex flex-col">
      {entries.map((entry) => {
        const fields = Object.keys(entry.newValues ?? {});
        return (
          <li key={entry.id} className="py-3" style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
            <div className="mb-1 flex flex-wrap items-baseline gap-2 text-xs" style={{ color: token.colorTextSecondary }}>
              <span className="font-medium" style={{ color: token.colorTextBase }}>
                {entry.user.fullname ?? entry.user.email ?? entry.user.userId}
              </span>
              <time className="tabular-nums" dateTime={entry.createdAt}>
                {dayjs(entry.createdAt).format("D MMM YYYY HH:mm")}
              </time>
            </div>
            <dl className="grid grid-cols-[minmax(110px,auto)_1fr] gap-x-4 gap-y-1 text-sm">
              {fields.map((field) => (
                <React.Fragment key={field}>
                  <dt style={{ color: token.colorTextSecondary }}>{FIELD_LABELS[field] ?? field}</dt>
                  <dd className="break-words">
                    {field !== "appliedOrganizations" && (
                      <>
                        <span style={{ color: token.colorTextSecondary }}>{formatValue(field, entry.oldValues?.[field])}</span>
                        <span aria-hidden style={{ color: token.colorTextSecondary }}> → </span>
                        <span className="sr-only"> changed to </span>
                      </>
                    )}
                    <span style={{ color: token.colorTextBase }}>{formatValue(field, entry.newValues?.[field])}</span>
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </li>
        );
      })}
    </ol>
  );
};

export default AuditHistory;
