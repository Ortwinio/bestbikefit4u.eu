import { DEFAULT_SOCIAL_IMAGE } from "@/lib/seo/social-image";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Check,
} from "lucide-react";
import { LatestBlogSection } from "@/components/home/LatestBlogSection";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { SaddleHeightTeaser } from "@/components/home/SaddleHeightTeaser";
import { HOME_GUIDE_LINKS, HOME_SCENARIO_LINKS } from "@/components/home/homeGuideContent";
import {
  getLocalizedPublicCalculatorPath,
} from "@/lib/public-calculators";
import { getDictionary } from "@/i18n/getDictionary";
import { homeMarketing } from "@/i18n/marketing/home";
import { homeTrust } from "@/i18n/marketing/homeTrust";
import { homeRoutes } from "@/i18n/marketing/homeRoutes";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import styles from "@/components/home/MarketingHome.module.css";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const { metadata } = dictionary.home;
  const alternates = buildLocaleAlternates("/", locale);
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      images: [DEFAULT_SOCIAL_IMAGE],
      title: metadata.openGraphTitle,
      description: metadata.openGraphDescription,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

const painPaths = [
  "/guides/bike-fitting-for-knee-pain",
  "/guides/bike-fitting-for-lower-back-pain",
  "/pain/hand-numbness-cycling",
  "/pain/saddle-discomfort-cycling",
];

