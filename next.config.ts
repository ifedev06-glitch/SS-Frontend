// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',                     // frontend path
        destination: 'http://localhost:8090/:path*', // backend URL
      },
    ];
  },
};

export default nextConfig;

