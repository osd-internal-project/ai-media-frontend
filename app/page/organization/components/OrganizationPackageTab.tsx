import React, { useEffect, useState, useCallback } from "react";
import { Table, Card, Descriptions, Tag, Typography, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { axiosUser } from "@/app/lib/axios/axios";
import PackageTransactionServices from "@/app/services/package-transaction.service";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import { formatNumber } from "@/app/utils/format";
import { IPackageTransaction } from "@/app/common/organization.type";
import SectionEmptyState from "./SectionEmptyState";

const { Text } = Typography;

interface OrganizationPackageTabProps {
  organizationId: string;
}

const OrganizationPackageTab: React.FC<OrganizationPackageTabProps> = ({
  organizationId,
}) => {
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
      const subData =
        await subscriptionService.findByOrganizationId(organizationId);
      setSubscription(subData);
    } catch (error) {
      console.error("Failed to fetch package data:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

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
          <Card title="Current Subscription" size="small">
            {subscription ? (
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Plan Name">
                  <Text strong>{subscription.plan?.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">ACTIVE</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Starts At">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Expires At">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Monthly Credits">
                  {formatNumber(subscription.creditAllowance)}
                </Descriptions.Item>
                <Descriptions.Item label="Monthly Images">
                  {formatNumber(subscription.imageAllowance)}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <SectionEmptyState
                title="No active subscription"
                description="This organization does not have an active package yet."
              />
            )}
          </Card>

          <Card title="Transaction History" size="small">
            <div className="hidden md:block">
              <Table
                dataSource={transactions}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ x: "max-content" }}
                locale={{
                  emptyText: (
                    <SectionEmptyState
                      title="No transactions found"
                      description="Package transactions will appear here after a subscription change or renewal."
                      className="border-0 bg-transparent px-0 py-6"
                    />
                  ),
                }}
              />
            </div>

            <div className="space-y-3 md:hidden">
              {transactions.length === 0 ? (
                <SectionEmptyState
                  title="No transactions found"
                  description="Package transactions will appear here after a subscription change or renewal."
                />
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white">
                          {transaction.planName || "-"}
                        </div>
                        <div className="mt-1 text-sm text-gray-400">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString()
                            : "-"}
                        </div>
                      </div>
                      <Tag color={transaction.status === "success" ? "green" : "volcano"}>
                        {String(transaction.status || "-").toUpperCase()}
                      </Tag>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">Cycle Range</div>
                        <div className="mt-1 break-words text-white">
                          {transaction.billingPeriodStart && transaction.billingPeriodEnd
                            ? `${new Date(transaction.billingPeriodStart).toLocaleDateString()} - ${new Date(transaction.billingPeriodEnd).toLocaleDateString()}`
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Price</div>
                        <div className="mt-1 text-white">
                          {transaction.currency || ""} {formatNumber(Number(transaction.amountPaid || 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default OrganizationPackageTab;
