"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { UserRound } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleSwitchHref } from "@/i18n/switchHref";
import { getMarketingLayoutMessages } from "@/i18n/marketing/layout";
import { useLocaleSwitch } from "./useLocaleSwitch";

export function MarketingAccountLink({ locale, loginLabel, dashboardLabel }: {
  locale: Locale;
  loginLabel: string;
  dashboardLabel: string;
}) {
  const { isAuthenticated } = useConvexAuth();
  return (
    <Link href={withLocalePrefix(isAuthenticated ? "/dashboard" : "/login", locale)}
      aria-label={isAuthenticated ? dashboardLabel : loginLabel}
      className="inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap px-3 text-sm font-semibold hover:underline xl:px-0 xl:text-base">
      {isAuthenticated ? <><UserRound aria-hidden="true" className="size-5 xl:hidden" /><span className="hidden xl:inline">{dashboardLabel}</span></> : loginLabel}
    </Link>
  );
}

export function MarketingNavigation({ items, label }: {
  items: { href: string; label: string }[];
  label: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="hidden items-center gap-5 xl:flex">
      {items.map((item) => (
        <Link key={item.href} href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={
            "inline-flex min-h-11 items-center whitespace-nowrap text-base font-semibold text-foreground " +
            "hover:text-primary aria-[current=page]:text-primary aria-[current=page]:underline " +
            "aria-[current=page]:decoration-[var(--bbf-lime)] " +
            "aria-[current=page]:decoration-[3px] aria-[current=page]:underline-offset-8"
          }>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function MarketingLanguageSwitch({ locale, placement, inverse = false }: {
  locale: Locale;
  placement: "menu" | "footer";
  inverse?: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const copy = getMarketingLayoutMessages(locale);
  const switchLocale = useLocaleSwitch();
  return (
    <nav
      aria-label={placement === "footer" ? copy.languageFooter : copy.languageMenu}
      className={`inline-flex shrink-0 rounded-full border p-0.5 ${inverse ? "border-[var(--bbf-gedempt)]" : "border-border"}`}>
      {(["nl", "en"] as const).map((target) => (
        <a key={target}
          onClick={(event) => switchLocale(event, target)}
          href={buildLocaleSwitchHref({ pathname, queryString: searchParams?.toString() ?? "", locale: target })}
          aria-label={target === "nl" ? copy.dutch : copy.english}
          aria-current={locale === target ? "page" : undefined}
          className={`inline-flex size-11 items-center justify-center rounded-full text-xs font-semibold ${locale === target
            ? inverse ? "bg-[var(--bbf-lime)] text-[var(--bbf-inkt)]" : "bg-foreground text-background"
            : inverse ? "text-[var(--bbf-op-donker)] hover:text-[var(--bbf-wit)]" : "text-muted-foreground hover:text-foreground"}`}>
          {target.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
