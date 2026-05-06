"use client";

import type { ICouponCodeUsage } from "@/app/common/coupon.type";
import type { IDashboardCreditPerMonthAndType } from "@/app/common/dashbaord";
import type {
  ICreditBalance,
  IOrganizationSubscription,
} from "@/app/common/organization.type";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { axiosUser } from "@/app/lib/axios/axios";
import type { ByTypeItem } from "@/app/page/dashboard/components/tabs/types";
import CouponService from "@/app/services/coupon.service";
import CreditBalanceServices from "@/app/services/credit-balance.service";
import DashboardServices from "@/app/services/dashboard.service";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Modal,
  Row,
  Space,
  Typography,
  theme,
} from "antd";
import { Ticket } from "lucide-react";
import { useSession } from "next-auth/react";
import { FC, useEffect, useMemo, useState } from "react";
import DailyCreditAct from "./components/daily-credit-act";
import SpendByTypeChart from "./components/spend-by-type-chart";
import CreditStatic from "./components/credit-static";
import "./styles/credit-style.css"
import TransactionHistory from "./components/transaction-history";
import ExpireNotice from "./components/expire-notice";
import RedeemCouponModal from "./components/redeem-coupon-modal";

const CreditPage: FC = () => {
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { token } = theme.useToken();
  const couponService = useMemo(() => CouponService(axiosUser), []);
  const creditBalanceService = useMemo(
    () => CreditBalanceServices(axiosUser),
    [],
  );
  const dashboardService = useMemo(() => DashboardServices(axiosUser), []);
  const organizationSubscriptionService = useMemo(
    () => OrganizationSubscriptionServices(axiosUser),
    [],
  );
  const [modal, contextHolder] = Modal.useModal();
  const organizationId = session?.user?.organizationId;
  const [overviewSummary, setOverviewSummary] = useState<{
    usedCredit: number;
    creditAllowance: number;
  } | null>(null);
  const [usedCreditPerMonth, setUsedCreditPerMonth] = useState<
    IDashboardCreditPerMonthAndType[]
  >([]);
  const [couponCodeUsage, setCouponCodeUsage] = useState<{
    data: ICouponCodeUsage[];
    total: number;
  }>({ data: [], total: 0 });
  const [creditBalance, setCreditBalance] = useState<ICreditBalance | null>(null);
  const [organizationSubscription, setOrganizationSubscription] =
    useState<IOrganizationSubscription | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setOverviewSummary(null);
      setUsedCreditPerMonth([]);
      setCouponCodeUsage({ data: [], total: 0 });
      setCreditBalance(null);
      setOrganizationSubscription(null);
      return;
    }

    let ignore = false;

    const fetchCreditData = async () => {
      const [overview, creditPerMonth, usage, balance, subscription] =
        await Promise.all([
          dashboardService.findOverviewSummary(organizationId, {}),
          dashboardService.countUsedCreditPerMonth(organizationId, {}),
          couponService.findUsageManyByOrganizationId(organizationId),
          creditBalanceService.findByOrganizationId(organizationId),
          organizationSubscriptionService.findByOrganizationId(organizationId),
        ]);

      if (ignore) {
        return;
      }

      setOverviewSummary(
        overview
          ? {
              usedCredit: Number(overview.usedCredit || 0),
              creditAllowance: Number(overview.creditAllowance || 0),
            }
          : null,
      );
      setUsedCreditPerMonth(creditPerMonth || []);
      setCouponCodeUsage(usage || { data: [], total: 0 });
      setCreditBalance(balance || null);
      setOrganizationSubscription(subscription || null);
    };

    fetchCreditData();

    return () => {
      ignore = true;
    };
  }, [
    couponService,
    creditBalanceService,
    dashboardService,
    organizationId,
    organizationSubscriptionService,
  ]);

  const selectedMonthlyUsage = useMemo(() => {
    if (!usedCreditPerMonth.length) {
      return null;
    }

    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const currentMonthUsage = usedCreditPerMonth.find(
      (item) => item.month === currentMonthKey,
    );

    if (currentMonthUsage) {
      return currentMonthUsage;
    }

    const latestActiveUsage = [...usedCreditPerMonth]
      .reverse()
      .find(
        (item) =>
          item.image > 0 ||
          item.video > 0 ||
          item.omnihuman > 0 ||
          item.dreamactor > 0,
      );

    return latestActiveUsage || usedCreditPerMonth[usedCreditPerMonth.length - 1];
  }, [usedCreditPerMonth]);

  const usedCreditByType = useMemo<ByTypeItem[]>(() => {
    if (!selectedMonthlyUsage) {
      return [];
    }

    return [
      {
        name: "Image",
        value: Number(selectedMonthlyUsage.image || 0),
        color: token.colorPrimary,
      },
      {
        name: "Video",
        value: Number(selectedMonthlyUsage.video || 0),
        color: token.colorInfo,
      },
      {
        name: "Human",
        value: Number(selectedMonthlyUsage.omnihuman || 0),
        color: token.colorWarning,
      },
      {
        name: "Dream",
        value: Number(selectedMonthlyUsage.dreamactor || 0),
        color: aiCaveColors.dreamActor,
      },
    ];
  }, [selectedMonthlyUsage, token.colorInfo, token.colorPrimary, token.colorWarning]);

  const totalBalance =
    Number(creditBalance?.currentCycleBalance || 0) +
    Number(creditBalance?.onTopBalance || 0);
  const totalAllowance = Number(
    overviewSummary?.creditAllowance ||
      organizationSubscription?.creditAllowance ||
      0,
  );
  const totalSpent = Number(overviewSummary?.usedCredit || 0);
  const totalCouponTopUp = couponCodeUsage.data.reduce(
    (sum, item) => sum + Number(item.onTopCredit || 0),
    0,
  );
  const hasTrendData = usedCreditPerMonth.some(
    (item) =>
      item.image > 0 ||
      item.video > 0 ||
      item.omnihuman > 0 ||
      item.dreamactor > 0,
  );
  const hasSpendByTypeData = usedCreditByType.some((item) => item.value > 0);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
      setOpen(true);
    };
  
  const handleOk = () => {
    form.submit();
  };

  const handleCouponSubmit = async (values: { couponCode: string }) => {
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.userId;

    if (!organizationId || !userId) {
      modal.error({
        title: "Error",
        content: "Session expired or missing organization information",
      });
      return;
    }

    setConfirmLoading(true);
    try {
      await couponService.useCoupon({
        code: values.couponCode.trim(),
        organizationId,
        userId,
      });

      modal.success({
        title: "Success",
        content: "Coupon applied successfully!",
      });

      form.resetFields();
      setOpen(false);
      window.location.reload();
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join(", ")
        : error?.response?.data?.message || "Failed to apply coupon";

      modal.error({
        title: "Error",
        content: errorMessage,
      });
    } finally {
      setConfirmLoading(false);
    }
  };
  
  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {contextHolder}
      <PageSubHeader
        title="Credit Usage"
        subtitle="Real-time credit tracking & history"
        background={semantic.colorBgContainer!!}
        borderColor={semantic.colorBorder!!}
        titleColor={semantic.colorTextBase!!}
        subtitleColor={semantic.colorTextSecondary!!}
        chipBg={semantic.colorBgTextActive!!}
        chipText={semantic.colorTextSecondary!!}
        rightSlot={
          <Button type="primary" onClick={showModal} icon={<Ticket size={14} />} >
            Redeem Coupon
          </Button>
        }
        compact
          />
          
          {/* Content */}
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
           <Space direction="vertical" style={{ width: "100%", paddingTop: 24, paddingBottom: 12 }} size={16} >   
    
          <CreditStatic
            balance={totalBalance}
            totalAllowance={totalAllowance}
            totalSpent={totalSpent}
            couponUsageCount={couponCodeUsage.total}
            couponTopUpTotal={totalCouponTopUp}
          />

      <Row gutter={[16, 16]} align="stretch"  style={{padding: "0 24px" }}>
        <Col xs={24} lg={16} className="flex">
          <Card title="Daily Credit Activity" style={{ height: "100%", width: "100%" }}>
            {hasTrendData ? (
              <DailyCreditAct
                data={usedCreditPerMonth}
                colors={{
                  image: token.colorPrimary,
                  video: token.colorInfo,
                  human: token.colorWarning,
                  dreamactor: token.colorError,
                  axis: token.colorTextSecondary,
                  grid: token.colorBorder,
                  tooltipBg: token.colorBgContainer,
                  tooltipBorder: token.colorBorder,
                  tooltipText: token.colorTextBase,
                }}
              />
            ) : (
              <div
                style={{
                  minHeight: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No credit activity data"
                />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8} className="flex">
          <Card title="Spend by Type" style={{ height: "100%", width: "100%" }}>
            {hasSpendByTypeData ? (
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                <SpendByTypeChart
                  data={usedCreditByType}
                  colors={{
                    tooltipBg: token.colorBgContainer,
                    tooltipBorder: token.colorBorder,
                    tooltipText: token.colorTextBase,
                  }}
                />
                {usedCreditByType.map((item) => (
                  <div className="flex items-center justify-between" key={item.name}>
                    <Space size={8}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: item.color,
                          display: "inline-block",
                        }}
                      />
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item.name}
                      </Typography.Text>
                    </Space>
                    <Typography.Text>{item.value}</Typography.Text>
                  </div>
                ))}
              </Space>
            ) : (
              <div
                style={{
                  minHeight: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No spend-by-type data"
                />
              </div>
            )}
          </Card>
        </Col>
                  </Row>
                  <div style={{ padding: "0 24px" }}>
                      <TransactionHistory couponCodeUsage={couponCodeUsage} />  </div> 
                 <div style={{ padding: "0 24px" }}> <ExpireNotice expiresAt={organizationSubscription?.currentPeriodEnd || null} /></div>
          </Space>
      </div>
        <RedeemCouponModal
          open={open}
          form={form}
          handleOk={handleOk}
          handleFinish={handleCouponSubmit}
          confirmLoading={confirmLoading}
          handleCancel={handleCancel}
          balance={totalBalance}
          totalAllowance={totalAllowance}
          totalSpent={totalSpent}
          expiresAt={organizationSubscription?.currentPeriodEnd || null}
          couponCodeUsage={couponCodeUsage}
        />
          </div>
  );
};

export default CreditPage;