import type { AxiosInstance } from "axios";
import type { TAIModel, TAIModelResponse } from "@/app/common/ai-model.type";

const AIModelServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/ai-models";

  return {
    findAll: async (): Promise<TAIModel[]> => {
      try {
        const response = await axiosInstance.get<TAIModelResponse>(baseUrl);
        return response.data.data || [];
      } catch (error) {
        console.error("Error fetching AI models:", error);
        return [];
      }
    },

    findByType: async (type: string): Promise<TAIModel[]> => {
      try {
        const response = await axiosInstance.get<TAIModelResponse>(`${baseUrl}?type=${type}`);
        return response.data.data || [];
      } catch (error) {
        console.error("Error fetching AI models by type:", error);
        return [];
      }
    },

    findById: async (id: number): Promise<TAIModel | null> => {
      try {
        const response = await axiosInstance.get<{ data: TAIModel }>(`${baseUrl}/${id}`);
        return response.data.data;
      } catch (error) {
        console.error("Error fetching AI model by ID:", error);
        return null;
      }
    },
  };
};

export default AIModelServices;