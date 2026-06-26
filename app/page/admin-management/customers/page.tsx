"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Input, Modal, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { axiosUser } from "@/app/lib/axios/axios";
import CustomerServices from "@/app/services/customer.service";
import { ICustomer } from "@/app/common/invoice.type";
import { ICustomerInvoice } from "@/app/common/customer.type";

const formatTHB = (v: number | string) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(v));

const AdminCustomersPage: React.FC = () => {
  const service = useMemo(() => CustomerServices(axiosUser), []);

  const [data, setData] = useState<ICustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<string>();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [active, setActive] = useState<ICustomer | null>(null);
  const [invoices, setInvoices] = useState<ICustomerInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await service.findMany({
        search,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [service, search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCustomer = async (customer: ICustomer) => {
    setActive(customer);
    setInvoicesLoading(true);
    try {
      const list = await service.findInvoices(customer.id);
      setInvoices(list);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const columns: ColumnsType<ICustomer> = [
    { title: "Customer Code", dataIndex: "customerCode", key: "customerCode" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t) => (
        <Tag color={t === "JURISTIC" ? "geekblue" : "green"}>{t}</Tag>
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Tax ID", dataIndex: "taxId", key: "taxId", render: (v) => v || "-" },
    {
      title: "Branch",
      key: "branch",
      render: (_, r) => (r.branchCode ? `${r.branchCode} ${r.branchName ?? ""}` : "-"),
    },
  ];

  const invoiceColumns: ColumnsType<ICustomerInvoice> = [
    { title: "Invoice No.", dataIndex: "invoiceNo", key: "invoiceNo" },
    { title: "Plan", dataIndex: "planName", key: "planName" },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => formatTHB(v),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "PAID" ? "green" : "gold"}>{s}</Tag>,
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
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Customers</h2>
      <Card size="small">
        <Input.Search
          allowClear
          placeholder="Search by customer code or tax ID"
          onSearch={(v) => {
            setPage(1);
            setSearch(v || undefined);
          }}
          style={{ width: 300, marginBottom: 16 }}
        />
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => openCustomer(record),
            style: { cursor: "pointer" },
          })}
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

      <Modal
        title={
          active
            ? `${active.customerCode} — ${active.name}`
            : "Customer Invoices"
        }
        open={!!active}
        onCancel={() => setActive(null)}
        footer={null}
        width={820}
      >
        <Table
          rowKey="id"
          loading={invoicesLoading}
          dataSource={invoices}
          columns={invoiceColumns}
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default AdminCustomersPage;
