import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      new URL("https://static.wikia.nocookie.net/gensin-impact/images/**"),
    ],
  },
};

export default nextConfig;
