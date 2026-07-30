import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["irpintennis.com", "www.irpintennis.com"],
    },
  },
};

export default nextConfig;
