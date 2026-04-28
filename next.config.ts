import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  experimental: {
    proxyClientMaxBodySize: 200 * 1024 * 1024,
  },
};

export default nextConfig;
