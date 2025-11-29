import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 构建时忽略 TypeScript 类型检查错误
    ignoreBuildErrors: true,
  },
};

export default nextConfig;