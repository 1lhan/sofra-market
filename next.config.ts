import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactStrictMode: false,
  experimental: {
    swcPlugins: [["@preact-signals/safe-react/swc", { mode: "auto" }]]
  }
}

export default nextConfig