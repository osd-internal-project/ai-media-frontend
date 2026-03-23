import React from "react";
import { Button, Popover } from "antd";
import { Presentation } from "lucide-react";
import {
	TPromptGuide,
	TPromptGuideTemplate,
} from "@/app/common/prompt-guide.type";
import PromptPopover from "../../chat-components/prompt-popover";

type Props = {
	promptGuideTemplates: TPromptGuideTemplate[];
	fetchPromptGuides?: () => void | Promise<void>;
	fetchImagePromptGuides?: () => void;
	handleUsePromptGuide: (prompt: TPromptGuide) => void;
	buttonText?: string;
	placement?: "top" | "left" | "right" | "bottom" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom";
};

export default function PromptTemplateSection({
	promptGuideTemplates,
	fetchPromptGuides,
	fetchImagePromptGuides,
	handleUsePromptGuide,
	buttonText = "Browse Prompt Templates",
	placement = "rightTop",
}: Props) {
	const onFetchGuides = fetchPromptGuides ?? fetchImagePromptGuides;

	return (
		<Popover
			trigger="click"
			placement={placement}
			onOpenChange={(open) => open && onFetchGuides?.()}
			content={
				<PromptPopover
					promptGuideTemplates={promptGuideTemplates}
					handleUsePromptGuide={handleUsePromptGuide}
				/>
			}
		>
			<Button block icon={<Presentation size={14} />}>
				{buttonText}
			</Button>
		</Popover>
	);
}
