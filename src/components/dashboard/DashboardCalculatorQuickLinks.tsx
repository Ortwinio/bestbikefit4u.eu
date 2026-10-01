import Link from "next/link";
import { accountCalculatorNavigation } from "@/components/account/account-navigation";
import { calculatorNavigationMessages } from "@/i18n/account/calculatorNavigation";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";

export function DashboardCalculatorQuickLinks({ locale }: { locale: Locale }) {
  return (
    <section aria-labelledby="dashboard-calculators-title" className="min-w-0 space-y-4">
      <h2 id="dashboard-calculators-title" className="font-display text-2xl font-bold text-foreground">
        {calculatorNavigationMessages[locale].title}
      </h2>
      <nav aria-labelledby="dashboard-calculators-title" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {accountCalculatorNavigation(locale).map((item) => (
          <Link
            key={item.href}
            href={withLocalePrefix(item.href, locale)}
            className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <item.icon aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
