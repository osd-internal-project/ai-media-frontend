import { IOrganizationMember } from "./organization-member.type";

export interface IOrganization {
  id: number;
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  type: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
  organizationMember?: IOrganizationMember[];
}
