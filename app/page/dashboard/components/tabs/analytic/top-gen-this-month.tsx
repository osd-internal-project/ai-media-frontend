import React from "react";
import { Avatar, Progress, Space, Typography } from "antd";
import type { DashboardUserRow } from "../types";

type TopGenThisMonthProps = {
	users: DashboardUserRow[];
	colors: {
		primaryBg: string;
		primary: string;
		progress: string;
	};
};

export default function TopGenThisMonth({ users, colors }: TopGenThisMonthProps) {
	return (
		<Space direction="vertical" style={{ width: "100%" }} size={10}>
			{users.map((user, index) => (
				<div key={user.userId} className="flex items-center gap-3">
					<span style={{ width: 16, fontSize: 12, color: "#8C99A9" }}>{index + 1}</span>
					<Avatar
						size={24}
						style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
					>
						{user.fullname
							.split(" ")
							.map((part) => part[0])
							.join("")
							.slice(0, 2)
							.toUpperCase()}
					</Avatar>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between mb-1">
							<Typography.Text style={{ fontSize: 12 }} ellipsis>
								{user.fullname}
							</Typography.Text>
							<Typography.Text type="secondary" style={{ fontSize: 12 }}>
								{user.usedCredit}/{user.limitCredit}
							</Typography.Text>
						</div>
						<Progress
							percent={Math.min((user.usedCredit / Math.max(user.limitCredit, 1)) * 100, 100)}
							showInfo={false}
							strokeColor={colors.progress}
						/>
					</div>
				</div>
			))}
		</Space>
	);
}
