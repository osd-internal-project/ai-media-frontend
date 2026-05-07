const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // env: {
  //   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  //   VERSION: process.env.VERSION,
  //   AUTH_BACKEND_URL: process.env.AUTH_BACKEND_URL,
  //   NEXT_PUBLIC_API_BASE_URL_USER: process.env.NEXT_PUBLIC_API_BASE_URL_USER,
  //   NEXT_PUBLIC_API_BASE_URL_REPORT: process.env.NEXT_PUBLIC_API_BASE_URL_REPORT,
  //   NEXT_PUBLIC_API_BASE_URL_CORE: process.env.NEXT_PUBLIC_API_BASE_URL_CORE,
  //   NEXT_PUBLIC_API_BASE_URL_WORKER: process.env.NEXT_PUBLIC_API_BASE_URL_WORKER,
  //   NEXT_PUBLIC_API_BASE_URL_WEB_HOOK: process.env.NEXT_PUBLIC_API_BASE_URL_WEB_HOOK,
  //   NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  //   NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
  //   KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
  //   KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET,
  //   KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
  //   AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  // },
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
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; img-src 'self' data: blob: https:;",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
