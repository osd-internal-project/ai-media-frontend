import { AxiosInstance } from "axios";

const AuthService = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/auth";
  return {
    validate: async (token: string) => {
      return await axiosInstance
        .post(`${baseUrl}/validate`, { token })
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

export default AuthService;
