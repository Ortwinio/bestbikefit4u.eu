const IMAGE_HOSTS = new Set([
  "dgalywyr863if.cloudfront.net",
  "lh3.googleusercontent.com",
]);

/** PDF renderers must never fetch arbitrary profile/bike URLs on the server. */
export function isAllowedPdfResource(rawUrl: string, resourceType: string): boolean {
  if (resourceType !== "image") return false;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  if (IMAGE_HOSTS.has(url.hostname)) return true;

  // Limit uploaded photos to this deployment's storage endpoint. A wildcard
  // Convex host would also trust attacker-controlled Convex HTTP actions.
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return false;
  try {
    const storageOrigin = new URL(convexUrl);
    return url.origin === storageOrigin.origin && url.pathname.startsWith("/api/storage/");
  } catch {
    return false;
  }
}
