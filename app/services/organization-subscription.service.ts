import { AxiosInstance } from "axios";
import { IOrganizationSubscription } from "../common/organization.type";

const OrganizationSubscriptionServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/organization-subscription";

  return {
    findById: async (id: string): Promise<IOrganizationSubscription | undefined> => {
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
    findByOrganizationId: async (organizationId: string): Promise<IOrganizationSubscription | undefined> => {
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
    /** Cancel at end of the current cycle (status → pending_cancel). */
    cancel: async (organizationId: string): Promise<IOrganizationSubscription> => {
      return await axiosInstance
        .post(`${baseUrl}/cancel/${organizationId}`)
        .then((res) => res.data);
    },
  };
};

export default OrganizationSubscriptionServices;
