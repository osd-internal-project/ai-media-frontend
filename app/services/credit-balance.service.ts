import { AxiosInstance } from "axios";
import { ICreditBalance } from "../common/organization.type";

const CreditBalanceServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/credit-balance";
  // console.log("axiosInstance", axiosInstance);
  return {
    findById: async (id: string): Promise<ICreditBalance | undefined> => {
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
    findByOrganizationId: async (
      organizationId: string,
    ): Promise<ICreditBalance | undefined> => {
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
    updateExtraCoin: async (
      organizationId: string,
      data: { onTopBalance?: number; onTopImage?: number },
    ) => {
      return await axiosInstance
        .patch(`${baseUrl}/organization/${organizationId}/extra-coin`, data)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
    },
  };
};

export default CreditBalanceServices;
