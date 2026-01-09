export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type ProjectRole = 'ADMIN' | 'USER' | 'VIEWER';

export const checkRole = (
  allowedRoles: (OrganizationRole | ProjectRole | string)[],
  userRole: OrganizationRole | ProjectRole | string | undefined | null
): boolean => {
  if (!userRole) return false;

  return allowedRoles.includes(userRole as any);
};

export const organizationPermissions = {
  createProjects: ['OWNER', 'ADMIN'] as OrganizationRole[],
  manageMembers: ['OWNER', 'ADMIN'] as OrganizationRole[],
  manageOrganization: ['OWNER'] as OrganizationRole[],
  viewProjects: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as OrganizationRole[],
  viewDashboard: ['OWNER'] as OrganizationRole[],
  viewTemplates: ['OWNER', 'ADMIN', 'MEMBER'] as OrganizationRole[],
  manageTemplates: ['OWNER', 'ADMIN'] as OrganizationRole[],
};

export const projectPermissions = {
  manageProject: ['OWNER', 'ADMIN'] as ProjectRole[],
  useChat: ['OWNER', 'ADMIN', 'USER'] as ProjectRole[],
  editContent: ['OWNER', 'ADMIN', 'USER'] as ProjectRole[],
  viewOnly: ['VIEWER'] as ProjectRole[],
  viewAll: ['OWNER', 'ADMIN', 'USER', 'VIEWER'] as ProjectRole[],
};

export const canCreateProjects = (organizationRole: string) =>
  checkRole(organizationPermissions.createProjects, organizationRole);

export const canManageMembers = (organizationRole: string) =>
  checkRole(organizationPermissions.manageMembers, organizationRole);

export const canUseChat = (projectRole: string) =>
  checkRole(projectPermissions.useChat, projectRole);

export const canManageProject = (projectRole: string) =>
  checkRole(projectPermissions.manageProject, projectRole);

export const canEditContent = (projectRole: string) =>
  checkRole(projectPermissions.editContent, projectRole);

export const canViewDashboard = (organizationRole: string) =>
  checkRole(organizationPermissions.viewDashboard, organizationRole);

export const canViewTemplates = (organizationRole: string) =>
  checkRole(organizationPermissions.viewTemplates, organizationRole);

export const canManageTemplates = (organizationRole: string) =>
  checkRole(organizationPermissions.manageTemplates, organizationRole);