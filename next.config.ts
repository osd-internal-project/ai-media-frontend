const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    AUTH_SECRET_KEY: "n5yaP7ynm0Qf/JhIJVLXmfQH0zr+YgKwk0TdWo9EFwo=",
    VERSION: "2.0.0",
    // dev
    AUTH_BACKEND_URL: "http://localhost:4000/api",
    NEXT_PUBLIC_API_BASE_URL_CORE: "http://localhost:4002/api",
    NEXTAUTH_URL: "http://localhost:3000",
    KEYCLOAK_CLIENT_ID: "eportal-client-id",
    KEYCLOAK_CLIENT_SECRET: "kovdYL3AAs9v6e3zxNw4o3CbaBwZiCId",
    KEYCLOAK_ISSUER: "http://192.168.31.181:9000/realms/eportal",
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
  images: {
    unoptimized: true,
  },
};
module.exports = nextConfig;
