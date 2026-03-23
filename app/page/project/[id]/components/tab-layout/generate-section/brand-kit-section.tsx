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
				...style,
			}}
		>
			{children}
		</Flex>
	);
}
