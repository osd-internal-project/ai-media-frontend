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
};

export const projectPermissions = {
  manageProject: ['ADMIN'] as ProjectRole[],
  useChat: ['ADMIN', 'USER'] as ProjectRole[],
  editContent: ['ADMIN', 'USER'] as ProjectRole[],
  viewOnly: ['VIEWER'] as ProjectRole[],
  viewAll: ['ADMIN', 'USER', 'VIEWER'] as ProjectRole[],
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