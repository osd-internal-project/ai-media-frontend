import type { Dayjs } from "dayjs";
import type { TGroup } from "./groups.type";

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
  password?: string;
  groups?: { group: TGroup }[];
};
export type TUserForm = {
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
  password?: string;
  groups?: string[];
};
