import { SITEMAP_BASE_URL } from "./config";

function ensureLeadingSlash(pathname: string): string {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function normalizePathname(rawPathname: string): string {
  const withoutQuery = rawPathname.split(/[?#]/, 1)[0] ?? "";
  const absolutePathname =
    withoutQuery.startsWith("http://") || withoutQuery.startsWith("https://")
      ? new URL(withoutQuery).pathname
      : withoutQuery;

  const collapsed = ensureLeadingSlash(absolutePathname).replace(/\/{2,}/g, "/");
  const withoutTrailing =
    collapsed.length > 1 && collapsed.endsWith("/")
      ? collapsed.slice(0, -1)
      : collapsed;

  return withoutTrailing.toLowerCase();
}

export function toAbsoluteUrl(pathname: string): string {
  return new URL(normalizePathname(pathname), SITEMAP_BASE_URL).toString();
}

export function normalizeLastmod(rawValue: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return rawValue;
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}