export default async function HomePage() {
  const locale = await getRequestLocale();
  const { home } = await getDictionary(locale);
  const copy = homeMarketing[locale];
  const trust = homeTrust[locale];
  const journey = homeRoutes[locale];
  const routePaths = [
    ["/calculators/saddle-height", "/calculators/frame-size", "/calculators/crank-length", "/calculators/saddle-width", "/calculators/bike-fit"],
    [getLocalizedPublicCalculatorPath("tire-pressure", locale), "/calculators/gearing", "/calculators/climb-planner", "/calculators/power-speed", "/calculators/ftp-wkg", "/calculators/fuel-hydration"],
  ];
  const local = (path: string) => withLocalePrefix(path, locale);
  const fitHref = local("/calculators/bike-fit");

  return (
    <div className={styles.home}>
      <TrackMarketingEventOnView
        eventType="funnel_landing_view"
        locale={locale}
        pagePath={local("/")}
        section="landing"
      />
      <section className={`${styles.container} ${styles.hero}`}>
        <div className={styles.heroHeading}>
          <span className={styles.badge}>{copy.badge}</span>
          <h1 lang="en">{copy.title}</h1>
        </div>
        <SaddleHeightTeaser locale={locale} />
        <div className={styles.heroCopy}>
          <p>{copy.description}</p>
          <div className={styles.actions}>
            <TrackedCtaLink
              className={styles.primary}
              href={fitHref}
              locale={locale}
              pagePath={local("/")}
              section="hero_primary"
              ctaLabel={copy.start}
            >
              {copy.start}
              <ArrowRight size={20} aria-hidden="true" />
            </TrackedCtaLink>
            <Link className={styles.secondary} href="#fit-report">
              {copy.reportLink}
            </Link>
          </div>
          <div className={styles.rating}>
            <Check size={18} aria-hidden="true" />
            <span>{trust.note}</span>
          </div>
        </div>
      </section>

      <section className={styles.proof}>
        <div className={`${styles.container} ${styles.proofInner}`}>
          {trust.stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
          <div className={styles.principle}>
            {trust.principle.text}
            <span>{trust.principle.title} · {trust.principle.context}</span>
          </div>
        </div>
      </section>

      <section id="calculators" data-usability="home-routes" className={`${styles.container} ${styles.section}`}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>{copy.toolsEyebrow}</p>
            <h2>{journey.title}</h2>
          </div>
          <p>{copy.toolsDescription}</p>
        </div>
        <div className={styles.routeGrid}>
          {journey.routes.map((route, routeIndex) => (
            <div key={route.id} className={styles.routeCard}>
              <p className={styles.eyebrow}>Route · {route.labels.length} {journey.steps}</p>
              <h3>{route.title}</h3>
              <p>{route.description}</p>
              <nav aria-label={`${journey.navigation} ${route.title}`} className={styles.routeSteps}>
                {route.labels.map((label, stepIndex) => (
                  <Link key={label} href={local(routePaths[routeIndex][stepIndex])}>
                    <span aria-hidden="true">{stepIndex + 1}</span>{label}
                  </Link>
                ))}
              </nav>
              <TrackedCtaLink className={styles.primary} href={local(routePaths[routeIndex][0])}
                locale={locale} pagePath={local("/")} section={`route_${route.id}`} ctaLabel={route.start}
                data-usability="route-start" data-route={route.id}>
                {route.start}<ArrowRight size={20} aria-hidden="true" />
              </TrackedCtaLink>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>{copy.painEyebrow}</p>
            <h2>{copy.painTitle}</h2>
          </div>
        </div>
        <div className={styles.painGrid}>
          {copy.pains.map((pain, index) => (
            <article className={styles.pain} key={pain.title}>
              <h3>{pain.title}</h3>
              <p>{pain.description}</p>
              <Link className={styles.textLink} href={local(painPaths[index])}>
                {copy.readGuide}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="fit-report" className={`${styles.container} ${styles.section} ${styles.report}`}>
        <div>
          <h2>{journey.reportTitle}</h2>
          <ol className={styles.reportSteps}>
            {journey.reportLines.map((line) => <li key={line}>{line}</li>)}
          </ol>
          <Link className={styles.textLink} href={local("/pricing")}>{copy.reportLink}<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <details className={styles.reportDetails} data-usability="collapsed-explanation">
          <summary>{copy.reportTitle}</summary>
          <ul>
          {home.recommendationSection.items.map((item, index) => (
            <li key={item}>
              <Check size={20} aria-hidden="true" />
              {index === 4 ? copy.crankAdvice : item}
            </li>
          ))}
          </ul>
          <h3>{trust.title}</h3>
          {trust.cards.map((card) => (
            <article key={card.label}>
              <h4 className={styles.change}>{card.label}</h4>
              <p>{card.text}</p>
              <p className={styles.cardContext}>
                <strong>{card.title}</strong>
                {card.context}
              </p>
            </article>
          ))}
        </details>
      </section>

      <div className={styles.container}>
        <section className={styles.closing}>
          <div>
            <h2>{copy.closingTitle}</h2>
            <p>{copy.paused}</p>
          </div>
          <div className={styles.actions}>
            <TrackedCtaLink
              className={styles.primary}
              href={local("/login")}
              locale={locale}
              pagePath={local("/")}
              section="closing_primary"
              ctaLabel={copy.account}
            >
              {copy.account}
            </TrackedCtaLink>
            <Link className={styles.secondary} href={local("/pricing")}>
              {copy.compare}
            </Link>
          </div>
        </section>
      </div>

      <Suspense fallback={null}>
        <LatestBlogSection locale={locale} />
      </Suspense>
      <div className={styles.container}>
        <details className={styles.discovery}>
          <summary>{copy.discover}</summary>
          <div className={styles.discoveryGrid}>
            <section>
              <h3>{copy.foundations}</h3>
              {copy.foundationLinks.map((item) => (
                <Link key={item.href} href={local(item.href)}>
                  {item.title}
                </Link>
              ))}
            </section>
            {[
              { title: copy.guides, items: HOME_GUIDE_LINKS[locale] },
              { title: copy.scenarios, items: HOME_SCENARIO_LINKS[locale] },
            ].map((group) => (
              <section key={group.title}>
                <h3>{group.title}</h3>
                {group.items.map((item) => (
                  <Link key={item.href} href={local(item.href)}>
                    {item.title}
                    <span>{item.subtitle}</span>
                  </Link>
                ))}
              </section>
            ))}
          </div>
          <Link className={styles.textLink} href={local("/guides")}>
            {copy.allGuides}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </details>
      </div>
    </div>
  );
}
