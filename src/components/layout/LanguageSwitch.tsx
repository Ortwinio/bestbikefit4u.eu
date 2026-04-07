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
    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-[background-color,color,box-shadow] duration-150";

  return (
    <nav
      aria-label={labels.language}
      className="flex items-center rounded-xl border border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] p-1 shadow-[0_10px_24px_-20px_color-mix(in_oklch,var(--foreground)_30%,transparent)]"
    >
      <a
        href={enHref}
        aria-label={labels.english}
        aria-current={activeLocale === "en" ? "page" : undefined}
        className={cn(
          sharedClasses,
          activeLocale === "en"
            ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm"
            : "text-[color:var(--foreground)]/80 hover:bg-[color:var(--accent)]/70 hover:text-[color:var(--foreground)]"
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
            ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm"
            : "text-[color:var(--foreground)]/80 hover:bg-[color:var(--accent)]/70 hover:text-[color:var(--foreground)]"
        )}
      >
        NL
      </a>
    </nav>
  );
}
