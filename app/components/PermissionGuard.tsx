import React from 'react';
import { checkRole } from '../utils/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  roles: string[];
  userRole: string | undefined | null;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({ 
  children, 
  roles, 
  userRole, 
  fallback = null 
}: PermissionGuardProps) => {
  const hasPermission = checkRole(roles, userRole);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};