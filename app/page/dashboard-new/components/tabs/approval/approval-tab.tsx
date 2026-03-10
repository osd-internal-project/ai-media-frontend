import React from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Progress,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, SettingOutlined } from "@ant-design/icons";
import type { ApprovalsTabProps } from "../types";

export default function ApprovalsTab({
  loading,
  pendingApprovals,
  openQuotaModal,
  onApprove,
  onDeny,
  onApproveAll,
  onDenyAll,
}: ApprovalsTabProps) {
  const { token } = theme.useToken();

  return (
    <Card
    bordered={false}
      style={{ background: "transparent", boxShadow: "none" }}
      bodyStyle={{ padding: 0 }}

    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Pending Approval Requests
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Users requesting quota increases beyond their current limits
          </Typography.Text>
        </div>
        {pendingApprovals.length > 0 && (
          <Space>
            <Button
              onClick={onApproveAll}
              icon={<CheckCircleOutlined />}
              style={{
                background: token.colorSuccessBg,
                borderColor: token.colorSuccessBorder,
                color: token.colorSuccess,
              }}
            >
              Approve All
            </Button>
            <Button
              onClick={onDenyAll}
              icon={<CloseCircleOutlined />}
              style={{
                background: token.colorErrorBg,
                borderColor: token.colorErrorBorder,
                color: token.colorError,
              }}
            >
              Deny All
            </Button>
          </Space>
        )}
      </div>

      {pendingApprovals.length === 0 ? (
        <Card
          bordered
          style={{
            textAlign: "center",
            background: token.colorSuccessBg,
            borderColor: token.colorSuccessBorder,
          }}
          bodyStyle={{ padding: 28 }}
        >
          <Empty description="No pending approval requests" />
        </Card>
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {pendingApprovals.map((user) => {
            const usagePct = Math.max(
              (user.usedCredit / Math.max(user.limitCredit, 1)) * 100,
              (user.usedImage / Math.max(user.limitImage, 1)) * 100,
            );
            const requestedCredit = Math.ceil(user.limitCredit * user.requestRatio);
            const requestedImage = Math.ceil(user.limitImage * user.requestRatio);
            return (
              <Card
                size="small"
                key={user.userId}
                bordered
                style={{ borderColor: token.colorBorderSecondary }}
                bodyStyle={{ padding: 14 }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Avatar style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary }}>
                        {user.fullname
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </Avatar>
                      <Typography.Text strong>{user.fullname}</Typography.Text>
                      {user.email ? <Badge count={user.email} color={token.colorBorder} /> : null}
                      <Tag color="warning">Quota Increase Request</Tag>
                    </div>

                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Current usage {usagePct.toFixed(0)}% of allocated quota
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Project: <span style={{ color: token.colorText }}>{user.projectName || "-"}</span>
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12, fontStyle: "italic" }}>
                       <span style={{ color: token.colorText }}>"{user.projectDescription || "-"}"</span>
                    </Typography.Text>

                    <div className="mt-3 max-w-md">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span style={{ color: token.colorTextSecondary }}>Current Usage</span>
                        <span style={{ color: usagePct > 80 ? token.colorWarning : token.colorText }}>
                          {Math.round(user.usedImage)} / {Math.round(user.limitImage)} ({usagePct.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress
                        percent={Math.min(usagePct, 100)}
                        showInfo={false}
                        strokeColor={usagePct > 80 ? token.colorWarning : token.colorPrimary}
                        trailColor={token.colorFillSecondary}
                      />
                      <Typography.Text style={{ fontSize: 12, color: token.colorSuccess }}>
                        Requesting image limit: {Math.round(user.limitImage)} {"->"} {requestedImage}
                      </Typography.Text>
                      <br />
                      <Typography.Text style={{ fontSize: 12, color: token.colorInfo }}>
                        Requesting credit limit: {Math.round(user.limitCredit)} {"->"} {requestedCredit}
                      </Typography.Text>
                    </div>
                  </div>

                  <Space direction="vertical" style={{ width: 132 }}>
                    <Button
                      block
                      size="middle"
                      loading={loading}
                      onClick={() => onApprove(user)}
                      icon={<CheckCircleOutlined />}
                      style={{
                        background: token.colorSuccessBg,
                        borderColor: token.colorSuccessBorder,
                        color: token.colorSuccess,
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      block
                      size="middle"
                      loading={loading}
                      onClick={() => onDeny(user)}
                      icon={<CloseCircleOutlined />}
                      style={{
                        background: token.colorErrorBg,
                        borderColor: token.colorErrorBorder,
                        color: token.colorError,
                      }}
                    >
                      Deny
                    </Button>
                    <Button
                      block
                      size="middle"
                      onClick={() => openQuotaModal(user)}
                      icon={<SettingOutlined />}
                    >
                      Custom
                    </Button>
                  </Space>
                </div>
              </Card>
            );
          })}
        </Space>
      )}
    </Card>
  );
}
