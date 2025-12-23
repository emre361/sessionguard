import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export' satırını kaldırdık çünkü dinamik site istiyoruz
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;