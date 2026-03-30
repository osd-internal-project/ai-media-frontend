export interface ICouponCode {
  id: string;
  code: string;
  expiresAt: string | Date;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  usageLimit: number;
  fixOrganizationId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  onTopCredit: number;
  couponCodeUsage?: ICouponCodeUsage;
}

export interface ICouponCodeUsage {
  id: string;
  organizationId?: string;
  usedAt: string | Date;
  usedById: string;
  onTopCredit: number;
  organizationName: string;
  organizationCode: string;
  usedByName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  couponCodeId: string;
  couponCode?: ICouponCode;
}

export interface IUseCouponCodeDto {
  code: string;
  organizationId: string;
  userId: string;
}
