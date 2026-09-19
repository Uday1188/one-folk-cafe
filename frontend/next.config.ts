import type { NextConfig } from "next";
import path from "path";

const isStandalone = !process.env.VERCEL && process.env.STANDALONE_BUILD === 'true';

const nextConfig: NextConfig = {
  ...(isStandalone
    ? {
        output: 'standalone',
        outputFileTracingRoot: path.resolve(__dirname),
      }
    : {}),
};

export default nextConfig;

