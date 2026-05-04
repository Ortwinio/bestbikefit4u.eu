import Link from "next/link";
import { Compass, Gauge, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Messages } from "@/i18n/getDictionary";
import { BrandLogo } from "@/components/branding";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
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
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const navItems = [
    {
      href: withLocalePrefix("/how-it-works", locale),
      label: labels.nav.howItWorks,
      icon: <Compass className="h-4 w-4" />,
    },
    {
      href: withLocalePrefix(getLocalizedPublicCalculatorPath("tire-pressure", locale), locale),
      label: labels.nav.tools,
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      href: withLocalePrefix("/pricing", locale),
      label: labels.nav.pricing,
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

  return (
    <header className="relative border-b border-[color:var(--border)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background)_94%,var(--secondary)_6%)_0%,var(--background)_100%)] text-[color:var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-6">
            <BrandLogo
              href={withLocalePrefix("/", locale)}
              asset="primary"
              priority
              className="block w-[84px] shrink-0 sm:w-[136px] lg:w-[184px]"
              imageClassName="block"
              ariaLabel={labels.nav.brand}
            />
            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-[color:var(--muted-foreground)] transition-all duration-200 hover:border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] hover:bg-[color:color-mix(in_oklch,var(--primary)_16%,var(--card)_84%)] hover:text-[color:var(--primary)]"
                >
                  <span className="text-[color:color-mix(in_oklch,var(--primary)_72%,var(--muted-foreground)_28%)] transition-colors duration-200 group-hover:text-[color:var(--primary)]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
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
                campaignActive={campaignActive}
                donateLabel={campaign.donateCta}
                donationUrl={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
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
              campaignActive={campaignActive}
              donateLabel={campaign.donateCta}
              donationUrl={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
