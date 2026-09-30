import { isLoopback } from "./assets.mjs";

/** A deployed backend (including private LAN hosts) never qualifies for this local-only exception. */
export function localConvexSyncOrigin(configuredUrl) {
  try {
    const url = new URL(configuredUrl);
    if (!isLoopback(url.hostname) || !["http:", "https:"].includes(url.protocol)
      || url.pathname !== "/" || url.username || url.password || url.search || url.hash) return null;
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.origin;
  } catch { return null; }
}

export function classifyExpectedDiagnostic(error, { configuredConvexUrl, pageUrl }) {
  if (error.type !== "console" || !isLoopback(new URL(pageUrl).hostname)) return null;
  const expectedOrigin = localConvexSyncOrigin(configuredConvexUrl);
  if (!expectedOrigin) return null;
  const pattern = /^Connecting to '([^']+)' violates the following Content Security Policy directive:/;
  const match = error.message.match(pattern);
  if (!match || !error.message.includes("connect-src")) return null;
  try {
    const url = new URL(match[1]);
    const syncPath = /^\/api\/\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?\/sync$/;
    if (url.origin !== expectedOrigin || !syncPath.test(url.pathname) || url.search || url.hash) return null;
    return { kind: "local-dev-convex-csp", connection: url.href,
      reason: "The configured backend is loopback; production CSP intentionally excludes local development sync." };
  } catch { return null; }
}
