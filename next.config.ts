import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
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
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Convex uses WebSockets for real-time communication
              // In dev, the local Convex server runs on ws://127.0.0.1:*
              isDev
                ? `connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:* https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com`
                : `connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com`,
              // GTM is loaded dynamically after consent — the external script origin must be whitelisted
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline'",
              // Convex storage URLs serve user-uploaded images (e.g. bike/profile photos)
              // Depending on deployment/runtime these can resolve on convex.cloud or convex.site.
              // Strava CDN serves athlete profile images (dgalywyr863hv.cloudfront.net).
              // Google profile photos are served from lh3.googleusercontent.com.
              "img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://*.cloudfront.net https://lh3.googleusercontent.com",
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
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
