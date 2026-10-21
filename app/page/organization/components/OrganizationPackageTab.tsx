import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Card,
  Descriptions,
  Tag,
  Typography,
  Spin,
  Button,
  Modal,
  Popconfirm,
  Radio,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { axiosUser, axiosCore } from "@/app/lib/axios/axios";
import PackageTransactionServices from "@/app/services/package-transaction.service";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import PlanServices from "@/app/services/plan.service";
import { formatNumber } from "@/app/utils/format";
import { IPackageTransaction } from "@/app/common/organization.type";
import { TPlan } from "@/app/common/plan.type";
import SectionEmptyState from "./SectionEmptyState";

const { Text } = Typography;

interface OrganizationPackageTabProps {
  organizationId: string;
}

const OrganizationPackageTab: React.FC<OrganizationPackageTabProps> = ({
  organizationId,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  // Package purchase modal (entry point into the checkout flow)
  const [buyOpen, setBuyOpen] = useState(false);
  const [plans, setPlans] = useState<TPlan[]>([]);
  const [selectedPriceId, setSelectedPriceId] = useState<string>();

  const transactionService = PackageTransactionServices(axiosUser);
  const subscriptionService = OrganizationSubscriptionServices(axiosUser);
  const planService = useMemo(() => PlanServices(axiosCore), []);

  const openBuy = useCallback(async () => {
    setBuyOpen(true);
    if (plans.length === 0) {
      const data = await planService.findAllFormatted();
      setPlans(data);
    }
  }, [planService, plans.length]);

  const handleProceedToCheckout = () => {
    if (!selectedPriceId) return;
    router.push(`/page/payment/checkout?priceId=${selectedPriceId}`);
  };

  const handleCancelSubscription = async () => {
    try {
      await subscriptionService.cancel(organizationId);
      message.success(
        "Subscription will be cancelled at the end of the current cycle.",
      );
      fetchData();
    } catch {
      message.error("Failed to cancel subscription");
    }
  };

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
          <Card
            title="Current Subscription"
            size="small"
            extra={
              <div className="flex gap-2">
                {subscription?.status === "active" && (
                  <Popconfirm
                    title="Cancel subscription?"
                    description="You keep access with your current credits until the end of the current cycle."
                    okText="Cancel subscription"
                    okButtonProps={{ danger: true }}
                    cancelText="Keep"
                    onConfirm={handleCancelSubscription}
                  >
                    <Button danger>Cancel subscription</Button>
                  </Popconfirm>
                )}
                <Button
                  type="primary"
                  icon={<ShoppingCart size={16} />}
                  onClick={openBuy}
                >
                  Buy / Upgrade Package
                </Button>
              </div>
            }
          >
            {subscription ? (
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Plan Name">
                  <Text strong>{subscription.plan?.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      subscription.status === "active"
                        ? "green"
                        : subscription.status === "pending_cancel"
                          ? "orange"
                          : subscription.status === "past_due"
                            ? "volcano"
                            : "default"
                    }
                  >
                    {String(subscription.status ?? "active")
                      .replace("_", " ")
                      .toUpperCase()}
                  </Tag>
                  {subscription.status === "pending_cancel" && (
                    <Text type="secondary" className="ml-2">
                      Active until{" "}
                      {new Date(
                        subscription.currentPeriodEnd ?? subscription.endDate,
                      ).toLocaleDateString()}
                    </Text>
                  )}
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
                    className="rounded-xl border border-[var(--legacy-line-white-10)] bg-[var(--legacy-panel-white-5)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[var(--legacy-ink)]">
                          {transaction.planName || "-"}
                        </div>
                        <div className="mt-1 text-sm text-[var(--legacy-gray-400)]">
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
                        <div className="text-[var(--legacy-gray-400)]">Cycle Range</div>
                        <div className="mt-1 break-words text-[var(--legacy-ink)]">
                          {transaction.billingPeriodStart && transaction.billingPeriodEnd
                            ? `${new Date(transaction.billingPeriodStart).toLocaleDateString()} - ${new Date(transaction.billingPeriodEnd).toLocaleDateString()}`
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--legacy-gray-400)]">Price</div>
                        <div className="mt-1 text-[var(--legacy-ink)]">
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

      <Modal
        title="Select a Package"
        open={buyOpen}
        onCancel={() => setBuyOpen(false)}
        onOk={handleProceedToCheckout}
        okText="Continue to Checkout"
        okButtonProps={{ disabled: !selectedPriceId }}
        width={640}
      >
        <Radio.Group
          value={selectedPriceId}
          onChange={(e) => setSelectedPriceId(e.target.value)}
          className="flex flex-col gap-3 w-full"
        >
          {plans.map((plan) =>
            (plan.prices || []).map((price) => (
              <Radio key={price.id} value={price.id} className="!flex">
                <span className="text-[var(--legacy-ink)]">
                  {plan.name} — {price.interval} ·{" "}
                  {price.currency} {formatNumber(Number(price.price))}
                </span>
              </Radio>
            )),
          )}
        </Radio.Group>
        {plans.length === 0 && (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrganizationPackageTab;
