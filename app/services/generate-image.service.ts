import { AxiosInstance } from "axios";
import type { ITFromGenerate } from "../common";

const GenerateImageServices = (axiosInstance: AxiosInstance) => {
    const baseUrl = "/generate-image";
    return {
        findAll: async () => {
            return await axiosInstance
                .get(`${baseUrl}`)
                .then((res) => {
                    return res.data;
                })
                .catch((err) => {
                    console.log(err);
                    return;
                });
        },
        create: async (value: ITFromGenerate) => {
            return await axiosInstance
                .post(`${baseUrl}`, { body: value })
                .then((res) => {
                    return res.data;
                })
                .catch((err) => {
                    console.log(err);
                    return;
                });
        },

        findById: async (id: string) => {
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

        upload: async (formData: any) => {
            return await axiosInstance
                .post(`${baseUrl}/upload-images`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((result) => result.data)
                .catch((err) => err);
        },
    };

}

export default GenerateImageServices;