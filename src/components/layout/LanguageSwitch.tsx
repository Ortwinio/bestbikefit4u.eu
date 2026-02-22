"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { extractLocaleFromPathname } from "@/i18n/navigation";
import { buildLocaleSwitchHref } from "@/i18n/switchHref";
import { cn } from "@/utils/cn";

type LanguageSwitchProps = {
  locale: Locale;
  labels: {
    language: string;
    english: string;
    dutch: string;
  };
};

export function LanguageSwitch({ locale, labels }: LanguageSwitchProps) {
  const pathname = usePathname() ?? "/";
  const activeLocale = extractLocaleFromPathname(pathname) ?? locale;
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ?? "";

  const enHref = buildLocaleSwitchHref({
    pathname,
    queryString,
    locale: "en",
  });
  const nlHref = buildLocaleSwitchHref({
    pathname,
    queryString,
    locale: "nl",
  });

  const sharedClasses =
    "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors";

  return (
    <nav
      aria-label={labels.language}
      className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1"
    >
      <a
        href={enHref}
        aria-label={labels.english}
        aria-current={activeLocale === "en" ? "page" : undefined}
        className={cn(
          sharedClasses,
          activeLocale === "en"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        EN
      </a>
      <a
        href={nlHref}
        aria-label={labels.dutch}
        aria-current={activeLocale === "nl" ? "page" : undefined}
        className={cn(
          sharedClasses,
          activeLocale === "nl"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        NL
      </a>
    </nav>
  );
}
