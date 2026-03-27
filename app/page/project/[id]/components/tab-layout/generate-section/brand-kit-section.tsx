import React from "react";
import { Flex } from "antd";

type Props = {
	semantic: Record<string, any>;
	children?: React.ReactNode;
	style?: React.CSSProperties;
};

export default function BrandKitSection({
	semantic,
	children,
	style,
}: Props) {
	// Responsive: adjust width and padding for mobile overlays
	const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;
	const mobileStyle: React.CSSProperties = isMobile
		? {
				minWidth: "100vw",
				maxWidth: "100vw",
				paddingInline: 8,
				paddingBlock: 10,
			}
		: {};
	return (
		<Flex
			vertical
			gap={8}
			style={{
				position: "sticky",
				bottom: 0,
				zIndex: 10,
				borderTop: `1px solid ${semantic.colorBorder}`,
				background: semantic.colorBgContainer,
				paddingInline: 12,
				paddingBlock: 12,
				...mobileStyle,
				...style,
			}}
		>
			{children}
		</Flex>
	);
}
