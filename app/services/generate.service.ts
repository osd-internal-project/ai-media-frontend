import { AxiosInstance } from "axios";
import type { ITFromGenerate } from "../common";

const GenerateServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/generate";
  return {
    getCreditPreSend: async (message: any) => {
      return await axiosInstance
        .post(`${baseUrl}/get-credit-pre-send`, { body: message })
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

export default GenerateServices;
