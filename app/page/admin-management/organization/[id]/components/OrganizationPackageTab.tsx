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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { axiosUser } from "@/app/lib/axios/axios";
import PackageTransactionServices from "@/app/services/package-transaction.service";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import { formatNumber } from "@/app/utils/format";
import { IPackageTransaction } from "@/app/common/organization.type";
import { usePathname, useRouter } from "next/navigation";

const { Text } = Typography;

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
  const [subscription, setSubscription] = useState<any>(null);

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
      setSubscription(subData);
    } catch (error) {
      console.error("Failed to fetch package data:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const handleRenew = async () => {
    try {
      setLoading(true);
      await axiosUser.post(
        `/organization-subscription/renew/${organizationId}`,
      );
      message.success("Subscription updated/renewed successfully");
      await fetchData();
    } catch (error) {
      console.error("Failed to renew subscription:", error);
      message.error("Failed to renew subscription");
      setLoading(false); // only needed on error, otherwise fetchData handles it
    }
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
              <Space>
                {
                  <Button
                    type="primary"
                    onClick={() => router.push(`${pathname}/change-package`)}
                  >
                    Change Plan
                  </Button>
                }
                {subscription ? (
                  <Popconfirm
                    title="Renew Subscription"
                    description="Are you sure you want to renew this subscription for the next billing cycle?"
                    onConfirm={handleRenew}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary">Renew Subscription</Button>
                  </Popconfirm>
                ) : null}
              </Space>
            }
          >
            {subscription ? (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Plan Name">
                  <Text strong>{subscription.plan?.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">ACTIVE</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Starts At">
                  {new Date(
                    subscription.currentPeriodStart || subscription.startDate,
                  ).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Expires At">
                  {new Date(
                    subscription.currentPeriodEnd || subscription.endDate,
                  ).toLocaleDateString()}
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
