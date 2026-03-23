import { Table } from "antd";
import { FC, ReactElement, useEffect, useState } from "react";
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
  data: IDashboardProject[];
}

const TableProjectComponent: FC<props> = ({ data }): ReactElement => {
  useEffect(() => {
    console.log(data);
  }, [data]);
  const [expandedData, setExpandedData] = useState<
    Record<string, IDashboardUser[]>
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const ParentColumns: ColumnType<IDashboardProject>[] = [
    {
      title: "Team",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Video Credit Usage",
      dataIndex: ["usedCredit"],
      render: (v: number) => formatNumber(v || 0),
      key: "projectId",
      width: "250px",
      align: "right",
    },
    {
      title: "Image Usage",
      dataIndex: ["usedImage"],
      render: (v: number) => formatNumber(v || 0),
      key: "projectId",
      width: "250px",
      align: "right",
    },
  ];

  const ChildColumns: ColumnType<IDashboardUser>[] = [
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
      title: "Video Credit Usage",
      dataIndex: ["project", "logs"],
      render: (v: IDashboardProjectLogs[]) =>
        formatNumber(
          v
            .filter((log) => log.typeGenerate !== "video")
            .reduce((sum, log) => sum + (log?.usedCredit || 0), 0),
        ),
      width: "250px",
      align: "right",
    },
    {
      title: "Image Usage",
      dataIndex: ["project", "logs"],
      render: (v: IDashboardProjectLogs[]) =>
        formatNumber(
          v
            .filter((log) => log.typeGenerate === "image")
            .reduce((sum, log) => sum + (log?.usedImage || 0), 0),
        ),
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

  const expandedRowRender = (record: IDashboardProject) => {
    return (
      <Table
        bordered
        rowKey={(record) => record.users.userId}
        columns={ChildColumns}
        dataSource={record.members || []}
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <div className="w-full">
      <Table<IDashboardProject>
        columns={ParentColumns}
        dataSource={data}
        scroll={{ x: "max-content" }}
        rowKey="id"
        expandable={{
          expandedRowRender: expandedRowRender,
          // onExpand: handleExpand,
        }}
        size="large"
      />
    </div>
  );
};
export default TableProjectComponent;
