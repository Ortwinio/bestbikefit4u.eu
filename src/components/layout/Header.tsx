import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Messages } from "@/i18n/getDictionary";
import { getMarketingLayoutMessages } from "@/i18n/marketing/layout";
import { MarketingLogo } from "./MarketingLogo";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import {
  MarketingAccountLink,
  MarketingLanguageSwitch,
  MarketingNavigation,
} from "./MarketingNavigation";

type HeaderProps = {
  locale: Locale;
  labels: Pick<Messages, "common" | "nav"> & {
    dashboardNav: Pick<
      Messages["dashboard"]["nav"],
      "dashboard" | "newFitSession" | "bikeFitting" | "myBikes" | "profile"
    >;
    dashboardSignOut: string;
  };
};

export function Header({ locale, labels }: HeaderProps) {
  const copy = getMarketingLayoutMessages(locale);
  const items = [
    { href: withLocalePrefix("/calculators/bike-fit", locale), label: copy.calculators },
    { href: withLocalePrefix("/how-it-works", locale), label: labels.nav.howItWorks },
    { href: withLocalePrefix("/guides", locale), label: copy.guides },
    { href: withLocalePrefix("/pricing", locale), label: labels.nav.pricing },
  ];
  return (
    <header className="border-b border-border bg-background text-foreground">
      <div
        className={
          "mx-auto flex min-h-[88px] max-w-[1440px] items-center justify-between gap-3 px-5 py-3 " +
          "md:px-10 xl:px-[120px]"
        }
      >
        <MarketingLogo
          href={withLocalePrefix("/", locale)}
          priority
          className="flex min-h-11 w-[195px] shrink-0 items-center"
        />
        <MarketingNavigation items={items} label={copy.navigation} />
        <div className="flex items-center gap-2 xl:gap-4">
          <MarketingLanguageSwitch locale={locale} placement="menu" />
          <MarketingAccountLink
            locale={locale}
            loginLabel={labels.nav.login}
            dashboardLabel={labels.dashboardNav.dashboard}
          />
          <Link
            href={withLocalePrefix("/calculators/bike-fit", locale)}
            className={
              "hidden min-h-12 items-center justify-center whitespace-nowrap rounded-full " +
              "bg-[var(--bbf-petrol)] px-[22px] text-base font-bold text-[var(--bbf-wit)] " +
              "hover:bg-[var(--bbf-petrol-hover)] xl:inline-flex"
            }
          >
            {copy.start}
          </Link>
          <HeaderMobileMenu
            locale={locale}
            labels={{
              howItWorks: labels.nav.howItWorks,
              tools: copy.calculators,
              pricing: labels.nav.pricing,
              login: labels.nav.login,
              getStarted: copy.start,
              dashboard: labels.dashboardNav.dashboard,
              newFitSession: labels.dashboardNav.newFitSession,
              bikeFitting: labels.dashboardNav.bikeFitting,
              myBikes: labels.dashboardNav.myBikes,
              profile: labels.dashboardNav.profile,
              signOut: labels.dashboardSignOut,
            }}
          />
        </div>
      </div>
    </header>
  );
}
