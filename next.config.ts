import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // 纯静态导出：构建产物在 out/，由 Nginx 或任意静态文件服务器托管
  output: "export",
};

export default nextConfig;
