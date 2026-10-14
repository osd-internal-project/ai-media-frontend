"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { axiosUser } from "@/app/lib/axios/axios";
import InvoiceServices from "@/app/services/invoice.service";
import { IInvoice, InvoiceStatus } from "@/app/common/invoice.type";

const { RangePicker } = DatePicker;

const STATUS_COLORS: Record<string, string> = {
  PENDING: "gold",
  PAID: "green",
  FAILED: "red",
  EXPIRED: "default",
  CANCELLED: "default",
};

const formatTHB = (v: number | string) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(v));

const AdminInvoicesPage: React.FC = () => {
  const service = useMemo(() => InvoiceServices(axiosUser), []);

  const [data, setData] = useState<IInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>();
  const [search, setSearch] = useState<string>();
  const [range, setRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await service.findManyAdmin({
        status,
        search,
        startDate: range?.[0]?.toISOString(),
        endDate: range?.[1]?.toISOString(),
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [service, status, search, range, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnsType<IInvoice> = [
    { title: "Invoice No.", dataIndex: "invoiceNo", key: "invoiceNo" },
    {
      title: "Customer",
      key: "customer",
      render: (_, r) =>
        r.customer ? `${r.customer.customerCode} · ${r.customer.name}` : "-",
    },
    { title: "Plan", dataIndex: "planName", key: "planName" },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => formatTHB(v),
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: InvoiceStatus) => (
        <Tag color={STATUS_COLORS[s] ?? "default"}>{s}</Tag>
      ),
    },
    {
      title: "Receipt No.",
      key: "receiptNo",
      render: (_, r) => r.receipt?.receiptNo ?? "-",
    },
    {
      title: "Issued",
      dataIndex: "issuedAt",
      key: "issuedAt",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Invoices</h2>
      <Card size="small">
        <Space wrap className="mb-4">
          <Input.Search
            allowClear
            placeholder="Search invoice no."
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
              "PAID",
              "FAILED",
              "EXPIRED",
              "CANCELLED",
            ].map((s) => ({ label: s, value: s }))}
          />
          <RangePicker
            onChange={(v) => {
              setPage(1);
              setRange(v as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null);
            }}
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
    </div>
  );
};

export default AdminInvoicesPage;
