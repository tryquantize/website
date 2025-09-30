import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:5002',
  },
};

export default nextConfig;
