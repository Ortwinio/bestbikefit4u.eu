"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { buildLocaleSwitchHref } from "@/i18n/switchHref";
import { cn } from "@/utils/cn";

export function AccountLanguageSwitch() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { locale, languageSwitchLabels } = useDashboardMessages();
  return <nav aria-label={languageSwitchLabels.language} className="flex gap-1">
    {(["en", "nl"] as const).map((language) => <a key={language}
      href={buildLocaleSwitchHref({ pathname, queryString: searchParams?.toString() ?? "", locale: language })}
      aria-label={language === "en" ? languageSwitchLabels.english : languageSwitchLabels.dutch}
      aria-current={locale === language ? "page" : undefined}
      className={cn("flex min-h-11 min-w-11 items-center justify-center rounded-full text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bbf-lime)]", locale === language ? "bg-[var(--bbf-lime)] text-[var(--bbf-inkt)]" : "text-[var(--bbf-petrol-zacht)] hover:bg-white/10")}>
      {language.toUpperCase()}
    </a>)}
  </nav>;
}
