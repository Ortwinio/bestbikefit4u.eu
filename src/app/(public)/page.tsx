import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Bike, Check, CircleGauge, Cog, Gauge, MoveHorizontal, Ruler, Star } from "lucide-react";
import { LatestBlogSection } from "@/components/home/LatestBlogSection";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { SaddleHeightTeaser } from "@/components/home/SaddleHeightTeaser";
import { HOME_STEPPER_CONTENT, HOME_PROOF_BAR_CONTENT, HOME_TESTIMONIALS } from "@/components/home/homeRedesignContent";
import { HOME_GUIDE_LINKS, HOME_SCENARIO_LINKS } from "@/components/home/homeGuideContent";
import { getLocalizedPublicCalculatorPath, type PublicCalculatorId } from "@/lib/public-calculators";
import { getDictionary } from "@/i18n/getDictionary";
import { homeMarketing } from "@/i18n/marketing/home";
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
    openGraph: { title: metadata.openGraphTitle, description: metadata.openGraphDescription, type: "website", url: alternates.canonical },
    alternates,
  };
}

const calculators: Array<{ id: PublicCalculatorId | null; icon: typeof Bike }> = [
  { id: "bike-fit", icon: Bike }, { id: "saddle-height", icon: Ruler },
  { id: "frame-size", icon: MoveHorizontal }, { id: "tire-pressure", icon: Gauge },
  { id: "saddle-width", icon: MoveHorizontal }, { id: "crank-length", icon: CircleGauge },
  { id: "gearing", icon: Cog }, { id: null, icon: Ruler },
];
const painPaths = ["/guides/bike-fitting-for-knee-pain", "/guides/bike-fitting-for-lower-back-pain", "/pain/hand-numbness-cycling", "/pain/saddle-discomfort-cycling"];

export default async function HomePage() {
  const locale = await getRequestLocale();
  const { home } = await getDictionary(locale);
  const copy = homeMarketing[locale];
  const proof = HOME_PROOF_BAR_CONTENT[locale];
  const steps = HOME_STEPPER_CONTENT[locale];
  const testimonials = HOME_TESTIMONIALS[locale];
  const local = (path: string) => withLocalePrefix(path, locale);
  const fitHref = local("/calculators/bike-fit");

  return <div className={styles.home}>
    <TrackMarketingEventOnView eventType="funnel_landing_view" locale={locale} pagePath={local("/")} section="landing" />
    <section className={`${styles.container} ${styles.hero}`}>
      <div className={styles.heroCopy}>
        <span className={styles.badge}>{copy.badge}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <div className={styles.actions}>
          <TrackedCtaLink className={styles.primary} href={fitHref} locale={locale} pagePath={local("/")} section="hero_primary" ctaLabel={copy.start}>{copy.start}<ArrowRight size={20} aria-hidden="true" /></TrackedCtaLink>
          <Link className={styles.secondary} href="#fit-report">{copy.reportLink}</Link>
        </div>
        <div className={styles.rating}><Star size={18} aria-hidden="true" />{copy.rating}</div>
        <span className={styles.badge}>{copy.teaser.example}</span>
      </div>
      <SaddleHeightTeaser locale={locale} />
    </section>

    <section className={styles.proof}>
      <div className={`${styles.container} ${styles.proofInner}`}>
        {proof.stats.map((stat) => <div key={stat.label} className={styles.stat}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        <blockquote>“{proof.quote.quote}”<cite>{proof.quote.name} · {proof.quote.bikeContext}</cite></blockquote>
      </div>
    </section>

    <section className={`${styles.container} ${styles.section}`}>
      <div className={styles.heading}><div><p className={styles.eyebrow}>{copy.toolsEyebrow}</p><h2>{copy.toolsTitle}</h2></div><p>{copy.toolsDescription}</p></div>
      {/* TODO: Verify a source before restoring the most-popular badge or a measurement-duration claim (audit/11-notes.md). */}
      <div className={styles.toolGrid}>{calculators.map((tool, index) => {
        const Icon = tool.icon;
        return <Link key={tool.id ?? "measurement-guide"} className={styles.tool} href={local(tool.id ? getLocalizedPublicCalculatorPath(tool.id, locale) : "/measurement-guide")}><span className={styles.icon}><Icon size={26} strokeWidth={2} aria-hidden="true" /></span><h3>{copy.tools[index].title}</h3><p>{copy.tools[index].description}</p></Link>;
      })}</div>
    </section>

    <section className={styles.stepsBand}>
      <div className={`${styles.container} ${styles.section}`}><p className={styles.eyebrow}>{steps.eyebrow}</p><h2>{copy.stepsTitle}</h2>
        <div className={styles.steps}>{steps.steps.map((step) => <div key={step.number}><span className={styles.stepNumber}>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></div>)}</div>
        <Link className={styles.textLink} href={local("/how-it-works")}>{steps.eyebrow}<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className={`${styles.container} ${styles.section}`}><div className={styles.heading}><div><p className={styles.eyebrow}>{copy.painEyebrow}</p><h2>{copy.painTitle}</h2></div></div>
      <div className={styles.painGrid}>{copy.pains.map((pain, index) => <article className={styles.pain} key={pain.title}><h3>{pain.title}</h3><p>{pain.description}</p><Link className={styles.textLink} href={local(painPaths[index])}>{copy.readGuide}<ArrowRight size={18} aria-hidden="true" /></Link></article>)}</div>
    </section>

    <section className={styles.testimonials}><div className={`${styles.container} ${styles.section}`}><h2>{copy.testimonialsTitle}</h2><div className={styles.quotes}>{testimonials.items.map((testimonial, index) => <blockquote key={testimonial.name} className={styles.quote}><span className={styles.change}>{copy.changes[index]}</span><p>“{testimonial.quote}”</p><cite><strong>{testimonial.name}</strong>{testimonial.bikeContext}</cite></blockquote>)}</div></div></section>

    <section id="fit-report" className={`${styles.container} ${styles.section} ${styles.report}`}><h2>{copy.reportTitle}</h2><ul>{home.recommendationSection.items.map((item, index) => <li key={item}><Check size={20} aria-hidden="true" />{index === 4 ? copy.crankAdvice : item}</li>)}</ul></section>

    <div className={styles.container}><section className={styles.closing}><div><h2>{copy.closingTitle}</h2><p>{copy.paused}</p></div><div className={styles.actions}><TrackedCtaLink className={styles.primary} href={local("/login")} locale={locale} pagePath={local("/")} section="closing_primary" ctaLabel={copy.account}>{copy.account}</TrackedCtaLink><Link className={styles.secondary} href={local("/pricing")}>{copy.compare}</Link></div></section></div>

    <Suspense fallback={null}><LatestBlogSection locale={locale} /></Suspense>
    <div className={styles.container}><details className={styles.discovery}><summary>{copy.discover}</summary><div className={styles.discoveryGrid}>
      <section><h3>{copy.foundations}</h3>{copy.foundationLinks.map((item) => <Link key={item.href} href={local(item.href)}>{item.title}</Link>)}</section>
      {[{ title: copy.guides, items: HOME_GUIDE_LINKS[locale] }, { title: copy.scenarios, items: HOME_SCENARIO_LINKS[locale] }].map((group) => <section key={group.title}><h3>{group.title}</h3>{group.items.map((item) => <Link key={item.href} href={local(item.href)}>{item.title}<span>{item.subtitle}</span></Link>)}</section>)}
    </div><Link className={styles.textLink} href={local("/guides")}>{copy.allGuides}<ArrowRight size={18} aria-hidden="true" /></Link></details></div>
  </div>;
}
