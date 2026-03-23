function resolveConvexSiteUrl(): string {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (explicitSiteUrl) {
    return explicitSiteUrl.replace(/\/$/, "");
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_SITE_URL or NEXT_PUBLIC_CONVEX_URL");
  }

  const parsed = new URL(convexUrl);
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  parsed.hostname = parsed.hostname.replace(".convex.cloud", ".convex.site");
  return parsed.toString().replace(/\/$/, "");
}

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const convexSiteUrl = resolveConvexSiteUrl();
  const target = new URL(`${convexSiteUrl}/strava/callback`);

  incoming.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  return Response.redirect(target.toString(), 307);
}
