import { AxiosInstance } from "axios";
import { IOrganization, IOrganizationInvitation } from "../common/organization.type";

const OrganizationServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/organization";

  return {
    findAll: async (search: { searchText?: string; type?: string }) => {
      return await axiosInstance
        .get(`${baseUrl}`, { params: search })
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
      search: { type?: string },
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
    findAccessCodeByOrganizationId: async (organizationId: string): Promise<string[]> => {
      return await axiosInstance
        .get(`${baseUrl}/access-code/${organizationId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
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
    createBySystemAdmin: async (value: any) => {
      return await axiosInstance
        .post(`${baseUrl}/system-admin`, value)
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
    invitationDetail: async (token: string) => {
      return await axiosInstance
        .get(`${baseUrl}/invitation/${token}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    acceptInvitation: async (value: {
      token: string;
      username: string;
      password: string;
      fullname: string;
      phoneNumber: string;
    }) => {
      return await axiosInstance
        .post(`${baseUrl}/invitation/accept`, value)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
    },
    invite: async (value: {
      email: string;
      organizationId: string;
      role: string;
    }) => {
      return await axiosInstance
        .post(`${baseUrl}/invitation`, value)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
    },
    findInvitationsByOrganization: async (organizationId: string): Promise<IOrganizationInvitation[]> => {
      return await axiosInstance
        .get(`${baseUrl}/invitation/organization/${organizationId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    cancelInvitation: async (id: string): Promise<void> => {
      return await axiosInstance
        .delete(`${baseUrl}/invitation/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        });
    },
  };
};

export default OrganizationServices;
