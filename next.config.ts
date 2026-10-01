import { config as loadEnvFile } from "dotenv";
import { resolve } from "path";
import type { NextConfig } from "next";

// .env.local must win over stale shell env (e.g. NEXT_PUBLIC_APP_URL=localhost:3000).
loadEnvFile({ path: resolve(process.cwd(), ".env.local"), override: true });

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
