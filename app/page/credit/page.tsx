"use client";

import type { IDashboardCreditPerMonthAndType } from "@/app/common/dashbaord";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { axiosUser } from "@/app/lib/axios/axios";
import type { ByTypeItem } from "@/app/page/dashboard/components/tabs/types";
import CouponService from "@/app/services/coupon.service";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";
import { Button, Card, Col, Form, Modal, Row, Space, Typography, theme } from "antd";
import {
  CalendarDays,
  Gauge,
  Sparkles,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { FC, useState } from "react";
import { useSession } from "next-auth/react";
import DailyCreditAct from "./components/daily-credit-act";
import SpendByTypeChart from "./components/spend-by-type-chart";
import CreditStatic from "./components/credit-static";
import "./styles/credit-style.css"
import TransactionHistory from "./components/transaction-history";
import ExpireNotice from "./components/expire-notice";
import RedeemCouponModal from "./components/redeem-coupon-modal";

type CreditStatCard = {
  label: string;
  value: string | number;
  sub: string;
  trend?: string;
  progress?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

const usedCreditPerMonthMock: IDashboardCreditPerMonthAndType[] = [
  { month: "Jan", image: 220, video: 120, omnihuman: 80, dreamactor: 50 },
  { month: "Feb", image: 260, video: 150, omnihuman: 95, dreamactor: 55 },
  { month: "Mar", image: 310, video: 180, omnihuman: 110, dreamactor: 62 },
  { month: "Apr", image: 295, video: 165, omnihuman: 120, dreamactor: 70 },
  { month: "May", image: 340, video: 190, omnihuman: 130, dreamactor: 76 },
  { month: "Jun", image: 360, video: 210, omnihuman: 140, dreamactor: 82 },
];

const CreditPage: FC = () => {
  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { token } = theme.useToken();
  const couponService = CouponService(axiosUser);
  const [modal, contextHolder] = Modal.useModal();

  const usedCreditByTypeMock: ByTypeItem[] = [
    { name: "Image", value: 1785, color: token.colorPrimary },
    { name: "Video", value: 1015, color: token.colorInfo },
    { name: "Human", value: 675, color: token.colorWarning },
    { name: "Dream", value: 395, color: aiCaveColors.dreamActor },
  ];

  const totalUsed = usedCreditByTypeMock.reduce((sum, item) => sum + item.value, 0);
  const allowance = 5200;
  const usagePercent = (totalUsed / allowance) * 100;

  const statCards: CreditStatCard[] = [
    {
      label: "Monthly Credit Used",
      value: totalUsed.toLocaleString(),
      sub: `Limit ${allowance.toLocaleString()} credits`,
      progress: usagePercent,
      icon: <Wallet size={15} />,
      iconBg: token.colorPrimaryBg,
      iconColor: token.colorPrimary,
    },
    {
      label: "Current Cycle Balance",
      value: (allowance - totalUsed).toLocaleString(),
      sub: "Available this cycle",
      icon: <Gauge size={15} />,
      iconBg: token.colorInfoBg,
      iconColor: token.colorInfo,
    },
    {
      label: "Today Credit Activity",
      value: "324",
      sub: "Compared to yesterday",
      trend: "+7.2%",
      icon: <CalendarDays size={15} />,
      iconBg: token.colorWarningBg,
      iconColor: token.colorWarning,
    },
    {
      label: "Peak Generator",
      value: "Image",
      sub: "Most used type this month",
      trend: "+4.8%",
      icon: <Sparkles size={15} />,
      iconBg: token.colorSuccessBg,
      iconColor: token.colorSuccess,
    },
  ];
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
    
          <CreditStatic />

      <Row gutter={[16, 16]} align="stretch"  style={{padding: "0 24px" }}>
        <Col xs={24} lg={16} className="flex">
          <Card title="Daily Credit Activity" style={{ height: "100%", width: "100%" }}>
            <DailyCreditAct
              data={usedCreditPerMonthMock}
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
          </Card>
        </Col>

        <Col xs={24} lg={8} className="flex">
          <Card title="Spend by Type" style={{ height: "100%", width: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              <SpendByTypeChart
                data={usedCreditByTypeMock}
                colors={{
                  tooltipBg: token.colorBgContainer,
                  tooltipBorder: token.colorBorder,
                  tooltipText: token.colorTextBase,
                }}
              />
              {usedCreditByTypeMock.map((item) => (
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
          </Card>
        </Col>
                  </Row>
                  <div style={{ padding: "0 24px" }}>
                      <TransactionHistory />  </div> 
                 <div style={{ padding: "0 24px" }}> <ExpireNotice/></div>
          </Space>
      </div>
        <RedeemCouponModal
          open={open}
          form={form}
          handleOk={handleOk}
          handleFinish={handleCouponSubmit}
          confirmLoading={confirmLoading}
          handleCancel={handleCancel}
        />
          </div>
  );
};

export default CreditPage;