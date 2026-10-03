import Link from "next/link";
import {
  Bike,
  Ruler,
  MoveHorizontal,
  Frame,
  RotateCw,
  Cog,
  Gauge,
  ClipboardCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/branding";
import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix, switchLocalePathname } from "@/i18n/navigation";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
import type { Messages } from "@/i18n/getDictionary";
import { getMarketingLayoutMessages } from "@/i18n/marketing/layout";
import { getDutchGuideTitle } from "@/i18n/marketing/guideTitles";
import { bikeFittingLinks } from "@/i18n/marketing/bikeFittingLinks";
import { MarketingLanguageSwitch } from "./MarketingNavigation";

type FooterProps = {
  locale: Locale;
  labels: Pick<Messages["nav"], "howItWorks" | "pricing"> & { footer: Messages["nav"]["footer"] };
};

export function Footer({ locale, labels }: FooterProps) {
  const copy = getMarketingLayoutMessages(locale);
  const footer = locale === "nl"
    ? { ...labels.footer, support: copy.support, passportCheck: copy.passportCheck, faq: copy.faq }
    : labels.footer;
  const calculators = [
    { path: "/calculators/bike-fit", label: footer.bikeFit, icon: Bike },
    { path: "/calculators/saddle-height", label: footer.saddleHeight, icon: Ruler },
    { path: "/calculators/saddle-width", label: footer.saddleWidth, icon: MoveHorizontal },
    { path: "/calculators/frame-size", label: footer.frameSize, icon: Frame },
    { path: "/calculators/crank-length", label: footer.crankLength, icon: RotateCw },
    { path: "/calculators/gearing", label: footer.gearing, icon: Cog },
    {
      path: getLocalizedPublicCalculatorPath("tire-pressure", locale),
      label: footer.tirePressure,
      icon: Gauge,
    },
    { path: "/login", label: footer.passportCheck, icon: ClipboardCheck },
  ];
  const groups = [
    {
      label: footer.product,
      links: [
        { path: switchLocalePathname("/bike-fitting", locale), label: bikeFittingLinks[locale].label },
        { path: "/how-it-works", label: labels.howItWorks },
        { path: "/pricing", label: labels.pricing },
      ],
    },
    { label: footer.calculators, links: calculators },
    {
      label: footer.guides,
      links: [
        { path: "/guides/bike-fitting-for-knee-pain", label: footer.kneeGuide },
        { path: "/guides/bike-fitting-for-lower-back-pain", label: footer.backPainGuide },
        { path: "/guides/saddle-height-guide", label: footer.saddleHeightGuide },
        { path: "/guides/road-bike-fit-guide", label: footer.roadBikeFitGuide },
        { path: "/guides/cleat-position-basics-guide", label: footer.cleatGuide },
        { path: "/guides/fit-science", label: footer.science },
        { path: "/guides", label: footer.allGuides + " →" },
      ],
    },
    {
      label: footer.support,
      links: [
        { path: "/contact", label: footer.contact },
        { path: "/faq", label: footer.faq },
        { path: "/measurement-guide", label: footer.measurementGuide },
      ],
    },
    {
      label: footer.legal,
      links: [
        { path: "/privacy", label: footer.privacy },
        { path: "/terms", label: footer.terms },
        { path: "/sitemap.xml", label: footer.sitemap },
      ],
    },
  ];
  return (
    <footer className="bg-[var(--bbf-inkt)] text-[var(--bbf-wit)] dark:bg-surface-secondary">
      <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 xl:px-[120px]">
        <div className="flex flex-wrap items-center gap-6 border-b border-[var(--bbf-gedempt)] pb-8">
          <BrandLogo
            href={withLocalePrefix("/", locale)}
            asset="dark"
            className="flex min-h-11 w-[200px] items-center"
          />
          <p className="min-w-0 flex-1 basis-[260px] text-sm leading-relaxed text-[var(--bbf-op-donker)]">
            {copy.tagline}
          </p>
          <MarketingLanguageSwitch locale={locale} placement="footer" inverse />
        </div>
        <div
          className={
            "grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-3 " +
            "xl:grid-cols-[1fr_1.55fr_1.55fr_1fr_1fr] xl:gap-10"
          }
        >
          {groups.map((group) => (
            <section key={group.label} className="min-w-0">
              <h2 className="mb-3 font-display text-lg font-bold text-[var(--bbf-wit)]">{group.label}</h2>
              <ul>
                {group.links.map((item) => {
                  const Icon = "icon" in item ? item.icon : null;
                  return (
                    <li key={item.path}>
                      <Link
                        href={
                          item.path === "/sitemap.xml"
                            ? item.path
                            : withLocalePrefix(item.path, locale)
                        }
                        className={
                          "flex min-h-11 items-center gap-2 py-2 text-sm leading-snug " +
                          "text-[var(--bbf-op-donker)] hover:text-[var(--bbf-wit)]"
                        }
                      >
                        {Icon ? (
                          <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                        ) : null}
                        <span className="min-w-0 break-words">
                          {locale === "nl" && item.path.startsWith("/guides/")
                            ? getDutchGuideTitle(item.path.slice("/guides/".length)) ?? item.label
                            : item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <p className="border-t border-[var(--bbf-gedempt)] pt-6 text-xs leading-relaxed text-[var(--bbf-op-donker)]">
          &copy; <span className="font-mono">{new Date().getFullYear()}</span> {BRAND.name}.{" "}
          {footer.allRightsReserved}
        </p>
      </div>
    </footer>
  );
}
