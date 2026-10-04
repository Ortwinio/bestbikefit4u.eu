export const DEFAULT_SITE_ORIGIN = "https://www.bikefitboost.com";

export const LEGACY_SITE_HOSTS = ["bestbikefit4u.eu", "www.bestbikefit4u.eu"] as const;

// A stale env override that still names an old host would make the legacy-host redirects loop, so it is ignored.
export function resolveSiteOrigin(...candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (!(LEGACY_SITE_HOSTS as readonly string[]).includes(url.hostname)) return url.origin;
    } catch {
      // Ignore malformed overrides and fall through to the default.
    }
  }
  return DEFAULT_SITE_ORIGIN;
}

export const SITE_ORIGIN = resolveSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL, process.env.SITE_URL);
