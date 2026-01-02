import { AxiosInstance } from "axios";
import { IOrganization } from "../common/organization.type";

const OrganizationServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/organization";

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
    findManyByUserId: async (
      userId: string,
      search: { type: string }
    ): Promise<IOrganization[]> => {
      return await axiosInstance
        .get(`${baseUrl}/user/${userId}`, { params: search })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
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
    create: async (value: any) => {
      return await axiosInstance
        .post(`${baseUrl}`, value)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
    },
    createOwner: async (value: any) => {
      return await axiosInstance
        .post(`${baseUrl}/owner`, value)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
    },
    update: async (id: string, value: any) => {
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
    del: async (id: string) => {
      return await axiosInstance
        .delete(`${baseUrl}/${id}`)
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

export default OrganizationServices;
