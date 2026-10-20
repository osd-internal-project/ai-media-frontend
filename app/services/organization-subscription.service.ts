import { AxiosInstance } from "axios";
import {
  IOrganizationSubscription,
  SubscriptionCancelMode,
} from "../common/organization.type";

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
    /** Super admin: extend one cycle; a lapsed subscription restarts today with full credit. */
    adminRenew: async (organizationId: string): Promise<IOrganizationSubscription> => {
      return await axiosInstance
        .post(`${baseUrl}/admin/renew/${organizationId}`)
        .then((res) => res.data);
    },
    /** Super admin: switch package now — plan, credit and seats change immediately. */
    adminChange: async (
      organizationId: string,
      priceId: string,
    ): Promise<IOrganizationSubscription> => {
      return await axiosInstance
        .post(`${baseUrl}/admin/change/${organizationId}`, { priceId })
        .then((res) => res.data);
    },
    adminCancel: async (
      organizationId: string,
      mode: SubscriptionCancelMode,
    ): Promise<IOrganizationSubscription> => {
      return await axiosInstance
        .post(`${baseUrl}/admin/cancel/${organizationId}`, { mode })
        .then((res) => res.data);
    },
    adminResume: async (organizationId: string): Promise<IOrganizationSubscription> => {
      return await axiosInstance
        .post(`${baseUrl}/admin/resume/${organizationId}`)
        .then((res) => res.data);
    },
  };
};

export default OrganizationSubscriptionServices;
