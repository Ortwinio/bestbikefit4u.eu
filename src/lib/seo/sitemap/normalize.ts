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

export function normalizeLastmod(rawValue?: string | number | null): string | undefined {
  if (rawValue === null || rawValue === undefined) return undefined;
  if (typeof rawValue === "number") {
    if (!Number.isFinite(rawValue)) return undefined;
  } else {
    if (!/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/.test(rawValue)) {
      return undefined;
    }
    const calendarDate = rawValue.slice(0, 10);
    const calendar = new Date(`${calendarDate}T00:00:00.000Z`);
    if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== calendarDate) {
      return undefined;
    }
  }
  const parsed = new Date(rawValue);
  if (!Number.isFinite(parsed.getTime())) return undefined;
  const normalized = parsed.toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : undefined;
}
