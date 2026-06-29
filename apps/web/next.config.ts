import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dayact/ui", "@dayact/database"],
};

export default nextConfig;
