import { IOrganizationMember } from "./organization-member.type";

export interface IPackageTransaction {
  id: string;
  organizationId: string;
  amountPaid: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  paidAt?: string | Date;
  expiredPaymentAt?: string | Date;
  planName: string;
  planInterval: string;
  billingPeriodStart: string | Date;
  billingPeriodEnd: string | Date;
  createdAt: string | Date;
}

export interface IOrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  planName: string;
  price: number;
  interval?: string;
  creditAllowance: number;
  imageAllowance: number;
  currentPeriodStart: string | Date;
  currentPeriodEnd: string | Date;
  nextBillingDate: string | Date;
  status: string;
  period: string;
  periodCount: number;
  periodCurrent: number;
  updatedAt: string | Date;
}

export interface ICreditBalance {
  id: string;
  organizationId: string;
  holdBalance: number;
  holdImage: number;
  currentCycleBalance: number;
  currentCycleImage: number;
  onTopBalance: number;
  onTopImage: number;
  updatedAt: string | Date;
}

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
  packageTokenAmount?: number;
  packageImageAmount?: number;
  remainTokenAmount?: number;
  remainImageAmount?: number;
  maxUserAccess?: number;
  accessCodes: string[];
  //Relateion
  subscription?: IOrganizationSubscription;
  creditBalance?: ICreditBalance;
  packageTransactions?: IPackageTransaction[];
}
