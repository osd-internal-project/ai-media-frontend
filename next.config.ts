const nextConfig = {
  env: {
    AUTH_SECRET_KEY: "n5yaP7ynm0Qf/JhIJVLXmfQH0zr+YgKwk0TdWo9EFwo=",
    VERSION: "2.0.0",
    // dev
    BACKEND_URL: "http://localhost:4001/api",
    NEXTAUTH_URL: "http://localhost:3000",
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
