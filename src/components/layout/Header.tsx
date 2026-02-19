import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Messages } from "@/i18n/getDictionary";
import { LanguageSwitch } from "./LanguageSwitch";
import { HeaderAuthActions } from "./HeaderAuthActions";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

type HeaderProps = {
  locale: Locale;
  labels: Pick<Messages, "common" | "nav">;
};

export function Header({ locale, labels }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-16 items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-6">
            <Link
              href={withLocalePrefix("/", locale)}
              className="text-xl font-bold text-gray-900"
            >
              {labels.nav.brand}
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={withLocalePrefix("/about", locale)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {labels.nav.howItWorks}
              </Link>
              <Link
                href={withLocalePrefix("/pricing", locale)}
                className="text-sm text-gray-600 hover:text-gray-900"
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
              />
            </div>
            <HeaderMobileMenu
              locale={locale}
              labels={{
                howItWorks: labels.nav.howItWorks,
                pricing: labels.nav.pricing,
                login: labels.nav.login,
                getStarted: labels.nav.getStarted,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
