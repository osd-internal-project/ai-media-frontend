import { FEATURES } from "../config/features";

export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER"
  | "SUPER_ADMIN";
export type ProjectRole = "ADMIN" | "USER" | "VIEWER" | "SUPER_ADMIN";

export const checkRole = (
  allowedRoles: (OrganizationRole | ProjectRole | string)[],
  userRole: OrganizationRole | ProjectRole | string | undefined | null,
): boolean => {
  if (!userRole) return false;

  return allowedRoles.includes(userRole as any);
};

export const organizationPermissions = {
   createOrganization: [] as OrganizationRole[],
  // createOrganization: ["OWNER", "SUPER_ADMIN"] as OrganizationRole[],
  createProjects: ["OWNER", "ADMIN","SUPER_ADMIN"] as OrganizationRole[],
  manageMembers: ["OWNER", "ADMIN","SUPER_ADMIN"] as OrganizationRole[],
  editOrganization: ["OWNER","SUPER_ADMIN"] as OrganizationRole[],
  viewOrganization: ["OWNER", "ADMIN","SUPER_ADMIN"] as OrganizationRole[],
  viewProjects: ["OWNER", "ADMIN", "MEMBER", "VIEWER","SUPER_ADMIN"] as OrganizationRole[],
  viewDashboard: ["OWNER", "ADMIN", "SUPER_ADMIN"] as OrganizationRole[],
  viewTemplates: ["OWNER", "ADMIN", "MEMBER", "SUPER_ADMIN"] as OrganizationRole[],
  manageTemplates: ["OWNER", "ADMIN","SUPER_ADMIN"] as OrganizationRole[],
  managePhotoEvent: ["OWNER", "ADMIN", "SUPER_ADMIN"] as OrganizationRole[],
};

/** access code ใน Organization.accessCodes ที่ super admin ติ๊กเพื่อเปิด Photo Event ให้ org */
export const PHOTO_EVENT_ACCESS_CODE = "photo_event";

/** เทียบแบบ lower/trim เหมือนหน้า project — code เก่าบางแถวมีช่องว่าง/ตัวพิมพ์ใหญ่ */
export const hasAccessCode = (
  accessCodes: string[] | undefined,
  code: string,
): boolean =>
  (accessCodes ?? []).some((c) => c.toLowerCase().trim() === code);

export const projectPermissions = {
  manageProject: ["OWNER", "ADMIN"] as ProjectRole[],
  useChat: ["OWNER", "ADMIN", "USER","SUPER_ADMIN"] as ProjectRole[],
  editContent: ["OWNER", "ADMIN", "USER","SUPER_ADMIN"] as ProjectRole[],
  viewOnly: ["VIEWER", "SUPER_ADMIN"] as ProjectRole[],
  viewAll: ["OWNER", "ADMIN", "USER", "VIEWER", "SUPER_ADMIN"] as ProjectRole[],
};

export const canCreateOrganization = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.createOrganization, organizationRole);

export const canCreateProjects = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.createProjects, organizationRole);

export const canManageMembers = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.manageMembers, organizationRole);

export const canEditOrganization = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.editOrganization, organizationRole);

export const canViewOrganization = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.viewOrganization, organizationRole);

export const canUseChat = (projectRole: string | null | undefined) =>
  checkRole(projectPermissions.useChat, projectRole);

export const canManageProject = (projectRole: string | null | undefined) =>
  checkRole(projectPermissions.manageProject, projectRole);

export const canEditContent = (projectRole: string | null | undefined) =>
  checkRole(projectPermissions.editContent, projectRole);

export const canViewDashboard = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.viewDashboard, organizationRole);

export const canViewTemplates = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.viewTemplates, organizationRole);

export const canManageTemplates = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.manageTemplates, organizationRole);

export const canManagePhotoEvent = (organizationRole: string | undefined) =>
  checkRole(organizationPermissions.managePhotoEvent, organizationRole);

/** Plans, checkout and credits stay hidden until billing ships — SUPER_ADMIN bypasses. */
export const canSeeBilling = (systemRole: string | null | undefined) =>
  FEATURES.billing || systemRole === "SUPER_ADMIN";
