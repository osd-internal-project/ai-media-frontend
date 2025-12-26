import { IOrganization } from "./organization.type";

export interface IOrganizationMember {
  id: number;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: string;
  organization?: IOrganization;
}
