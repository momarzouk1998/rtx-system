import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تصدير standalone عشان Docker يستخدم صورة صغيرة (server.js + static فقط)
  output: "standalone",
};

export default nextConfig;
