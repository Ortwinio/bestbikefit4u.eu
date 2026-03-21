import Link from "next/link";
import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
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
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
              {f.product}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/about", locale)}
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
                  href={withLocalePrefix("/science/calculation-engine", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.science}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/bandenspanning-calculator", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.tirePressure}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/calculators/saddle-height", locale)}
                  className="text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                >
                  {f.calculators}
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
