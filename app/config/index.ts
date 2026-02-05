const config = {
  backendCoreUrl: process.env.NEXT_PUBLIC_API_BASE_URL_CORE,
  // backendCoreSse: process.env.NEXT_PUBLIC_API_BASE_URL_SSE,
  backendReportUrl: process.env.NEXT_PUBLIC_API_BASE_URL_REPORT,
  backendWorkerUrl: process.env.NEXT_PUBLIC_API_BASE_URL_WORKER,
  backendUserUrl: process.env.AUTH_BACKEND_URL,
  nextauthUrl: process.env.NEXTAUTH_URL,
  version: process.env.NEXT_PUBLIC_VERSION,
  backendWebHookUrl: process.env.NEXT_PUBLIC_API_BASE_URL_WEB_HOOC,
};

export default config;
