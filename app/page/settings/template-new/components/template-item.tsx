import type { TGenerateType } from "@/app/common/prompt-guide.type";
import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag, Typography } from "antd";
import { Sparkles } from "lucide-react";
import React, { type FC, useState } from "react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

type TemplateItemProps = {
	title?: string;
	description?: string;
	textPrompt?: string;
	generateType?: TGenerateType;
	categoryLabel?: string;
	model?: string;
	canManage?: boolean;
	showActions?: boolean;
	showUseBadge?: boolean;
	onEdit?: () => void;
	onUse?: () => void;
};

const getTypeBadgeStyle = (
	type: TGenerateType | undefined,
	semantic: {
		colorPrimary?: string;
		colorSuccess?: string;
		colorWarning?: string;
		colorInfo?: string;
	},
) => {
	const primary = semantic.colorPrimary || "#1677ff";
	const success = semantic.colorSuccess || "#389e0d";
	const warning = semantic.colorWarning || "#d46b08";
	const info = semantic.colorInfo || "#1677ff";

	if (type === "video") {
		return {
			color: primary,
			background: `${primary}1A`,
			borderColor: `${primary}33`,
		};
	}

	if (type === "omnihumen") {
		return {
			color: success,
			background: `${success}1A`,
			borderColor: `${success}33`,
		};
	}

	if (type === "dreamactor") {
		return {
			color: warning,
			background: `${warning}1A`,
			borderColor: `${warning}33`,
		};
	}

	return {
		color: info,
		background: `${info}1A`,
		borderColor: `${info}33`,
	};
};

const TemplateItem: FC<TemplateItemProps> = ({
	title,
	description,
	textPrompt,
	generateType,
	categoryLabel,
	model,
	canManage = false,
	showActions = true,
	showUseBadge = false,
	onEdit,
	onUse,
}) => {
	const { mode } = useThemeMode();
	const semantic = getThemeConfig(mode).token ?? {};
	const [isHovered, setIsHovered] = useState(false);
	const isLight = mode === "light";

	return (
		<Card
			size="small"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				borderColor: isHovered ? semantic.colorPrimaryBorder : semantic.colorBorder,
				background: isHovered && isLight ? semantic.colorFillAlter : semantic.colorBgContainer,
				transform: isHovered ? "translateY(-2px)" : "translateY(0)",
				boxShadow: isHovered ? "0 10px 28px rgba(0,0,0,0.12)" : "none",
				transition: "all 180ms ease",
			}}
		>
			<Space
				direction="vertical"
				size={12}
				style={{ width: "100%" }}
			>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						gap: 8,
					}}
				>
					<div>
						<Typography.Text strong>{title || "Template Name"}</Typography.Text>
						<Typography.Text type="secondary" style={{ display: "block" }}>
							{description || "No description"}
						</Typography.Text>
					</div>
					<Tag style={{ textTransform: "capitalize", ...getTypeBadgeStyle(generateType, semantic) }}>
						{generateType || "image"}
					</Tag>
				</div>

				<div
					style={{
						borderRadius: 10,
						padding: 10,
						background: isHovered ? semantic.colorBgContainerDisabled : semantic.colorBgTextActive,
						minHeight: 66,
						transition: "background-color 180ms ease",
					}}
				>
					<Typography.Paragraph
						style={{ margin: 0, fontFamily: "monospace", fontSize: 12 }}
						ellipsis={{ rows: 3 }}
					>
						{textPrompt || "Your prompt will appear here..."}
					</Typography.Paragraph>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 8,
					}}
				>
					<Space size={6} wrap>
						{categoryLabel && <Tag>{categoryLabel}</Tag>}
						{model && <Typography.Text type="secondary">{model}</Typography.Text>}
					</Space>

					{showActions ? (
						<Space wrap>
							{canManage && (
								<Button type="primary" icon={<EditOutlined />} onClick={onEdit} style={{ borderRadius: 10 }}>
									Edit
								</Button>
							)}
							{/* <Button
								type="primary"
								icon={<Sparkles size={14} />}
								onClick={onUse || onEdit}
								style={{ borderRadius: 10 }}
							>
								Use
							</Button> */}
						</Space>
					) : (
						showUseBadge && (
							<Tag
								style={{
									marginInlineEnd: 0,
									borderColor: semantic.colorPrimaryBorder,
									background: semantic.colorPrimaryBg,
									color: semantic.colorPrimary,
								}}
							>
								Use
							</Tag>
						)
					)}
				</div>
			</Space>
		</Card>
	);
};

export default TemplateItem;
