import React from "react";
import { Button, Card, Empty, Space, Tag, Typography, theme } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { ChevronRight, Clock3 } from "lucide-react";
import type { PendingApproval } from "../types";

type PendingApprovalCardProps = {
	pendingApprovals: PendingApproval[];
	onApprove: (user: PendingApproval) => void;
	onDeny: (user: PendingApproval) => void;
	setActiveTab: (tab: string) => void;
};

export default function PendingApprovalCard({
	pendingApprovals,
	onApprove,
	onDeny,
	setActiveTab,
}: PendingApprovalCardProps) {
	const { token } = theme.useToken();
	const visibleApprovals = pendingApprovals.slice(0, 3);

	return (
		<Card
			bodyStyle={{ padding: 16 }}
			style={{ height: "100%", width: "100%" }}
			title={
				<div className="flex items-center justify-between w-full">
					<Space>
						<Clock3 size={16} color={token.colorWarning} />
						<span>Pending Approvals</span>
						<Tag color="warning" style={{ marginInlineEnd: 0 }}>
							{pendingApprovals.length}
						</Tag>
					</Space>
					<Button
						type="link"
						size="small"
						onClick={() => setActiveTab("approvals")}
						icon={<ChevronRight size={14} />}
					>
						View all
					</Button>
				</div>
			}
		>
			<Space direction="vertical" style={{ width: "100%" }} size={8}>
				{pendingApprovals.length === 0 ? (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description="No pending approval requests"
					/>
				) : (
					visibleApprovals.map((item) => (
						<div
							key={item.userId}
							className="flex items-center justify-between rounded-lg border px-3 py-2"
							style={{
								background: token.colorFillQuaternary,
								borderColor: token.colorBorderSecondary,
							}}
						>
							<div className="min-w-0">
								<Typography.Text style={{ fontSize: 13 }} ellipsis>
									{item.fullname}
								</Typography.Text>
								<br />
								<Typography.Text type="secondary" style={{ fontSize: 11 }}>
									Image limit: {Math.round(item.limitImage)} {"->"}{" "}
									{Math.ceil(item.limitImage * item.requestRatio)}
								</Typography.Text>
							</div>
							<Space size={6}>
								<Button
									size="small"
									shape="circle"
									aria-label="Approve"
									icon={<CheckCircleOutlined />}
									onClick={() => onApprove(item)}
									style={{
										background: token.colorSuccessBg,
										borderColor: token.colorSuccessBorder,
										color: token.colorSuccess,
									}}
								/>
								<Button
									size="small"
									shape="circle"
									aria-label="Deny"
									icon={<CloseCircleOutlined />}
									onClick={() => onDeny(item)}
									style={{
										background: token.colorErrorBg,
										borderColor: token.colorErrorBorder,
										color: token.colorError,
									}}
								/>
							</Space>
						</div>
					))
				)}
			</Space>
		</Card>
	);
}
