import Link from "next/link";
import { Compass, Gauge, Sparkles } from "lucide-react";
import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
import type { Messages } from "@/i18n/getDictionary";

type FooterProps = {
  locale: Locale;
  labels: Pick<Messages["nav"], "howItWorks" | "pricing"> & {
    footer: Messages["nav"]["footer"];
  };
};

export function Footer({ locale, labels }: FooterProps) {
  const f = labels.footer;

  return (
    <footer className="border-t border-[color:var(--border)] bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_20%,var(--background)_80%)_100%)] text-[color:var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-4 rounded-[1.75rem] border border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] p-6 shadow-[0_18px_40px_-30px_color-mix(in_oklch,var(--foreground)_30%,transparent)] md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">{f.product}</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {locale === "nl"
                  ? "Praktische calculators, fitflow en setupbegeleiding."
                  : "Practical calculators, fit flow, and setup guidance."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">{f.resources}</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {locale === "nl"
                  ? "Handleidingen en wetenschap om beslissingen beter te onderbouwen."
                  : "Guides and science pages to make better decisions with more context."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">{f.support}</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {locale === "nl"
                  ? "Contact, FAQ en meetgids blijven beschikbaar in NL en EN."
                  : "Contact, FAQ, and measurement guidance stay available in Dutch and English."}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
              {f.product}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/how-it-works", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {labels.howItWorks}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/pricing", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {labels.pricing}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
              {f.calculators}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.bikeFit}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/calculators/saddle-height", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.saddleHeight}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/calculators/saddle-width", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.saddleWidth}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/calculators/frame-size", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.frameSize}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/calculators/crank-length", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.crankLength}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/calculators/gearing", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.gearing}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix(
                    getLocalizedPublicCalculatorPath("tire-pressure", locale),
                    locale
                  )}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.tirePressure}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
              {f.support}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/contact", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/faq", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.faq}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/measurement-guide", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.measurementGuide}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
              {f.legal}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/privacy", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/terms", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap.xml"
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.sitemap}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
              {f.resources}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/guides/fit-science", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.science}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/guides", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.guides}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[color:var(--border)] pt-8">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} {BRAND.name}.{" "}
            {f.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
