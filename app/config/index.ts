const config = {
  backendCoreUrl: process.env.NEXT_PUBLIC_API_BASE_URL_CORE,
  // backendCoreSse: getEnv("NEXT_PUBLIC_API_BASE_URL_SSE"),
  backendReportUrl: process.env.NEXT_PUBLIC_API_BASE_URL_REPORT,
  backendWorkerUrl: process.env.NEXT_PUBLIC_API_BASE_URL_WORKER,
  backendAuthUrl: process.env.AUTH_BACKEND_URL,
  backendUserUrl: process.env.NEXT_PUBLIC_API_BASE_URL_USER,
  nextauthUrl: process.env.NEXTAUTH_URL,
  version: process.env.NEXT_PUBLIC_VERSION,
  backendWebHookUrl: process.env.NEXT_PUBLIC_API_BASE_URL_WEB_HOOK,
  backendChatAssistantUrl: process.env.NEXT_PUBLIC_API_BASE_URL_CHAT_ASSISTANT,
  // "presign" = presign → PUT → confirm (env ที่ TOS เรียก callback เข้ามาไม่ได้ เช่น SIT)
  // อื่น ๆ = PostObject + upload callback
  uploadMode: (process.env.NEXT_PUBLIC_UPLOAD_MODE === "presign"
    ? "presign"
    : "post") as "presign" | "post",
};

export default config;
