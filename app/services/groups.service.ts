import { AxiosInstance } from "axios";
import type { TGroup, TGroupForm, TGroupWithUsersAndRoles } from "../common/groups.type";

const GroupsServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/groups";
  return {
    findAll: async () => {
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
    findUsersAndRolesByGroup: async (groupId: string): Promise<TGroupWithUsersAndRoles> => {
      return await axiosInstance
        .get(`${baseUrl}/relation-by-group/${groupId}`)
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
        .get(`${baseUrl}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    create: async (value: TGroup) => {
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
    update: async (groupId: string, value: Partial<TGroupForm>) => {
      return await axiosInstance
        .patch(`${baseUrl}/${groupId}`, { body: value })
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
  };
};

export default GroupsServices;
