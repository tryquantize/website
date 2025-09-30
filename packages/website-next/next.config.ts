import type { NextConfig } from "next";
import path from "path";

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
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    externalDir: true, // Allow imports from parent directory
  },
  transpilePackages: ['@shared'],
  webpack: (config) => {
    // Allow webpack to resolve the shared directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../shared'),
    };
    return config;
  },
};

export default nextConfig;
