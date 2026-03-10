export type GenerationTrendItem = {
	month: string;
	image: number;
	video: number;
	human: number;
};

export type TypeDistributionItem = {
	name: string;
	value: number;
};

export const generationData: GenerationTrendItem[] = [
	{ month: "Sep", image: 180, video: 80, human: 40 },
	{ month: "Oct", image: 240, video: 110, human: 65 },
	{ month: "Nov", image: 195, video: 95, human: 50 },
	{ month: "Dec", image: 310, video: 140, human: 90 },
	{ month: "Jan", image: 245, video: 120, human: 78 },
	{ month: "Feb", image: 485, video: 210, human: 132 },
];

export const typeDistributionBase: TypeDistributionItem[] = [
	{ name: "Image", value: 450 },
	{ name: "Video", value: 250 },
	{ name: "OmniHuman", value: 180 },
	{ name: "DreamActor", value: 120 },
];
