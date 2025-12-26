import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProjectService from '../services/project.service';
import UserServices from '../services/users.service';
import { axiosCore, axiosUser } from '../lib/axios/axios';

export type ProjectRole = 'ADMIN' | 'USER' | 'VIEWER' | null;

export interface ProjectPermissions {
  role: ProjectRole;
  isAdmin: boolean;
  canManageProject: boolean;
  canUseChat: boolean;
  canViewOnly: boolean;
  canEditContent: boolean;
  loading: boolean;
  error: string | null;
}

export const useProjectPermissions = (projectId: string) => {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<ProjectPermissions>({
    role: null,
    isAdmin: false,
    canManageProject: false,
    canUseChat: false,
    canViewOnly: false,
    canEditContent: false,
    loading: true,
    error: null,
  });

  const projectService = ProjectService(axiosCore);
  const userService = UserServices(axiosUser);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session?.user?.id || !projectId) {
        setPermissions(prev => ({
          ...prev,
          loading: false,
          error: 'Missing user session or project ID'
        }));
        return;
      }

      try {
        setPermissions(prev => ({ ...prev, loading: true, error: null }));

        const userDetails = await userService.findDetailByToken(session.user.id);
        const actualUserId = userDetails?.userId || session.user.id;

        const userRole = await projectService.checkUserRole(projectId, actualUserId);
        const isAdmin = await projectService.isProjectAdmin(projectId, actualUserId);

        const canManageProject = userRole === 'ADMIN';
        const canUseChat = userRole === 'ADMIN' || userRole === 'USER';
        const canViewOnly = userRole === 'VIEWER';
        const canEditContent = userRole === 'ADMIN' || userRole === 'USER';

        setPermissions({
          role: userRole as ProjectRole,
          isAdmin,
          canManageProject,
          canUseChat,
          canViewOnly,
          canEditContent,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setPermissions(prev => ({
          ...prev,
          loading: false,
          error: `Failed to load permissions: ${error?.message || 'Unknown error'}`
        }));
      }
    };

    fetchPermissions();
  }, [projectId, session?.user?.id]);

  const refetch = () => {
    if (session?.user?.id && projectId) {
      setPermissions(prev => ({ ...prev, loading: true }));
    }
  };

  return {
    ...permissions,
    refetch,
  };
};

interface ProjectPermissionGuardProps {
  children: React.ReactNode;
  projectId: string;
  requiredPermission: keyof Omit<ProjectPermissions, 'role' | 'loading' | 'error'>;
  fallback?: React.ReactNode;
}

export const ProjectPermissionGuard = ({ 
  children, 
  projectId, 
  requiredPermission, 
  fallback = null 
}: ProjectPermissionGuardProps) => {
  const permissions = useProjectPermissions(projectId);

  if (permissions.loading) {
    return <div>Loading permissions...</div>;
  }

  if (permissions.error) {
    return <div>Error: {permissions.error}</div>;
  }

  if (!permissions[requiredPermission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};