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
  };
};

export default OrganizationSubscriptionServices;
