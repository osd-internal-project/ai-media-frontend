import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button, Card, Col, Flex, Row, Slider, Typography } from "antd";

type GroupModeItem = {
	id: string;
	label: string;
	description: string;
};

type RatioOption = {
	label: string;
	key: string;
	icon: React.ReactNode;
	onClick: () => void;
};

type Props = {
	semantic: Record<string, any>;
	groupMode?: string;
	setGroupMode?: (groupMode: string) => void;
	groupModes?: GroupModeItem[];
	selectedResolution?: string;
	selectedRatio?: string;
	handleResolutionChange?: (resolution: string) => void;
	ratioOptions?: RatioOption[];
	getRatioIcon?: (ratio: string) => React.ReactNode;
	selectedMaximumImage?: number;
	setSelectedMaximumImage?: (selectedMaximumImage: number) => void;
	ratioSizeMap?: Record<string, { width: number; height: number }>;
	settingsTitle?: string;
	modeTitle?: string;
	ratioTitle?: string;
	resolutionTitle?: string;
	countTitle?: string;
	resolutionOptions?: string[];
	showModeSection?: boolean;
	showRatioSection?: boolean;
	showResolutionSection?: boolean;
	showCountSection?: boolean;
	countControl?: {
		min?: number;
		max?: number;
		step?: number;
		value: number;
		onChange: (value: number) => void;
		label?: string;
	};
	extraContent?: React.ReactNode;
};

