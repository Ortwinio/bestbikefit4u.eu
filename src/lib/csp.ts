const isDev = process.env.NODE_ENV === "development";

export const NONCE_HEADER_NAME = "x-nonce";

export function createCspNonce() {
  return crypto.randomUUID().replace(/-/g, "");
}

export function buildContentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    isDev
      ? `connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:* https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com`
      : `connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com`,
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://connect.facebook.net`,
    "style-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://dgalywyr863if.cloudfront.net https://lh3.googleusercontent.com",
    "font-src 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
