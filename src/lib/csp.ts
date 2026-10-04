import { LEGACY_SITE_HOSTS, SITE_ORIGIN } from "../../shared/brand";

export const NONCE_HEADER_NAME = "x-nonce";

const brandImageOrigins = [SITE_ORIGIN, ...LEGACY_SITE_HOSTS.map((host) => `https://${host}`)].join(" ");

export function createCspNonce() {
  return crypto.randomUUID().replace(/-/g, "");
}

function sentryConnectSource() {
  try {
    const dsn = new URL(process.env.NEXT_PUBLIC_SENTRY_DSN ?? "");
    // Only the configured ingestion origin is needed, never the DSN credentials.
    return dsn.protocol === "https:" ? ` ${dsn.origin}` : "";
  } catch {
    return "";
  }
}

export function buildContentSecurityPolicy(
  nonce: string,
  isDev = process.env.NODE_ENV === "development"
) {
  return [
    "default-src 'self'",
    (isDev
      ? `connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com`
      : `connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://www.facebook.com`) + sentryConnectSource(),
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    // Component libraries position dialogs and controls with style attributes.
    // Keep script execution and style elements nonce-protected in production.
    "style-src-attr 'unsafe-inline'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `img-src 'self' ${brandImageOrigins} data: blob: https://*.convex.cloud https://*.convex.site https://dgalywyr863if.cloudfront.net https://lh3.googleusercontent.com`,
    "font-src 'self'",
    "frame-ancestors 'none'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/** Next.js must see the policy on the request to nonce its own bootstrap scripts. */
export function createCspRequestHeaders(headers: Headers, nonce: string) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set(NONCE_HEADER_NAME, nonce);
  requestHeaders.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));
  return requestHeaders;
}
