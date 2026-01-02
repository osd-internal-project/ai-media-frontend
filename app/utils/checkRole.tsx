import { IOrganizationRole, IProjectRole } from "../common";

export const checkRole = (
  roles: (IOrganizationRole | IProjectRole | string)[],
  userRole: IOrganizationRole | IProjectRole | string | undefined | null
) => {
  if (!userRole) return false;
  
  if (userRole === 'ADMIN') return true;
  
  return roles.includes(userRole as any);
};
