import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  type Locale,
  normalizeLocale,
} from "./config";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const headerLocale = normalizeLocale(headerStore.get(LOCALE_HEADER_NAME));
  if (headerLocale) {
    return headerLocale;
  }

  const cookieLocale = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value
  );
  if (cookieLocale) {
    return cookieLocale;
  }

  return DEFAULT_LOCALE;
}
