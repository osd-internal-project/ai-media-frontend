"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Input, Select, Checkbox, message, theme } from "antd";
import { Plus, RefreshCw, Search } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { IOrganization } from "@/app/common/organization.type";
import OrganizationServices from "@/app/services/organization.service";
import { axiosUser } from "@/app/lib/axios/axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import {
  CustomizedBadge,
  SeatBar,
  StatusTag,
  seatLevel,
} from "../components/admin-ui";

type SeatFilter = "all" | "near" | "full";

const organizationService = OrganizationServices(axiosUser);
const seatUsed = (org: IOrganization) => (org.seatUsed ?? 0) + (org.seatPending ?? 0);

export default function OrganizationPage() {
  const router = useRouter();
  const { token } = theme.useToken();
  const [data, setData] = useState<IOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState<string | undefined>();
  const [seatFilter, setSeatFilter] = useState<SeatFilter>("all");
  const [customizedOnly, setCustomizedOnly] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    setLoading(true);
    try {
      setData((await organizationService.findAll({})) || []);
    } catch (error) {
      messageApi.error("Could not load organizations. Check the connection and press reload.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // shortcut: กรองฝั่ง client เพราะ list โหลดทั้งหมดอยู่แล้ว ถ้าเกินราว 2k org ให้ย้ายไปกรองที่ backend
  const rows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return data.filter((org) => {
      if (query && !`${org.name} ${org.organizationId}`.toLowerCase().includes(query)) return false;
      if (type && org.type?.toLowerCase() !== type) return false;
      if (customizedOnly && !org.isCustomized) return false;
      if (seatFilter === "all") return true;
      const level = seatLevel(seatUsed(org), org.maxUserAccess);
      return seatFilter === "full" ? level === "full" : level === "near" || level === "full";
    });
  }, [data, searchText, type, customizedOnly, seatFilter]);

  const openOrg = (org: IOrganization) =>
    router.push(`/page/admin-management/organization/${org.organizationId}`);

  const columns: ColumnsType<IOrganization> = [
    {
      title: "Organization",
      dataIndex: "name",
      key: "name",
      width: 260,
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div className="min-w-0">
          <div className="truncate font-medium" style={{ color: token.colorTextBase }}>{text}</div>
          <div className="truncate text-xs" style={{ color: token.colorTextSecondary }}>{record.organizationId}</div>
        </div>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      width: 200,
      render: (_, record) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span style={{ color: record.planName ? token.colorTextBase : token.colorTextSecondary }}>
            {record.planName ?? "No plan"}
          </span>
          {record.isCustomized && <CustomizedBadge />}
        </div>
      ),
    },
    {
      title: "Seats",
      key: "seats",
      width: 180,
      sorter: (a, b) => seatUsed(a) - seatUsed(b),
      render: (_, record) => (
        <SeatBar active={record.seatUsed ?? 0} pending={record.seatPending ?? 0} max={record.maxUserAccess} />
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (value: string) =>
        value?.toLowerCase() === "personal" ? (
          <StatusTag tone="accent">Personal</StatusTag>
        ) : (
          <StatusTag tone="primary">Team</StatusTag>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: boolean) => (
        <StatusTag tone={status ? "success" : "error"}>{status ? "Active" : "Inactive"}</StatusTag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (date) => <span className="tabular-nums">{dayjs(date).format("D MMM YYYY")}</span>,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-3">
      {contextHolder}

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-semibold" style={{ color: token.colorTextBase }}>
          Organizations
        </h1>
        <Input
          allowClear
          placeholder="Search name or ID"
          prefix={<Search size={14} aria-hidden />}
          className="!w-64"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Type"
          className="!w-32"
          value={type}
          onChange={setType}
          options={[
            { value: "team", label: "Team" },
            { value: "personal", label: "Personal" },
          ]}
        />
        <Select<SeatFilter>
          className="!w-40"
          value={seatFilter}
          onChange={setSeatFilter}
          aria-label="Filter by seats"
          options={[
            { value: "all", label: "All seats" },
            { value: "near", label: "80% full or more" },
            { value: "full", label: "Full" },
          ]}
        />
        <Checkbox checked={customizedOnly} onChange={(e) => setCustomizedOnly(e.target.checked)}>
          กำหนดเองเท่านั้น
        </Checkbox>
        <Button
          icon={<RefreshCw size={14} />}
          onClick={fetchData}
          loading={loading}
          aria-label="Reload organizations"
        />
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => router.push("/page/admin-management/organization/create/package")}
        >
          Create
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rows}
        rowKey="organizationId"
        loading={loading}
        scroll={{ x: 1000 }}
        size="small"
        onRow={(record) => ({
          onClick: () => openOrg(record),
          onKeyDown: (event) => {
            if (event.key === "Enter") openOrg(record);
          },
          tabIndex: 0,
          className: "cursor-pointer",
        })}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `${total} organizations`,
        }}
        className="custom-table"
      />
    </div>
  );
}
