import { AxiosInstance } from "axios";
import type { TRoles } from "../common/roles.type";

const RoleServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/roles";
  return {
    findAll: async (): Promise<TRoles[]> => {
      return await axiosInstance
        .get(`${baseUrl}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    create: async (value: TRoles) => {
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
    update: async (
      roleId: string,
      value: {
        id: number;
        name: string;
        description: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
      }
    ) => {
      return await axiosInstance
        .patch(`${baseUrl}/${roleId}`, { body: value })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findById: async (roleId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${roleId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    del: async (roleId: string) => {
      return await axiosInstance
        .delete(`${baseUrl}/${roleId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
  };
};

export default RoleServices;
