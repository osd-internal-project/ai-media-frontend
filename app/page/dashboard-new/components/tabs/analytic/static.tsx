import dayjs from "dayjs";
import type { DashboardUserRow } from "../types";
import type { IProject } from "@/app/common/project.type";

type SummaryProject = {
	id: string;
	name: string;
	usedImage?: number;
	usedCredit?: number;
};

const monthWeights = [0.12, 0.14, 0.15, 0.17, 0.18, 0.24];

export type MonthlyGenerationItem = {
	month: string;
	image: number;
	video: number;
	human: number;
};

export type ProjectUsageItem = {
	name: string;
	image: number;
	limit: number;
};

export type AnalyticsMetricCard = {
	label: string;
	value: string;
	change: string;
	key: "image" | "video" | "human" | "dream";
};

export const mockAnalyticsUsers: DashboardUserRow[] = [
	{
		userId: "m1",
		fullname: "Taylor Chen",
		role: "USER",
		usedCredit: 210,
		usedImage: 138,
		limitCredit: 320,
		limitImage: 180,
	},
	{
		userId: "m2",
		fullname: "Morgan Davis",
		role: "ADMIN",
		usedCredit: 184,
		usedImage: 126,
		limitCredit: 300,
		limitImage: 170,
	},
	{
		userId: "m3",
		fullname: "Jordan Miller",
		role: "USER",
		usedCredit: 156,
		usedImage: 104,
		limitCredit: 260,
		limitImage: 160,
	},
	{
		userId: "m4",
		fullname: "Rin Sato",
		role: "USER",
		usedCredit: 124,
		usedImage: 92,
		limitCredit: 220,
		limitImage: 150,
	},
	{
		userId: "m5",
		fullname: "Alex Rivera",
		role: "VIEWER",
		usedCredit: 98,
		usedImage: 80,
		limitCredit: 200,
		limitImage: 140,
	},
];

export const mockMonthlyGenerationData: MonthlyGenerationItem[] = [
	{ month: "Sep", image: 180, video: 80, human: 40 },
	{ month: "Oct", image: 240, video: 110, human: 65 },
	{ month: "Nov", image: 195, video: 95, human: 50 },
	{ month: "Dec", image: 310, video: 140, human: 90 },
	{ month: "Jan", image: 245, video: 120, human: 78 },
	{ month: "Feb", image: 485, video: 210, human: 132 },
];

export const mockProjectUsageData: ProjectUsageItem[] = [
	{ name: "OSD Team", image: 148, limit: 220 },
	{ name: "Demo_KTC", image: 136, limit: 200 },
	{ name: "Campaign Lab", image: 118, limit: 180 },
	{ name: "Brand Studio", image: 105, limit: 170 },
	{ name: "Motion RnD", image: 92, limit: 150 },
];

export const mockAnalyticsMetricCards: AnalyticsMetricCard[] = [
	{ key: "image", label: "Images Generated", value: "450", change: "+12%" },
	{ key: "video", label: "Videos Generated", value: "250", change: "+8%" },
	{ key: "human", label: "OmniHuman", value: "180", change: "+22%" },
	{ key: "dream", label: "DreamActor", value: "120", change: "+5%" },
];

export function buildMonthlyGenerationData(
	userRows: DashboardUserRow[],
): MonthlyGenerationItem[] {
	const totalImage = userRows.reduce((sum, user) => sum + user.usedImage, 0);
	const totalVideo = userRows.reduce((sum, user) => sum + user.usedCredit, 0);
	const totalHuman = Math.round(totalVideo * 0.45);

	return monthWeights.map((weight, index) => {
		const month = dayjs().subtract(monthWeights.length - 1 - index, "month").format("MMM");
		return {
			month,
			image: Math.max(0, Math.round(totalImage * weight)),
			video: Math.max(0, Math.round(totalVideo * weight)),
			human: Math.max(0, Math.round(totalHuman * weight)),
		};
	});
}

export function buildProjectUsageData(projects: IProject[]): ProjectUsageItem[] {
	return projects
		.slice()
		.sort((a, b) => Number(b.usedImageAllowance || 0) - Number(a.usedImageAllowance || 0))
		.slice(0, 6)
		.map((project) => ({
			name:
				project.name.length > 14
					? `${project.name.slice(0, 14)}...`
					: project.name,
			image: Number(project.usedImageAllowance || 0),
			limit: Math.max(Number(project.limitImageAllowance || 0), 1),
		}));
}

export function buildTopGeneratorsData(userRows: DashboardUserRow[]) {
	return userRows
		.slice()
		.sort((a, b) => b.usedImage - a.usedImage)
		.slice(0, 5);
}

export function buildAnalyticsMetricCards(
	userRows: DashboardUserRow[],
	_summaryByProject: SummaryProject[],
): AnalyticsMetricCard[] {
	const totalImage = userRows.reduce((sum, user) => sum + user.usedImage, 0);
	const totalVideo = userRows.reduce((sum, user) => sum + user.usedCredit, 0);
	const omniHuman = Math.round(totalVideo * 0.45);
	const dreamActor = Math.round(totalImage * 0.3);

	return [
		{
			key: "image",
			label: "Images Generated",
			value: totalImage.toLocaleString(),
			change: "+12%",
		},
		{
			key: "video",
			label: "Videos Generated",
			value: totalVideo.toLocaleString(),
			change: "+8%",
		},
		{
			key: "human",
			label: "OmniHuman",
			value: omniHuman.toLocaleString(),
			change: "+22%",
		},
		{
			key: "dream",
			label: "DreamActor",
			value: dreamActor.toLocaleString(),
			change: "+5%",
		},
	];
}
