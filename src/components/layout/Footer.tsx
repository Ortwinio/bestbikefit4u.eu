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
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {f.product}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/about", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {labels.howItWorks}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/pricing", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {labels.pricing}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {f.support}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/contact", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/faq", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.faq}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/measurement-guide", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.measurementGuide}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {f.legal}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/privacy", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/terms", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.terms}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {f.resources}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={withLocalePrefix("/science/calculation-engine", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.science}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/calculators/saddle-height", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.calculators}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePrefix("/guides", locale)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {f.guides}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {BRAND.name}.{" "}
            {f.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
