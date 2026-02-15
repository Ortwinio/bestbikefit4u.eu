import type { Locale } from "./config";
import { switchLocalePathname } from "./navigation";

export function buildLocaleSwitchHref({
  pathname,
  queryString,
  locale,
}: {
  pathname: string;
  queryString: string;
  locale: Locale;
}): string {
  const nextPathname = switchLocalePathname(pathname, locale);
  if (!queryString) {
    return nextPathname;
  }

  return `${nextPathname}?${queryString}`;
}
