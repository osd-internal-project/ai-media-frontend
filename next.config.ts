const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXTAUTH_SECRET: "n5yaP7ynm0Qf/JhIJVLXmfQH0zr+YgKwk0TdWo9EFwo=",
    VERSION: "2.0.0",
    AUTH_BACKEND_URL: "https://www.aicave.ai/public/api/v1/user",
    NEXT_PUBLIC_API_BASE_URL_REPORT:
      "https://www.aicave.ai/public/api/v1/report",
    NEXT_PUBLIC_API_BASE_URL_CORE: "https://www.aicave.ai/public/api/v1/core",
    NEXT_PUBLIC_API_BASE_URL_SSE: "http://192.168.31.181:8971/api",
    // NEXTAUTH_URL: "https://www.aicave.ai",
    NEXTAUTH_URL: "http://localhost:3000",
    KEYCLOAK_CLIENT_ID: "eportal-client-id",
    KEYCLOAK_CLIENT_SECRET: "kovdYL3AAs9v6e3zxNw4o3CbaBwZiCId",
    KEYCLOAK_ISSUER: "https://id24.aicave.ai/realms/eportal",
    AUTH_TRUST_HOST: true,
  },
  webpack: (config: any) => {
    config.externals = [...config.externals, "jsdom"];
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });
    return config;
  },
  reactStrictMode: false,
  output: "standalone",
};

// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   env: {
//     NEXTAUTH_SECRET: "n5yaP7ynm0Qf/JhIJVLXmfQH0zr+YgKwk0TdWo9EFwo=",
//     VERSION: "2.0.0",
//     AUTH_BACKEND_URL: "http://localhost:4000/api",
//     NEXT_PUBLIC_API_BASE_URL_REPORT: "http://localhost:4001/api",
//     NEXT_PUBLIC_API_BASE_URL_CORE: "http://localhost:4002/api",
//     NEXTAUTH_URL: "http://localhost:3000",
//     KEYCLOAK_CLIENT_ID: "eportal-client-id",
//     KEYCLOAK_CLIENT_SECRET: "kovdYL3AAs9v6e3zxNw4o3CbaBwZiCId",
//     KEYCLOAK_ISSUER: "https://id24.aicave.ai/realms/eportal",
//   },
//   webpack: (config: any) => {
//     config.externals = [...config.externals, "jsdom"];
//     config.module.rules.push({
//       test: /\.node/,
//       use: "raw-loader",
//     });
//     return config;
//   },
//   reactStrictMode: false,
//   output: "standalone",
// };
module.exports = nextConfig;
