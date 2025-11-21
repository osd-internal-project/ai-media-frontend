import type { TRoles } from "./roles.type";
import type { TUser } from "./user.type";

export interface TGroup {
  id: number;
  groupId: string;
  displayName: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  roles: TRoles[];
  users: TUser[];
}
export interface TGroupWithUsersAndRoles {
  id: number;
  groupId: string;
  displayName: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  roles: { role: TRoles }[];
  users: { users: TUser }[];
}
export interface TGroupForm {
  id: number;
  groupId: string;
  displayName: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  users: string[];
}