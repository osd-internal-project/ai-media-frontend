import React from "react";
import { Button } from "antd";
import { TPromptGuide, TPromptGuideType } from "@/app/common/prompt-guide.type";

type Props = {
    promptGuideTypes: TPromptGuideType[]
    onSetPromptText: (id: number) => void
}

export default function PromptStart({
    promptGuideTypes,
    onSetPromptText
}: Props) {

    return (
        <div className="text-white pt-10 px-5 flex-1 overflow-auto">
            <h1 className="text-4xl font-light text-center mb-4">{`AI Cave : Seedream 4.5`}</h1>
            <p className="text-gray-400 text-center mb-13">
                {`Kickstart your innovation process with our comprehensive selection of predefined prompts.`}
            </p>
            <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
                {promptGuideTypes.map((type) => (
                    <div key={type.id}>
                        <div className="flex items-center justify-center mb-3"></div>
                        <h3 className="text-xl font-semibold text-center mb-3">
                            {type.title}
                        </h3>
                        <div className="space-y-3 w-full">
                            {type.promptGuide?.map(
                                (item: TPromptGuide, index: number) => (
                                    <Button
                                        htmlType="button"
                                        key={item.id || index}
                                        size="large"
                                        onClick={() =>
                                            item.id && onSetPromptText(item.id)
                                        }
                                        className="w-full !bg-gradient-to-r !from-zinc-700 !to-zinc-900 hover:!from-zinc-600 hover:!to-zinc-800 !text-white py-3 px-4 rounded-lg !flex !items-center !justify-between transition-all duration-300 !border-none"
                                    >
                                        <span className="flex-1 text-left">
                                            {item.title}
                                        </span>
                                        <span className="ml-auto">→</span>
                                    </Button>
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};