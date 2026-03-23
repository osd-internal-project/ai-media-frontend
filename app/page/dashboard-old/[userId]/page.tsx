"use client";
import type { LogsData } from "@/app/common/dashbaord";
import { axiosCore } from "@/app/lib/axios/axios";
import LogsServices from "@/app/services/logs.service";
import { Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const BillDetailsPage = () => {
  const param = useParams();
  const logsServices = LogsServices(axiosCore);
  const [loading, setLoading] = useState<boolean>(true);
  const [getData, setData] = useState<{ data: LogsData[]; count: number }>({ data: [], count: 0 });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (loading) {
      fecthdata();
    }
  }, [loading]);

  const fecthdata = async () => {
    const skip = (Number(pagination.current) - 1) * Number(pagination.pageSize);
    const take = Number(pagination.pageSize);
    const response = await logsServices.findByUserId(param?.userId as string, skip, take);
    setData(response);
    setLoading(false);
  };

  const changePagination = (page: TablePaginationConfig) => {
    setPagination({ ...page });
    setLoading(true);
  };

  const logColumns: ColumnsType<LogsData> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 280,
    },
    {
      title: "Type",
      dataIndex: "typeGenerate",
      key: "typeGenerate",
      width: 150,
      render: (type: string) => <span className={"text-blue-500"}>{type === "image" ? `Seedream` : `Seedance`}</span>,
    },
    {
      title: "Prompt",
      dataIndex: "prompt",
      key: "prompt",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => <span className={status === "success" ? "text-green-500" : "text-red-500"}>{status}</span>,
    },
    {
      title: "Image Used",
      dataIndex: "ImageUsed",
      key: "ImageUsed",
      width: 120,
      align: "right",
    },
    {
      title: "Token Used",
      dataIndex: "tokenUsed",
      key: "tokenUsed",
      width: 120,
      align: "right",
      render: (tokens: number) => tokens?.toLocaleString() || 0,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => new Date(date).toLocaleString("th-TH"),
    },
  ];
  return (
    <div>
      <Table
        columns={logColumns}
        dataSource={getData.data}
        rowKey="id"
        onChange={changePagination}
        pagination={{ ...pagination, total: getData.count }}
        bordered
      />
    </div>
  );
};

export default BillDetailsPage;
