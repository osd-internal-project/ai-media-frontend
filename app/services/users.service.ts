import { AxiosInstance } from "axios";
import type { TRoles } from "../common/roles.type";
import type { TUser } from "../common/user.type";

const UserServices = (axiosInstance: AxiosInstance) => {
  const baseUsersUrl = "/users";
  const baseUserGroupUrl = "/user-groups";

  return {
    findAll: async (): Promise<TUser[]> => {
      return await axiosInstance
        .get(`${baseUsersUrl}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findBySearch: async (search?: string) => {
      return await axiosInstance
        .get(`${baseUsersUrl}/search`, { params: { search } })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    summary: async () => {
      return await axiosInstance
        .get(`${baseUsersUrl}/summary`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    create: async (value: any) => {
      return await axiosInstance
        .post(`${baseUsersUrl}`, { body: value })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
    },
    update: async (userId: string, value: any) => {
      return await axiosInstance
        .patch(`${baseUsersUrl}/${userId}`, { body: value })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findById: async (userId: string) => {
      return await axiosInstance
        .get(`${baseUsersUrl}/${userId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    del: async (userId: string) => {
      return await axiosInstance
        .delete(`${baseUsersUrl}/${userId}`)
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

export default UserServices;
