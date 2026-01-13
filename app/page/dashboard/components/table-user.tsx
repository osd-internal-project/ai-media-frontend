import { Table } from "antd";
import { FC, ReactElement, useState } from "react";
import type {
  IDashboardProject,
  IDashboardProjectLogs,
  IDashboardUser,
  ITDashboardOwner,
  ProductSummary,
} from "@/app/common/dashbaord";
import { formatNumber, formatStringToNumber } from "@/app/utils/format";
import { ColumnType } from "antd/es/table";

interface props {
  data: IDashboardUser[];
}

const TableUserComponent: FC<props> = ({ data }): ReactElement => {
  const Columns: ColumnType<IDashboardUser>[] = [
    {
      title: "Name",
      dataIndex: ["users", "fullname"],
      key: "userId",
    },
    {
      title: "Role",
      dataIndex: ["role"],
      key: "userId",
    },
    {
      title: "Token Usage",
      dataIndex: ["project", "logs"],
      render: (v: IDashboardProjectLogs[]) =>
        formatNumber(v.reduce((sum, log) => sum + (log?.tokenUsed || 0), 0)),
      width: "250px",
      align: "right",
    },
    {
      title: "Image Usage",
      dataIndex: ["project", "logs"],
      render: (v: IDashboardProjectLogs[]) =>
        formatNumber(v.reduce((sum, log) => sum + (log?.ImageUsed || 0), 0)),
      width: "250px",
      align: "right",
    },
  ];

  // const handleExpand = (expanded: boolean, record: IDashboardProject) => {
  //   if (expanded) {
  //     setLoadingMap((prev) => ({ ...prev, [record.projectId]: true }));
  //     getSummaryUsers(record.projectId)
  //       .then((users) => {
  //         setExpandedData((prev) => ({ ...prev, [record.projectId]: users }));
  //       })
  //       .finally(() => {
  //         setLoadingMap((prev) => ({ ...prev, [record.projectId]: false }));
  //       });
  //   }
  // };

  return (
    <div className="w-full">
      <Table<IDashboardUser>
        columns={Columns}
        dataSource={data}
        scroll={{ x: "max-content" }}
        rowKey="userId"
        size="large"
      />
    </div>
  );
};
export default TableUserComponent;