export default function SettingSection({
	semantic,
	groupMode,
	setGroupMode,
	groupModes = [],
	selectedResolution,
	selectedRatio,
	handleResolutionChange,
	ratioOptions = [],
	getRatioIcon,
	selectedMaximumImage,
	setSelectedMaximumImage,
	ratioSizeMap: _ratioSizeMap,
	settingsTitle = "Settings",
	modeTitle = "Mode",
	ratioTitle = "Aspect Ratio",
	resolutionTitle = "Resolution",
	countTitle = "Images Count",
	resolutionOptions = ["2k", "4k"],
	showModeSection,
	showRatioSection,
	showResolutionSection,
	showCountSection,
	countControl,
	extraContent,
}: Props) {
	const [showSettings, setShowSettings] = useState(true);

	const normalizedCountControl = countControl
		? {
				min: countControl.min ?? 1,
				max: countControl.max ?? 15,
				step: countControl.step ?? 1,
				label: countControl.label ?? countTitle,
				value: countControl.value,
				onChange: countControl.onChange,
		  }
		: selectedMaximumImage !== undefined && setSelectedMaximumImage
			? {
					min: 1,
					max: 15,
					step: 1,
					label: countTitle,
					value: selectedMaximumImage,
					onChange: setSelectedMaximumImage,
			  }
			: undefined;

	const [localCount, setLocalCount] = useState(normalizedCountControl?.value ?? 1);

	const shouldShowMode = showModeSection ?? Boolean(groupModes.length && setGroupMode && groupMode);
	const shouldShowRatio = showRatioSection ?? ratioOptions.length > 0;
	const shouldShowResolution =
		showResolutionSection ?? Boolean(selectedResolution && handleResolutionChange);
	const shouldShowCount = showCountSection ?? Boolean(normalizedCountControl);

	useEffect(() => {
		if (normalizedCountControl) {
			setLocalCount(normalizedCountControl.value);
		}
	}, [normalizedCountControl?.value]);

	const setCountSafely = (value: number) => {
		if (!normalizedCountControl) return;
		const normalized = Math.min(
			normalizedCountControl.max,
			Math.max(normalizedCountControl.min, value),
		);
		normalizedCountControl.onChange(normalized);
		setLocalCount(normalized);
	};

	return (
		<Flex vertical gap={8}>
			<Button
				type="text"
				onClick={() => setShowSettings((previous) => !previous)}
				style={{
					padding: 0,
					height: "auto",
					justifyContent: "space-between",
					color: semantic.colorTextSecondary,
				}}
			>
				<Typography.Text
					style={{
						fontSize: 11,
						fontWeight: 600,
						textTransform: "uppercase",
						letterSpacing: 0.5,
						color: semantic.colorTextSecondary,
					}}
				>
						{settingsTitle}
				</Typography.Text>
				{showSettings ? (
					<ChevronUp size={14} style={{ color: semantic.colorTextSecondary }} />
				) : (
					<ChevronDown size={14} style={{ color: semantic.colorTextSecondary }} />
				)}
			</Button>

			{showSettings && (
				<Card
					variant="borderless"
					style={{
						background: semantic.colorBgContainer,
						border: `1px solid ${semantic.colorBorder}`,
						borderRadius: 12,
					}}
					styles={{ body: { padding: 12 } }}
				>
					<Flex vertical gap={14}>
						{shouldShowMode && (
							<Flex vertical gap={6}>
								<Typography.Text style={{ fontSize: 12, color: semantic.colorTextSecondary }}>
									{modeTitle}
								</Typography.Text>
								<Row gutter={[8, 8]}>
									{groupModes.slice(0, 2).map((mode) => (
										<Col span={12} key={mode.id}>
											<Button
												block
												onClick={() => setGroupMode?.(mode.id)}
												style={{
													height: 30,
													fontSize: 12,
													borderRadius: 8,
													border: `1px solid ${
														groupMode === mode.id
															? semantic.colorPrimary
															: semantic.colorBorder
													}`,
													background:
														groupMode === mode.id
															? `${semantic.colorPrimary}1A`
															: "transparent",
													color:
														groupMode === mode.id
															? semantic.colorPrimary
															: semantic.colorTextSecondary,
												}}
											>
												{mode.label}
											</Button>
										</Col>
									))}
								</Row>
							</Flex>
						)}

						{shouldShowRatio && (
							<Flex vertical gap={6}>
								<Typography.Text style={{ fontSize: 12, color: semantic.colorTextSecondary }}>
									{ratioTitle}
								</Typography.Text>
								<Row gutter={[6, 6]}>
									{ratioOptions.map((option) => (
										<Col span={8} key={option.key}>
											<Button
												block
												onClick={option.onClick}
												icon={getRatioIcon ? getRatioIcon(option.key) : option.icon}
												style={{
													height: 30,
													fontSize: 11,
													borderRadius: 8,
													border: `1px solid ${
														selectedRatio === option.key
															? semantic.colorPrimary
															: semantic.colorBorder
													}`,
													background:
														selectedRatio === option.key
															? `${semantic.colorPrimary}1A`
															: "transparent",
													color:
														selectedRatio === option.key
															? semantic.colorPrimary
															: semantic.colorTextSecondary,
												}}
											>
												{option.label}
											</Button>
										</Col>
									))}
								</Row>
							</Flex>
						)}

						{shouldShowCount && normalizedCountControl && (
							<Flex vertical gap={6}>
								<Flex align="center" justify="space-between">
									<Typography.Text style={{ fontSize: 12, color: semantic.colorTextSecondary }}>
										{normalizedCountControl.label}
									</Typography.Text>
									<Typography.Text style={{ fontSize: 12, color: semantic.colorPrimary }}>
										{localCount}
									</Typography.Text>
								</Flex>
								<Flex align="center" gap={10} style={{ width: "100%" }}>
									<Flex style={{ flex: 1, width: "100%", minWidth: 0 }}>
										<Slider
											style={{ width: "100%" }}
											min={normalizedCountControl.min}
											max={normalizedCountControl.max}
											step={normalizedCountControl.step}
											value={localCount}
											onChange={(value) => {
												if (typeof value === "number") {
													setLocalCount(value);
												}
											}}
											onChangeComplete={(value) => {
												if (typeof value === "number") {
													setCountSafely(value);
												}
											}}
											tooltip={{ open: false }}
											styles={{
												track: { background: semantic.colorPrimary },
												handle: {
													borderColor: semantic.colorPrimary,
													background: semantic.colorPrimary,
												},
												rail: { background: semantic.colorBorder },
											}}
										/>
									</Flex>
								</Flex>
								<Flex justify="space-between">
									<Typography.Text style={{ fontSize: 10, color: semantic.colorTextSecondary }}>
										{normalizedCountControl.min}
									</Typography.Text>
									<Typography.Text style={{ fontSize: 10, color: semantic.colorTextSecondary }}>
										{normalizedCountControl.max}
									</Typography.Text>
								</Flex>
							</Flex>
						)}

						{shouldShowResolution && (
							<Flex vertical gap={6}>
								<Typography.Text style={{ fontSize: 12, color: semantic.colorTextSecondary }}>
									{resolutionTitle}
								</Typography.Text>
								<Row gutter={[6, 6]}>
									{resolutionOptions.map((resolution) => (
										<Col span={12} key={resolution}>
											<Button
												block
												onClick={() => handleResolutionChange?.(resolution)}
												style={{
													height: 30,
													fontSize: 12,
													borderRadius: 8,
													border: `1px solid ${
														selectedResolution === resolution
															? semantic.colorPrimary
															: semantic.colorBorder
													}`,
													background:
														selectedResolution === resolution
															? `${semantic.colorPrimary}1A`
															: "transparent",
													color:
														selectedResolution === resolution
															? semantic.colorPrimary
															: semantic.colorTextSecondary,
												}}
											>
												{resolution.toUpperCase()}
											</Button>
										</Col>
									))}
								</Row>
							</Flex>
						)}

						{extraContent}
					</Flex>
				</Card>
			)}
		</Flex>
	);
}
