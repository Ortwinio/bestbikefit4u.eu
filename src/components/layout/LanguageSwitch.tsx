"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
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
      <Link
        href={enHref}
        aria-label={labels.english}
        aria-current={locale === "en" ? "page" : undefined}
        className={cn(
          sharedClasses,
          locale === "en"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        EN
      </Link>
      <Link
        href={nlHref}
        aria-label={labels.dutch}
        aria-current={locale === "nl" ? "page" : undefined}
        className={cn(
          sharedClasses,
          locale === "nl"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        NL
      </Link>
    </nav>
  );
}
