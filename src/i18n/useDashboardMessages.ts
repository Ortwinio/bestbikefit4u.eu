"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, type Locale } from "./config";
import {
  getDashboardMessages,
  getLanguageSwitchLabels,
} from "./dashboardMessages";
import { extractLocaleFromPathname } from "./navigation";

export function useDashboardMessages(): {
  locale: Locale;
  messages: ReturnType<typeof getDashboardMessages>;
  languageSwitchLabels: ReturnType<typeof getLanguageSwitchLabels>;
} {
  const pathname = usePathname();
  const locale = useMemo(
    () => extractLocaleFromPathname(pathname ?? "") ?? DEFAULT_LOCALE,
    [pathname]
  );

  return {
    locale,
    messages: getDashboardMessages(locale),
    languageSwitchLabels: getLanguageSwitchLabels(locale),
  };
}
