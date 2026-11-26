import { TPlan } from "@/app/common/plan.type";
import { Button, Popconfirm, Space, Table, Tooltip, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FC } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusTag } from "../../components/admin-ui";
import { priceLabel } from "../plan-utils";

interface PlanListViewProps {
  loading: boolean;
  filteredData: TPlan[];
  handleDeletePlan: (planId: string) => void;
  onClone: (plan: TPlan) => void;
  cloningId?: string | null;
}

const PlanListView: FC<PlanListViewProps> = ({ loading, filteredData, handleDeletePlan, onClone, cloningId }) => {
  const router = useRouter();
  const { token } = theme.useToken();
  const muted = { color: token.colorTextSecondary };
  const open = (plan: TPlan) => router.push(`/page/admin-management/plan-management/${plan.id}`);

  const columns: ColumnsType<TPlan> = [
    {
      title: "Plan",
      key: "name",
      render: (_, plan) => (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium" style={{ color: token.colorTextBase }}>{plan.name}</span>
            {plan.isDefault && <StatusTag tone="primary">Default</StatusTag>}
            {plan.isPopular && <StatusTag tone="warning">Popular</StatusTag>}
            {plan.badge && <StatusTag tone="neutral">{plan.badge}</StatusTag>}
          </div>
          {plan.description && <span className="line-clamp-1 text-xs" style={muted}>{plan.description}</span>}
        </div>
      ),
    },
    {
      title: "Prices",
      key: "prices",
      render: (_, plan) =>
        plan.prices?.length ? (
          <div className="flex flex-col tabular-nums">
            {plan.prices.map((price, index) => (
              <span key={price.id ?? index}>{priceLabel(price)}</span>
            ))}
          </div>
        ) : (
          <span style={muted}>No price</span>
        ),
    },
    {
      title: "Access",
      key: "access",
      render: (_, plan) => <span className="tabular-nums">{plan.accessCodes?.length ?? 0} features</span>,
    },
    {
      title: "AI models",
      key: "models",
      render: (_, plan) =>
        plan.allowedModelIds?.length ? (
          <span className="tabular-nums">{plan.allowedModelIds.length} models</span>
        ) : (
          <span style={muted}>All active models</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => <StatusTag tone={status ? "success" : "neutral"}>{status ? "Active" : "Draft"}</StatusTag>,
    },
    {
      title: "",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, plan) => (
        <Space size={2} onClick={(event) => event.stopPropagation()}>
          <Tooltip title="Edit">
            <Button type="text" aria-label={`Edit ${plan.name}`} icon={<Pencil size={15} />} onClick={() => open(plan)} />
          </Tooltip>
          <Tooltip title="Duplicate (saved as draft)">
            <Button
              type="text"
              aria-label={`Duplicate ${plan.name}`}
              icon={<Copy size={15} />}
              loading={cloningId === plan.id}
              onClick={() => onClone(plan)}
            />
          </Tooltip>
          <Popconfirm
            title={`Delete ${plan.name}?`}
            description="Organizations on this plan keep their current access and models."
            onConfirm={() => handleDeletePlan(plan.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Keep"
          >
            <Button type="text" danger aria-label={`Delete ${plan.name}`} icon={<Trash2 size={15} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={filteredData}
      rowKey="id"
      loading={loading}
      size="small"
      scroll={{ x: "max-content" }}
      pagination={{ pageSize: 20, hideOnSinglePage: true }}
      locale={{ emptyText: "No plans match the search" }}
      onRow={(plan) => ({ onClick: () => open(plan), className: "cursor-pointer" })}
    />
  );
};
export default PlanListView;
