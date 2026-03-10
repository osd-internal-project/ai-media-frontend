import { AxiosInstance } from "axios";
import type { IProject } from "../common/project.type";
import { JsonObject } from "next-auth/adapters";

const ProjectService = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/project";
  return {
    findAll: async (token: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${token}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findByOrganizationId: async (
      organizationId: string,
      token: string,
      searchValue: JsonObject,
    ) => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}`, {
          params: { token, ...searchValue },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    create: async (value: IProject) => {
      return await axiosInstance
        .post(`${baseUrl}`, { body: value })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    update: async (id: string, value: Partial<IProject>) => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, value)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    deleteProject: async (id: string) => {
      return await axiosInstance
        .delete(`${baseUrl}/${id}/remove`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findById: async (id: string) => {
      return await axiosInstance
        .get(`${baseUrl}/manage/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },

    findOneUserId: async (id: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },

    upload: async (formData: any) => {
      return await axiosInstance
        .post(`${baseUrl}/upload-images`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => result.data)
        .catch((err) => err);
    },

    // Role-based permission methods
    checkUserRole: async (projectId: string, userId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}/role/${userId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return null;
        });
    },

    isProjectAdmin: async (projectId: string, userId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}/admin/${userId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return false;
        });
    },

    getProjectMembers: async (projectId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}/members`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    hasProjectPermission: async (
      projectId: string,
      userId: string,
      requiredRole: string = "USER",
    ) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}/permission/${userId}`, {
          params: { requiredRole },
        })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return false;
        });
    },
  };
};

export default ProjectService;
