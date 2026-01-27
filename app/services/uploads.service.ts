import { AxiosInstance } from "axios";

const UploadsServices = (axiosInstance: AxiosInstance) => {
    return {
        upload: async (
            formData: any,
        ) => {
            return await axiosInstance
                .post(`/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((result) => result.data)
                .catch((err) => err);
        },
        remove: async (
            uid: string,
        ) => {
            return await axiosInstance
                .delete(`/upload/delete/${uid}`)
                .then((result) => result.data)
                .catch((err) => err);
        },
    };
};

export default UploadsServices;
