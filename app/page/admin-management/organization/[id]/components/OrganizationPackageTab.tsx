import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Card,
  Descriptions,
  Tag,
  Typography,
  Spin,
  Button,
  Popconfirm,
  message,
  Space,
  Dropdown,
  Modal,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { isAxiosError } from "axios";
import { axiosUser } from "@/app/lib/axios/axios";
import PackageTransactionServices from "@/app/services/package-transaction.service";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import { formatNumber } from "@/app/utils/format";
import {
  IOrganizationSubscription,
  IPackageTransaction,
  SubscriptionCancelMode,
} from "@/app/common/organization.type";
import { usePathname, useRouter } from "next/navigation";

const { Text } = Typography;

const STATUS_TAGS: Record<string, { color: string; label: string }> = {
  active: { color: "green", label: "ACTIVE" },
  pending_cancel: { color: "orange", label: "CANCELS AT CYCLE END" },
  past_due: { color: "red", label: "PAST DUE" },
  expired: { color: "default", label: "EXPIRED" },
};

const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

interface OrganizationPackageTabProps {
  organizationId: string;
}

const OrganizationPackageTab: React.FC<OrganizationPackageTabProps> = ({
  organizationId,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscription, setSubscription] =
    useState<IOrganizationSubscription | null>(null);

  const transactionService = PackageTransactionServices(axiosUser);
  const subscriptionService = OrganizationSubscriptionServices(axiosUser);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const transData =
        await transactionService.findByOrganizationId(organizationId);
      setTransactions(transData || []);
      // console.log(transData)
      const subData =
        await subscriptionService.findByOrganizationId(organizationId);
      setSubscription(subData ?? null);
    } catch (error) {
      console.error("Failed to fetch package data:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const runAction = async (
    action: () => Promise<unknown>,
    successText: string,
  ) => {
    try {
      setLoading(true);
      await action();
      message.success(successText);
      await fetchData();
    } catch (error) {
      console.error("Subscription action failed:", error);
      const apiMessage = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      message.error(
        typeof apiMessage === "string" ? apiMessage : "Subscription action failed",
      );
      setLoading(false); // only needed on error, otherwise fetchData handles it
    }
  };

  const status = subscription?.status;
  const lapsed = status === "expired" || status === "past_due";
  const statusTag = STATUS_TAGS[status ?? ""] ?? {
    color: "default",
    label: (status ?? "unknown").toUpperCase(),
  };
  const renewDescription = lapsed
    ? "Start a new cycle today and refill this cycle's credit."
    : "Extend the subscription by one billing cycle.";

  const cancelItems: MenuProps["items"] = [
    { key: "end_of_period", label: "Cancel at end of cycle" },
    { key: "immediate", label: "Cancel immediately", danger: true },
  ];
  const handleCancel = (mode: SubscriptionCancelMode) => {
    Modal.confirm({
      title:
        mode === "immediate"
          ? "Cancel the subscription now?"
          : "Cancel at the end of this cycle?",
      content:
        mode === "immediate"
          ? "The subscription expires now and this cycle's credit becomes 0. On-top credit is kept."
          : "The organization keeps its credit until the cycle ends, then the subscription expires.",
      okText: "Cancel subscription",
      okButtonProps: { danger: true },
      cancelText: "Keep",
      onOk: () =>
        runAction(
          () => subscriptionService.adminCancel(organizationId, mode),
          "Subscription cancelled",
        ),
    });
  };

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId, fetchData]);

  const columns: ColumnsType<IPackageTransaction> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Cycle Range",
      dataIndex: "cycleRange",
      key: "cycleRange",
      render: (text, record) =>
        `${new Date(record.billingPeriodStart).toLocaleDateString()} - ${new Date(record.billingPeriodEnd).toLocaleDateString()}`,
    },
    {
      title: "Plan",
      dataIndex: "planName",
      key: "planName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "success" ? "green" : "volcano"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (amountPaid, record) =>
        `${record.currency} ${formatNumber(Number(record.amountPaid))}`,
    },
    // {
    //   title: "Credits/Images",
    //   key: "allowance",
    //   render: (_, record) => (
    //     <div>
    //       <div>C: {formatNumber(record.creditAllowance)}</div>
    //       <div>I: {formatNumber(record.imageAllowance)}</div>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center p-10">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Card
            title="Current Subscription"
            size="small"
            extra={
              subscription ? (
                <Space wrap>
                  <Tooltip title={status === "expired" ? "Renew first" : undefined}>
                    <Button
                      type="primary"
                      disabled={status === "expired"}
                      onClick={() => router.push(`${pathname}/change-package`)}
                    >
                      Change Plan
                    </Button>
                  </Tooltip>
                  <Popconfirm
                    title="Renew Subscription"
                    description={renewDescription}
                    onConfirm={() =>
                      runAction(
                        () => subscriptionService.adminRenew(organizationId),
                        "Subscription renewed",
                      )
                    }
                    okText="Renew"
                    cancelText="No"
                  >
                    <Button type="primary">Renew Subscription</Button>
                  </Popconfirm>
                  {status === "pending_cancel" ? (
                    <Popconfirm
                      title="Resume Subscription"
                      description="Undo the cancellation and keep renewing automatically."
                      onConfirm={() =>
                        runAction(
                          () => subscriptionService.adminResume(organizationId),
                          "Subscription resumed",
                        )
                      }
                      okText="Resume"
                      cancelText="No"
                    >
                      <Button>Resume</Button>
                    </Popconfirm>
                  ) : null}
                  {status !== "expired" && status !== "pending_cancel" ? (
                    <Dropdown
                      trigger={["click"]}
                      menu={{
                        items: cancelItems,
                        onClick: ({ key }) =>
                          handleCancel(key as SubscriptionCancelMode), // keys come from cancelItems
                      }}
                    >
                      <Button danger>Cancel Subscription</Button>
                    </Dropdown>
                  ) : null}
                </Space>
              ) : null
            }
          >
            {subscription ? (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Plan Name">
                  <Text strong>{subscription.planName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={statusTag.color}>{statusTag.label}</Tag>
                  {status === "pending_cancel" ? (
                    <Text type="secondary">
                      Ends {formatDate(subscription.currentPeriodEnd)}
                    </Text>
                  ) : null}
                </Descriptions.Item>
                <Descriptions.Item label="Current Cycle">
                  {formatDate(subscription.currentPeriodStart)} –{" "}
                  {formatDate(subscription.currentPeriodEnd)}
                </Descriptions.Item>
                <Descriptions.Item label="Next Billing">
                  {formatDate(subscription.nextBillingDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Auto Renew">
                  <Tag color={subscription.autoRenew ? "green" : "default"}>
                    {subscription.autoRenew ? "ON" : "OFF"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Billing Period">
                  {subscription.periodCount || 1} month(s)
                </Descriptions.Item>
                <Descriptions.Item label="Monthly Credits">
                  {formatNumber(subscription.creditAllowance)}
                </Descriptions.Item>
                <Descriptions.Item label="Monthly Images">
                  {formatNumber(subscription.imageAllowance)}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="text-center p-4">
                No active subscription found.
              </div>
            )}
          </Card>

          <Card title="Transaction History" size="small">
            <Table
              dataSource={transactions}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default OrganizationPackageTab;
