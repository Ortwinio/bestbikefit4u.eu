export const DEFAULT_SITE_ORIGIN = "https://bikefitboost.com";

export const LEGACY_SITE_HOSTS = ["bestbikefit4u.eu", "www.bestbikefit4u.eu"] as const;
export const LEGACY_SITE_HOST_PATTERN = "(?:[a-zA-Z0-9-]+\\.)*bestbikefit4u\\.eu";
export const SITE_HOST_ALIASES = ["bikefitboost.com", "www.bikefitboost.com"] as const;

export function isLegacySiteHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  return host === LEGACY_SITE_HOSTS[0] || host.endsWith(`.${LEGACY_SITE_HOSTS[0]}`);
}

export function resolveSiteOrigin(...candidates: Array<string | undefined>): string {
  const configured = candidates.length ? candidates : [readEnv("NEXT_PUBLIC_SITE_URL"), readEnv("SITE_URL")];
  for (const candidate of configured) {
    const value = candidate?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || isLegacySiteHost(url.hostname)) {
        continue;
      }
      if (SITE_HOST_ALIASES.some((host) => host === url.hostname.replace(/\.$/, ""))) return DEFAULT_SITE_ORIGIN;
      if (url.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) continue;
      return url.origin;
    } catch {
      // Ignore malformed overrides and fall through to the default.
    }
  }
  return DEFAULT_SITE_ORIGIN;
}

// Convex evaluates the schema module graph without environment access, so a throwing read falls back to the default.
function readEnv(name: "NEXT_PUBLIC_SITE_URL" | "SITE_URL"): string | undefined {
  try {
    return name === "NEXT_PUBLIC_SITE_URL" ? process.env.NEXT_PUBLIC_SITE_URL : process.env.SITE_URL;
  } catch {
    return undefined;
  }
}

export const SITE_ORIGIN = resolveSiteOrigin();
