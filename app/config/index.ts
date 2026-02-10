import { getEnv } from "../lib/env";

const config = {
  backendCoreUrl: getEnv("NEXT_PUBLIC_API_BASE_URL_CORE"),
  // backendCoreSse: getEnv("NEXT_PUBLIC_API_BASE_URL_SSE"),
  backendReportUrl: getEnv("NEXT_PUBLIC_API_BASE_URL_REPORT"),
  backendWorkerUrl: getEnv("NEXT_PUBLIC_API_BASE_URL_WORKER"),
  backendAuthUrl: getEnv("AUTH_BACKEND_URL"),
  backendUserUrl: getEnv("NEXT_PUBLIC_API_BASE_URL_USER"),
  nextauthUrl: getEnv("NEXTAUTH_URL"),
  version: getEnv("NEXT_PUBLIC_VERSION"),
  backendWebHookUrl: getEnv("NEXT_PUBLIC_API_BASE_URL_WEB_HOOK"),
};

export default config;
