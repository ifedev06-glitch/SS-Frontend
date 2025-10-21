import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 👇 This disables ESLint checks during the production build
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*", // frontend path
        destination: "http://localhost:8085", // backend URL (use env var in production!)
      },
    ];
  },
};

export default nextConfig;
