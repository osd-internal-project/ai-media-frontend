import type { Dayjs } from "dayjs";

export type TUser = {
  id: number;
  userId: string;
  username: string;
  fullname: string;
  description: string;
  userGroup: [];
  createdAt: string;
  status: string;
  createTime: Dayjs | string;
  maxToken: number;
  maxImages: number;
  tier: string;
  email: string;
  phoneNumber: string;
};
