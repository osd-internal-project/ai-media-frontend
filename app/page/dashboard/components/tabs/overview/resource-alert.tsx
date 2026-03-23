import React from "react";
import { Button, Card, Space, Tag, Typography, theme } from "antd";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DashboardUserRow } from "../types";

type ResourceAlertProps = {
	alertUsers: DashboardUserRow[];
	openQuotaModal: (user: DashboardUserRow) => void;
};

export default function ResourceAlert({
	alertUsers,
	openQuotaModal,
}: ResourceAlertProps) {
	const { token } = theme.useToken();

	return (
		<Card
			bodyStyle={{ padding: 16 }}
			style={{ height: "100%", width: "100%" }}
			title={
				<div className="flex items-center gap-2">
					<AlertTriangle size={16} color={token.colorWarning} />
					<span>Resource Alerts</span>
					<Tag color="warning" style={{ marginInlineEnd: 0 }}>
						{alertUsers.length}
					</Tag>
				</div>
			}
		>
			<Space direction="vertical" style={{ width: "100%" }} size={8}>
				{alertUsers.length === 0 ? (
					<div className="flex items-center gap-2">
						<CheckCircle2 size={16} color={token.colorSuccess} />
						<Typography.Text type="secondary" style={{ fontSize: 12 }}>
							All users within healthy limits
						</Typography.Text>
					</div>
				) : (
					alertUsers.slice(0, 4).map((user) => {
						const creditPct =
							(user.usedCredit / Math.max(user.limitCredit, 1)) * 100;
						const imagePct =
							(user.usedImage / Math.max(user.limitImage, 1)) * 100;
						const maxPct = Math.max(creditPct, imagePct);

						return (
							<div
								className="flex items-center justify-between rounded-lg border px-3 py-2"
								key={user.userId}
								style={{
									background: token.colorWarningBg,
									borderColor: token.colorWarningBorder,
								}}
							>
								<div className="flex items-center gap-2 min-w-0">
									<span
										style={{
											width: 6,
											height: 6,
											borderRadius: 999,
											background: token.colorWarning,
											flexShrink: 0,
										}}
									/>
									<div className="min-w-0">
										<Typography.Text style={{ fontSize: 13 }} ellipsis>
											{user.fullname}
										</Typography.Text>
										<br />
										<Typography.Text type="secondary" style={{ fontSize: 11 }}>
											{maxPct === creditPct
												? `Token: ${user.usedCredit}/${user.limitCredit}`
												: `Gen: ${user.usedImage}/${user.limitImage}`}
										</Typography.Text>
									</div>
								</div>
								<Button size="small" onClick={() => openQuotaModal(user)}>
									Adjust
								</Button>
							</div>
						);
					})
				)}
			</Space>
		</Card>
	);
}
