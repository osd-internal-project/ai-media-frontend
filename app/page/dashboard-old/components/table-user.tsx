import { Table } from "antd";
import { FC, ReactElement, useState } from "react";
import type {
  IDashboardProject,
  IDashboardProjectLogs,
  IDashboardTableUser,
  IDashboardUser,
  ITDashboardOwner,
  ProductSummary,
} from "@/app/common/dashbaord";
import { formatNumber, formatStringToNumber } from "@/app/utils/format";
import { ColumnType } from "antd/es/table";

interface props {
  data: IDashboardTableUser[];
}

const TableUserComponent: FC<props> = ({ data }): ReactElement => {
  const Columns: ColumnType<IDashboardTableUser>[] = [
    {
      title: "Name",
      dataIndex: "fullname",
      key: "userId",
    },
    {
      title: "Use Name",
      dataIndex: "username",
      key: "userId",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "userId",
    },
    {
      title: "Video Credit Usage",
      dataIndex: "usedCredit",
      render: (text: number) => formatStringToNumber(text),
      align: "right",
      sorter: (a, b) => a.usedCredit - b.usedCredit,
    },
    {
      title: "Image Usage",
      dataIndex: "usedImage",
      render: (text: number) => formatStringToNumber(text),
      align: "right",
      sorter: (a, b) => a.usedImage - b.usedImage,
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
      <Table<IDashboardTableUser>
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
