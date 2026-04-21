import { AxiosInstance } from "axios";
import { TContactSaleLog } from "../common/contact-sale-log.type";

const ContactSaleLogServices = (axiosModule: AxiosInstance) => {
  return {
    create: async (data: TContactSaleLog) => {
      const response = await axiosModule.post("/contact-sale-log", data);
      return response.data;
    },
  };
};

export default ContactSaleLogServices;
