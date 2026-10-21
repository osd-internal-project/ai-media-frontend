"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { axiosUser } from "@/app/lib/axios/axios";
import WhtRequestServices from "@/app/services/wht-request.service";
import { IWhtRequest, WhtStatus } from "@/app/common/wht-request.type";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "gold",
  RECEIVED: "blue",
  VERIFIED: "geekblue",
  REJECTED: "red",
  REFUNDED: "green",
};

// Valid next statuses for the inline status changer.
const NEXT_STATUSES: Record<WhtStatus, WhtStatus[]> = {
  PENDING: ["RECEIVED", "REJECTED"],
  RECEIVED: ["VERIFIED", "REJECTED"],
  VERIFIED: ["REFUNDED", "REJECTED"],
  REJECTED: [],
  REFUNDED: [],
};

const formatTHB = (v: number | string) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(v));

const AdminWhtRequestsPage: React.FC = () => {
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const service = useMemo(() => WhtRequestServices(axiosUser), []);

  const [data, setData] = useState<IWhtRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>();
  const [search, setSearch] = useState<string>();
  const [page, setPage] = useState(1);
  const [pendingChange, setPendingChange] = useState<{
    id: string;
    toStatus: WhtStatus;
  } | null>(null);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await service.findManyAdmin({
        status,
        search,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [service, status, search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeStatus = async (id: string, toStatus: WhtStatus) => {
    const adminUserId = session?.user?.id;
    if (!adminUserId) {
      messageApi.error("Missing admin session");
      return;
    }
    try {
      await service.updateStatus(id, toStatus, adminUserId);
      messageApi.success(`Status changed to ${toStatus}`);
      fetchData();
    } catch {
      messageApi.error("Failed to change status");
    } finally {
      setPendingChange(null);
    }
  };

  const columns: ColumnsType<IWhtRequest> = [
    { title: "Receipt No.", dataIndex: "receiptNo", key: "receiptNo" },
    {
      title: "Customer",
      key: "customer",
      render: (_, r) =>
        r.invoice?.customer
          ? `${r.invoice.customer.customerCode} · ${r.invoice.customer.name}`
          : "-",
    },
    {
      title: "WHT",
      key: "wht",
      render: (_, r) => `${r.whtPercent}% · ${formatTHB(r.whtAmount)}`,
    },
    {
      title: "Doc Ref",
      key: "docRef",
      render: (_, r) =>
        `${r.docRefNo} (${dayjs(r.docRefDate).format("DD/MM/YYYY")})`,
    },
    {
      // Bank account info visible inline without drilling in
      title: "Refund Bank Account",
      key: "bank",
      render: (_, r) => (
        <div className="text-xs">
          <div className="text-[var(--legacy-ink)]">{r.bankAccountName}</div>
          <div className="text-[var(--legacy-gray-400)]">
            {r.bankName} · {r.bankAccountNumber} · br.{r.bankBranchCode}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: WhtStatus) => (
        <Tag color={STATUS_COLORS[s] ?? "default"}>{s}</Tag>
      ),
    },
    {
      title: "Change Status",
      key: "change",
      render: (_, r) => {
        const options = NEXT_STATUSES[r.status] ?? [];
        if (options.length === 0) return <span className="text-[var(--legacy-gray-500)]">—</span>;
        return (
          <Select<WhtStatus>
            placeholder="Set status"
            style={{ width: 140 }}
            value={null as unknown as WhtStatus}
            onChange={(v) => setPendingChange({ id: r.id, toStatus: v })}
            options={options.map((o) => ({ label: o, value: o }))}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {contextHolder}
      <h2 className="text-xl font-semibold text-[var(--legacy-ink)]">WHT Requests</h2>
      <Card size="small">
        <Space wrap className="mb-4">
          <Input.Search
            allowClear
            placeholder="Search receipt no."
            onSearch={(v) => {
              setPage(1);
              setSearch(v || undefined);
            }}
            style={{ width: 220 }}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 160 }}
            value={status}
            onChange={(v) => {
              setPage(1);
              setStatus(v);
            }}
            options={[
              "PENDING",
              "RECEIVED",
              "VERIFIED",
              "REJECTED",
              "REFUNDED",
            ].map((s) => ({ label: s, value: s }))}
          />
        </Space>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          size="small"
        />
      </Card>

      <Popconfirm
        open={!!pendingChange}
        title="Change WHT status"
        description={`Set status to ${pendingChange?.toStatus}?`}
        onConfirm={() =>
          pendingChange &&
          changeStatus(pendingChange.id, pendingChange.toStatus)
        }
        onCancel={() => setPendingChange(null)}
      >
        <span />
      </Popconfirm>
    </div>
  );
};

export default AdminWhtRequestsPage;
