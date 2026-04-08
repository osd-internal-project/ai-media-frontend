import { AxiosInstance } from "axios";
import { TMasterModelType } from "../common/master-model-type.type";

const MasterModelTypeServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/master-model-type";

  return {
    findAll: async (): Promise<TMasterModelType[]> => {
      const { data } = await axiosInstance.get(baseUrl);
      return data;
    },
    findOne: async (id: number): Promise<TMasterModelType> => {
      const { data } = await axiosInstance.get(`${baseUrl}/${id}`);
      return data;
    },
    create: async (payload: any): Promise<TMasterModelType> => {
      const { data } = await axiosInstance.post(baseUrl, payload);
      return data;
    },
    update: async (id: number, payload: any): Promise<TMasterModelType> => {
      const { data } = await axiosInstance.patch(`${baseUrl}/${id}`, payload);
      return data;
    },
    delete: async (id: number): Promise<void> => {
      await axiosInstance.delete(`${baseUrl}/${id}`);
    },
  };
};

export default MasterModelTypeServices;
