import { AxiosInstance } from "axios";

const UploadsServices = (axiosInstance: AxiosInstance) => {
  return {
    upload: async (formData: any) => {
      return await axiosInstance
        .post(`/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => result.data)
        .catch((err) => err);
    },
    remove: async (uid: string) => {
      return await axiosInstance
        .delete(`/upload/delete/${uid}`)
        .then((result) => result.data)
        .catch((err) => err);
    },
    uploadFromPrompt: async (formData: any) => {
      return await axiosInstance
        .post(`/upload/from-prompt`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => result.data)
        .catch((err) => err);
    },
    //Prompt guide Images
    uploadPromptGuideImage: async (formData: any) => {
      return await axiosInstance
        .post(`/upload/prompt-guide-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => result.data)
        .catch((err) => err);
    },
    removePromptGuideImage: async (uid: string) => {
      return await axiosInstance
        .delete(`/upload/prompt-guide-image/delete/${uid}`)
        .then((result) => result.data)
        .catch((err) => err);
    },
  };
};

export default UploadsServices;
