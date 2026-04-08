import React from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Avatar,
  Divider,
  Select,
  List,
  Skeleton,
} from "antd";
import {
  DownloadOutlined,
} from "@ant-design/icons";
import { aiCaveColors, getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import useResponsive from "@/app/hooks/useResponsive";
import {
  AlertTriangle,
  CreditCard,
  Film,
  History,
  ImageIcon,
  Mic2,
  Ticket,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

const { Text, Title } = Typography;

type TransactionType =
  | "generation_image"
  | "generation_video"
  | "generation_omnihuman"
  | "generation_dreamactor"
  | "topup_coupon"
  | "topup_purchase"
  | "admin_grant"
  | "refund"
  | "expiry";

type CreditTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
  couponCode?: string;
  projectName?: string;
  generationType?: "image" | "video" | "omnihuman" | "dreamactor";
};

export default function TransactionHistory() {
  const { mode } = useThemeMode();
  const { isMobile } = useResponsive();
  const semantic = getThemeConfig(mode).token ?? {};
  const [filterType, setFilterType] = useState("allType");
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const now = new Date("2026-04-01");
  const pageSize = 8;
  const colorPrimary = semantic.colorPrimary ?? aiCaveColors.primary;
  const colorSuccess = semantic.colorSuccess ?? aiCaveColors.success;
  const colorInfo = semantic.colorInfo ?? aiCaveColors.secondary;
  const colorError = semantic.colorError ?? aiCaveColors.error;

  function daysAgo(d: number): string {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date.toISOString();
  }

  const mockCreditTransactions: CreditTransaction[] = [
    { id: "tx1", type: "topup_coupon", amount: 500, balanceAfter: 3250, description: "Coupon: TRIAL2026", timestamp: daysAgo(30), couponCode: "TRIAL2026" },
    { id: "tx2", type: "topup_purchase", amount: 2000, balanceAfter: 5250, description: "Purchase - Pro Plan (Mar)", timestamp: daysAgo(29) },
    { id: "tx3", type: "generation_image", amount: -5, balanceAfter: 5245, description: "Image gen x 1 - ATOM PROJECT", timestamp: daysAgo(28), projectName: "ATOM PROJECT", generationType: "image" },
    { id: "tx4", type: "generation_image", amount: -25, balanceAfter: 5220, description: "Image gen x 5 - OSD DEMO", timestamp: daysAgo(27), projectName: "OSD DEMO Test", generationType: "image" },
    { id: "tx5", type: "generation_video", amount: -80, balanceAfter: 5140, description: "Video gen x 2 - Demo_KTC", timestamp: daysAgo(25), projectName: "Demo_KTC", generationType: "video" },
    { id: "tx6", type: "generation_omnihuman", amount: -120, balanceAfter: 5020, description: "OmniHuman - ATOM PROJECT", timestamp: daysAgo(22), projectName: "ATOM PROJECT", generationType: "omnihuman" },
    { id: "tx7", type: "generation_image", amount: -30, balanceAfter: 4990, description: "Image gen x 6 - OSD DEMO", timestamp: daysAgo(20), projectName: "OSD DEMO Test", generationType: "image" },
    { id: "tx8", type: "admin_grant", amount: 200, balanceAfter: 5190, description: "Admin grant - Q1 bonus", timestamp: daysAgo(18) },
    { id: "tx9", type: "generation_dreamactor", amount: -150, balanceAfter: 5040, description: "DreamActor - Demo_KTC", timestamp: daysAgo(15), projectName: "Demo_KTC", generationType: "dreamactor" },
    { id: "tx10", type: "generation_image", amount: -15, balanceAfter: 5025, description: "Image gen x 3 - ATOM PROJECT", timestamp: daysAgo(12), projectName: "ATOM PROJECT", generationType: "image" },
    { id: "tx11", type: "topup_coupon", amount: 300, balanceAfter: 5325, description: "Coupon: PROMO500", timestamp: daysAgo(10), couponCode: "PROMO500" },
    { id: "tx12", type: "generation_video", amount: -40, balanceAfter: 5285, description: "Video gen x 1 - ATOM PROJECT", timestamp: daysAgo(8), projectName: "ATOM PROJECT", generationType: "video" },
    { id: "tx13", type: "generation_image", amount: -20, balanceAfter: 5265, description: "Image gen x 4 - OSD DEMO", timestamp: daysAgo(6), projectName: "OSD DEMO Test", generationType: "image" },
    { id: "tx14", type: "generation_omnihuman", amount: -120, balanceAfter: 5145, description: "OmniHuman - ATOM PROJECT", timestamp: daysAgo(4), projectName: "ATOM PROJECT", generationType: "omnihuman" },
    { id: "tx15", type: "generation_image", amount: -10, balanceAfter: 5135, description: "Image gen x 2 - Demo_KTC", timestamp: daysAgo(2), projectName: "Demo_KTC", generationType: "image" },
    { id: "tx16", type: "generation_video", amount: -40, balanceAfter: 5095, description: "Video gen x 1 - OSD DEMO", timestamp: daysAgo(1), projectName: "OSD DEMO Test", generationType: "video" },
    { id: "tx17", type: "generation_image", amount: -5, balanceAfter: 5090, description: "Image gen x 1 - ATOM PROJECT", timestamp: daysAgo(0), projectName: "ATOM PROJECT", generationType: "image" },
  ];

  const TYPE_CONFIG: Record<
    TransactionType,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    generation_image: { label: "Image", icon: <ImageIcon size={14} />, color: colorPrimary },
    generation_video: { label: "Video", icon: <Video size={14} />, color: aiCaveColors.secondary },
    generation_omnihuman: { label: "OmniHuman", icon: <Mic2 size={14} />, color: aiCaveColors.warning },
    generation_dreamactor: { label: "DreamActor", icon: <Film size={14} />, color: aiCaveColors.dreamActor },
    topup_coupon: { label: "Coupon", icon: <Ticket size={14} />, color: colorSuccess },
    topup_purchase: { label: "Purchase", icon: <CreditCard size={14} />, color: colorInfo },
    admin_grant: { label: "Admin Grant", icon: <Zap size={14} />, color: aiCaveColors.warning },
    refund: { label: "Refund", icon: <TrendingUp size={14} />, color: colorSuccess },
    expiry: { label: "Expiry", icon: <AlertTriangle size={14} />, color: colorError },
  };

  const filteredData = useMemo(() => {
    if (filterType === "allType") return mockCreditTransactions;
    if (filterType === "generations") {
      return mockCreditTransactions.filter((item) => item.type.startsWith("generation_"));
    }
    if (filterType === "topUps") {
      return mockCreditTransactions.filter(
        (item) => item.type === "topup_coupon" || item.type === "topup_purchase",
      );
    }
    return mockCreditTransactions.filter((item) => item.type === "admin_grant");
  }, [filterType]);

  const visibleData = filteredData.slice(0, visibleCount);

  const handleChange = (value: string) => {
    setFilterType(value);
    setVisibleCount(pageSize);
  };

  const loadMoreData = () => {
    if (isLoadingMore || visibleCount >= filteredData.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + pageSize, filteredData.length));
      setIsLoadingMore(false);
    }, 250);
  };

  const handleScrollLoad = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const threshold = 48;
    const reachedBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - threshold;

    if (reachedBottom) {
      loadMoreData();
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Card
      bordered={false}
      title={
        <Space direction="horizontal" size={8}>
          <History size={18} />
          Transaction History
          <Tag>{filteredData.length}</Tag>
          </Space>}
      extra={
        <Space>
          <Select
            defaultValue="allType"
            style={{ width: 150 }}
            onChange={handleChange}
            options={[
              { value: "allType", label: "All Types" },
              { value: "generations", label: "Generations" },
              { value: "topUps", label: "Top-ups" },
              { value: "adminGrant", label: "Admin Grant" },
            ]}
          />
          <Button type="text" shape="circle" icon={<DownloadOutlined />} />
        </Space>
      }
      style={{
        borderRadius: 22,
        border: `1px solid ${semantic.colorBorder}`,
        background: semantic.colorBgContainer,
        height: isMobile ? 480 : 560,
        overflow: "hidden",
        boxShadow:
          mode === "dark"
            ? "0 12px 32px rgba(0,0,0,0.18)"
            : "0 10px 24px rgba(0,0,0,0.06)",
      }}
      styles={{
        body: {
          padding: isMobile ? 18 : 24,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div
        id="credit-transaction-scroll"
        style={{
          height: isMobile ? 340 : 410,
          overflowY: "auto",
          overflowX: "hidden",
        }}
        onScroll={handleScrollLoad}
      >
        <List
          itemLayout="horizontal"
          dataSource={visibleData}
          renderItem={(item) => {
            const typeConfig = TYPE_CONFIG[item.type];
            const amountColor = item.amount > 0 ? colorSuccess : colorError;
            const title = item.projectName
              ? `${typeConfig.label} - ${item.projectName}`
              : typeConfig.label;

            return (
              <List.Item style={{ width: "100%", alignItems: "flex-start" }}>
                <List.Item.Meta
                  style={{ minWidth: 0, flex: 1, marginRight: 12 }}
                  avatar={
                    <Avatar
                      size={36}
                      style={{
                        background: `${typeConfig.color}22`,
                        color: typeConfig.color,
                        border: `1px solid ${typeConfig.color}55`,
                      }}
                    >
                      {typeConfig.icon}
                    </Avatar>
                  }
                  title={
                    <Text
                      strong
                      style={{
                        display: "block",
                        margin: 0,
                        fontSize: 12,
                        lineHeight: 1.3,
                      }}
                      ellipsis={{ tooltip: title }}
                    >
                      {title}
                    </Text>
                  }
                  description={
                    <Text style={{ fontSize: 10,}} type="secondary" ellipsis={{ tooltip: `${formatDate(item.timestamp)} | ${item.description}` }}>
                      {formatDate(item.timestamp)} | {item.description}
                    </Text>
                  }
                />
                <div style={{ flexShrink: 0, paddingRight: 8}}>
                  <Space direction="vertical" align="end" size={2}>
                    <Text style={{ color: amountColor, fontSize: 12,  }}>
                      {item.amount > 0 ? `+${item.amount}` : item.amount} cr
                    </Text>
                    <Text style={{fontSize: 10,}} type="secondary">{item.balanceAfter} bal</Text>
                  </Space>
                </div>
              </List.Item>
            );
          }}
        />
        {isLoadingMore && <Skeleton avatar paragraph={{ rows: 1 }} active />}
        {!isLoadingMore && visibleData.length >= filteredData.length && (
          <Divider plain>No more transactions</Divider>
        )}
      </div>
    </Card>
  );
}