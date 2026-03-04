import { AxiosInstance } from "axios";
import { IPackageTransaction } from "../common/organization.type";

const PackageTransactionServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/package-transaction";

  return {
    findById: async (id: string): Promise<IPackageTransaction | undefined> => {
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
    findByOrganizationId: async (organizationId: string): Promise<IPackageTransaction[]> => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
  };
};

export default PackageTransactionServices;
