import config from "@/app/config";
import axios from "axios";

export const axiosUser = axios.create({
    baseURL: config.backendUserUrl,
    headers: { "Content-Type": "application/json" },
});

export const axiosIntranet = axios.create({
    baseURL: config.backendCoreUrl,
    headers: { "Content-Type": "application/json" },
});
