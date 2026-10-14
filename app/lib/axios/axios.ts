import config from "@/app/config";
import axios, { AxiosInstance } from "axios";
import {
  clearAccessToken,
  getAccessToken,
  redirectToLogin,
} from "./access-token";

export const axiosUser = axios.create({
  baseURL: config.backendUserUrl,
  headers: { "Content-Type": "application/json" },
});

export const axiosCore = axios.create({
  baseURL: config.backendCoreUrl,
  headers: { "Content-Type": "application/json" },
});

export const axiosReport = axios.create({
  baseURL: config.backendReportUrl,
  headers: { "Content-Type": "application/json" },
});

export const axiosWorker = axios.create({
  baseURL: config.backendWorkerUrl,
  headers: { "Content-Type": "multipart/form-data" },
});

export const axiosChatAssistant = axios.create({
  baseURL: config.backendChatAssistantUrl,
  headers: { "Content-Type": "application/json" },
});

/** แนบ Keycloak token ทุก request — backend ตรวจด้วย KeycloakAuthGuard (AUTH_MODE) */
const withAuth = (instance: AxiosInstance) => {
  instance.interceptors.request.use(async (request) => {
    const token = await getAccessToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  });
  instance.interceptors.response.use(undefined, (error) => {
    // 401 = token หมด/ไม่ถูกต้อง (AUTH_MODE=enforce) — 403 เป็นเรื่องสิทธิ์ ไม่ต้อง login ใหม่
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken();
      redirectToLogin();
    }
    return Promise.reject(error);
  });
};

[axiosUser, axiosCore, axiosReport, axiosWorker, axiosChatAssistant].forEach(
  withAuth,
);
