import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Type safety is enforced via `npm run typecheck` (tsc --noEmit) in CI;
  // skipping the duplicate pass here keeps builds fast.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
    {
      source: "/manifest.json",
      headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
    },
  ],
};

export default nextConfig;
