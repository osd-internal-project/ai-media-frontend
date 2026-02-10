import { AxiosInstance } from "axios";

const ChatServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/chat";
  return {

    message: async (
      projectId: string,
      skip?: number,
      take?: number
    ) => {
      const params: any = {};
      if (skip !== undefined) params.skip = skip;
      if (take !== undefined) params.take = take;
      return await axiosInstance
        .get(`${baseUrl}/message/${projectId}`, { params })
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

export default ChatServices;
