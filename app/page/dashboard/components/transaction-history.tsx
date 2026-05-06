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
import { DownloadOutlined } from "@ant-design/icons";
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
import { ICouponCodeUsage } from "@/app/common/coupon.type";
import { formatNumber } from "@/app/utils/format";

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

type TransactionHistoryProps = {
  size?: "default" | "compact";
  couponCodeUsage: { data: ICouponCodeUsage[]; total: number };
};

export default function TransactionHistory({
  size = "default",
  couponCodeUsage,
}: TransactionHistoryProps) {
  const { mode } = useThemeMode();
  const { isMobile } = useResponsive();
  const semantic = getThemeConfig(mode).token ?? {};
  const isCompact = size === "compact";
  const [filterType, setFilterType] = useState("allType");
  const pageSize = isCompact ? 4 : 8;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState(false);

  const now = new Date("2026-04-01");
  const colorPrimary = semantic.colorPrimary ?? aiCaveColors.primary;
  const colorSuccess = semantic.colorSuccess ?? aiCaveColors.success;
  const colorInfo = semantic.colorInfo ?? aiCaveColors.secondary;
  const colorError = semantic.colorError ?? aiCaveColors.error;

  function daysAgo(d: number): string {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date.toISOString();
  }

  const TYPE_CONFIG: Record<
    TransactionType,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    generation_image: {
      label: "Image",
      icon: <ImageIcon size={14} />,
      color: colorPrimary,
    },
    generation_video: {
      label: "Video",
      icon: <Video size={14} />,
      color: aiCaveColors.secondary,
    },
    generation_omnihuman: {
      label: "OmniHuman",
      icon: <Mic2 size={14} />,
      color: aiCaveColors.warning,
    },
    generation_dreamactor: {
      label: "DreamActor",
      icon: <Film size={14} />,
      color: aiCaveColors.dreamActor,
    },
    topup_coupon: {
      label: "Coupon",
      icon: <Ticket size={14} />,
      color: colorSuccess,
    },
    topup_purchase: {
      label: "Purchase",
      icon: <CreditCard size={14} />,
      color: colorInfo,
    },
    admin_grant: {
      label: "Admin Grant",
      icon: <Zap size={14} />,
      color: aiCaveColors.warning,
    },
    refund: {
      label: "Refund",
      icon: <TrendingUp size={14} />,
      color: colorSuccess,
    },
    expiry: {
      label: "Expiry",
      icon: <AlertTriangle size={14} />,
      color: colorError,
    },
  };

  // const filteredData = useMemo(() => {
  //   if (filterType === "allType") return mockCreditTransactions;
  //   if (filterType === "generations") {
  //     return mockCreditTransactions.filter((item) => item.type.startsWith("generation_"));
  //   }
  //   if (filterType === "topUps") {
  //     return mockCreditTransactions.filter(
  //       (item) => item.type === "topup_coupon" || item.type === "topup_purchase",
  //     );
  //   }
  //   return mockCreditTransactions.filter((item) => item.type === "admin_grant");
  // }, [filterType]);

  // const visibleData = filteredData.slice(0, visibleCount);

  const handleChange = (value: string) => {
    setFilterType(value);
    setVisibleCount(pageSize);
  };

  const loadMoreData = () => {
    if (isLoadingMore || visibleCount >= couponCodeUsage.data.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + pageSize, couponCodeUsage.data.length),
      );
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

  const exportToExcel = () => {
    try {
      setIsLoadingExport(true);
      const headers = ["Code", "Date", "Increase Credit", "Credit Balance"];
      const rows = couponCodeUsage.data.map((item) => [
        item.couponCode?.code ?? "",
        item.usedAt ? new Date(item.usedAt).toLocaleString("en-GB") : "",
        item.onTopCredit ?? 0,
        item.remainCredit ?? 0,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      // UTF-8 BOM so Excel recognises encoding correctly
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `coupon-history-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setIsLoadingExport(false);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setIsLoadingExport(false);
    }
  };

  const formatDate = (value: string | Date) =>
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
          <Tag>{couponCodeUsage.total}</Tag>
        </Space>
      }
      extra={
        <Space>
          {/* <Select
            defaultValue="allType"
            style={{ width: isCompact ? 124 : 150 }}
            onChange={handleChange}
            options={[
              { value: "allType", label: "All Types" },
              { value: "generations", label: "Generations" },
              { value: "topUps", label: "Top-ups" },
              { value: "adminGrant", label: "Admin Grant" },
            ]}
          /> */}
          <Button
            type="text"
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={couponCodeUsage.total === 0}
            onClick={exportToExcel}
            loading={isLoadingExport}
          />
        </Space>
      }
      style={{
        borderRadius: 22,
        border: `1px solid ${semantic.colorBorder}`,
        background: semantic.colorBgContainer,
        height: isCompact ? (isMobile ? 380 : 430) : isMobile ? 480 : 560,
        overflow: "hidden",
        boxShadow:
          mode === "dark"
            ? "0 12px 32px rgba(0,0,0,0.18)"
            : "0 10px 24px rgba(0,0,0,0.06)",
      }}
      styles={{
        body: {
          padding: isCompact ? (isMobile ? 14 : 16) : isMobile ? 18 : 24,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div
        id="credit-transaction-scroll"
        style={{
          height: isCompact ? (isMobile ? 255 : 285) : isMobile ? 340 : 410,
          overflowY: "auto",
          overflowX: "hidden",
        }}
        onScroll={handleScrollLoad}
      >
        <List
          itemLayout="horizontal"
          dataSource={couponCodeUsage.data || []}
          renderItem={(item) => {
            // const typeConfig = TYPE_CONFIG[item.type];
            const amountColor =
              item.onTopCredit > 0 ? colorSuccess : colorError;
            // const title = item.projectName
            //   ? `${typeConfig.label} - ${item.projectName}`
            //   : typeConfig.label;

            return (
              <List.Item style={{ width: "100%", alignItems: "flex-start" }}>
                <List.Item.Meta
                  style={{ minWidth: 0, flex: 1, marginRight: 12 }}
                  avatar={
                    <Avatar
                      size={25}
                      style={{
                        background: colorSuccess,
                        color: colorInfo,
                        border: `1px solid `,
                      }}
                    >
                      <Ticket size={20} />
                    </Avatar>
                  }
                  title={
                    <Text
                      strong
                      style={{
                        display: "block",
                        margin: 0,
                        fontSize: isCompact ? 11 : 12,
                        lineHeight: 1.3,
                      }}
                      ellipsis={{ tooltip: item.couponCode?.code || "" }}
                    >
                      {item.couponCode?.code || ""}
                    </Text>
                  }
                  description={
                    <Text
                      style={{ fontSize: isCompact ? 9 : 10 }}
                      type="secondary"
                      ellipsis={{
                        tooltip: `${formatDate(item.usedAt || "")}`,
                      }}
                    >
                      {formatDate(item.usedAt || "")}
                    </Text>
                  }
                />
                <div style={{ flexShrink: 0, paddingRight: 8 }}>
                  <Space direction="vertical" align="end" size={2}>
                    <Text
                      style={{
                        color: amountColor,
                        fontSize: isCompact ? 11 : 12,
                      }}
                    >
                      {item.onTopCredit > 0
                        ? `+${formatNumber(item.onTopCredit)}`
                        : "-"}{" "}
                      cr
                    </Text>
                    <Text
                      style={{ fontSize: isCompact ? 9 : 10 }}
                      type="secondary"
                    >
                      {formatNumber(item.remainCredit)} bal
                    </Text>
                  </Space>
                </div>
              </List.Item>
            );
          }}
        />
        {isLoadingMore && <Skeleton avatar paragraph={{ rows: 1 }} active />}
        {/* {!isLoadingMore && visibleData.length >= filteredData.length && (
          <Divider plain>No more transactions</Divider>
        )} */}
      </div>
    </Card>
  );
}
