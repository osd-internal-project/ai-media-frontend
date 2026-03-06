import React from "react";
import { Progress, Typography } from "antd";
import { FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";

type QuataSize = "small" | "middle" | "large";

interface QuataProps {
	imageUsed: number;
	imageTotal: number;
	tokenUsed?: number;
	tokenTotal?: number;
	semantic?: any;
	size?: QuataSize;
	showToken?: boolean;
	showProgress?: boolean;
	title?: string;
}

const SIZE_MAP: Record<QuataSize, { icon: number; label: number; value: number; gap: number }> = {
	small: { icon: 10, label: 10, value: 10, gap: 0 },
	middle: { icon: 14, label: 11, value: 11, gap: 4 },
	large: { icon: 16, label: 12, value: 12, gap: 6 },
};

const Quata: React.FC<QuataProps> = ({
	imageUsed,
	imageTotal,
	tokenUsed = 0,
	tokenTotal = 0,
	semantic,
	size = "middle",
	showToken = true,
	showProgress = true,
	title,
}) => {
	const ui = SIZE_MAP[size];

	const safeImageTotal = Math.max(0, imageTotal);
	const safeTokenTotal = Math.max(0, tokenTotal);
	const imagePercent = safeImageTotal > 0 ? Math.round((imageUsed / safeImageTotal) * 100) : 0;
	const tokenPercent = safeTokenTotal > 0 ? Math.round((tokenUsed / safeTokenTotal) * 100) : 0;

	const colorTextBase = semantic?.colorTextBase ?? "#e5e7eb";
	const colorTextSecondary = semantic?.colorTextSecondary ?? "#94a3b8";
	const colorPrimary = semantic?.colorPrimary ?? "#5b6bf9";
	const colorTrail = semantic?.colorPrimaryBg ?? semantic?.colorBorder ?? "rgba(148,163,184,.25)";

	return (
		<div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: ui.gap }}>
			{title ? (
				<Typography.Text style={{ color: colorTextSecondary, fontSize: ui.label, fontWeight: 600 }}>
					{title}
				</Typography.Text>
			) : null}

			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<span style={{ display: "flex", alignItems: "center", gap: ui.gap }}>
					<FileImageOutlined style={{ fontSize: ui.icon, color: colorTextSecondary }} />
					<Typography.Text style={{ color: colorTextSecondary, fontSize: ui.label }}>Images</Typography.Text>
				</span>
				<Typography.Text strong style={{ color: colorTextBase, fontSize: ui.value }}>
					{imageUsed}/{safeImageTotal}
				</Typography.Text>
			</div>
			{showProgress ? (
				<Progress
					percent={imagePercent}
					size="small"
					showInfo={false}
					strokeColor={colorPrimary}
					trailColor={colorTrail}
					style={{ margin: 0, padding: 0 }}
				/>
			) : null}

			{showToken ? (
				<>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<span style={{ display: "flex", alignItems: "center", gap: ui.gap }}>
							<VideoCameraOutlined style={{ fontSize: ui.icon, color: colorTextSecondary }} />
							<Typography.Text style={{ color: colorTextSecondary, fontSize: ui.label }}>
								VDO Token
							</Typography.Text>
						</span>
						<Typography.Text strong style={{ color: colorTextBase, fontSize: ui.value }}>
							{tokenUsed.toLocaleString()}/{safeTokenTotal.toLocaleString()}
						</Typography.Text>
					</div>
					{showProgress ? (
						<Progress
							percent={tokenPercent}
							size="small"
							showInfo={false}
							strokeColor={colorPrimary}
							trailColor={colorTrail}
							style={{ margin: 0, padding: 0 }}
						/>
					) : null}
				</>
			) : null}
		</div>
	);
};

export default Quata;
