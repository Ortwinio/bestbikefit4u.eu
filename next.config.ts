import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Keep the repository's maintained agent instructions unchanged by dev startup.
  agentRules: false,
  poweredByHeader: false,
  htmlLimitedBots: /.*/,
  outputFileTracingIncludes: {
    "/api/reports/*/pdf": [
      "./public/brand/report/**/*",
      "./public/illustrations/04-bandenspanning.webp",
      "./public/illustrations/06-meetset.webp",
      "./public/illustrations/08-stack-en-reach.webp",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/api/storage/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  widenClientFileUpload: false,
  sourcemaps: { disable: true },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
