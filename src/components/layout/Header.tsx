import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Messages } from "@/i18n/getDictionary";
import { BrandLogo } from "@/components/branding";
import { LanguageSwitch } from "./LanguageSwitch";
import { HeaderAuthActions } from "./HeaderAuthActions";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

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
  return (
    <header className="border-b border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-16 items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-6">
            <BrandLogo
              href={withLocalePrefix("/", locale)}
              asset="primary"
              priority
              className="block w-[324px] shrink-0 lg:w-[360px]"
              imageClassName="block"
              ariaLabel={labels.nav.brand}
            />
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={withLocalePrefix("/how-it-works", locale)}
                className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
              >
                {labels.nav.howItWorks}
              </Link>
              <Link
                href={withLocalePrefix("/bandenspanning-calculator", locale)}
                className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
              >
                {labels.nav.tools}
              </Link>
              <Link
                href={withLocalePrefix("/pricing", locale)}
                className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
              >
                {labels.nav.pricing}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch locale={locale} labels={labels.common} />
            <div className="hidden md:flex md:items-center md:gap-3">
              <HeaderAuthActions
                locale={locale}
                loginLabel={labels.nav.login}
                getStartedLabel={labels.nav.getStarted}
                dashboardLabel={labels.dashboardNav.dashboard}
              />
            </div>
            <HeaderMobileMenu
              locale={locale}
              labels={{
                howItWorks: labels.nav.howItWorks,
                tools: labels.nav.tools,
                pricing: labels.nav.pricing,
                login: labels.nav.login,
                getStarted: labels.nav.getStarted,
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
      </div>
    </header>
  );
}
