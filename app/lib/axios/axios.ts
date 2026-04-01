import config from "@/app/config";
import axios from "axios";

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