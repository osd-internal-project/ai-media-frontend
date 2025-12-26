import { AxiosInstance } from "axios";
import { IOrganizationMember } from "../common/organization-member.type";

const OrganizationMembersServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/organization-members";

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
    findById: async (id: number) => {
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
    findByOrganization: async (organizationId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findUserMemberByOrganization: async (
      organizationId: string,
      token: string
    ): Promise<IOrganizationMember> => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}/user`, {
          params: { token },
        })
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
    update: async (id: number, value: any) => {
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
    del: async (id: number) => {
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

export default OrganizationMembersServices;
