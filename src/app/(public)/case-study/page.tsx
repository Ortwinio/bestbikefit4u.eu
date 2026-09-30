import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CaseStudyRecruitmentForm } from "@/components/public/CaseStudyRecruitmentForm";
import { Button } from "@/components/prototyper-ui/ui/button";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getCaseStudyMessages } from "@/i18n/marketing/caseStudy";
import styles from "./case-study.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const alternates = buildLocaleAlternates("/case-study", locale);
  const copy = getCaseStudyMessages(locale);
  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
    openGraph: {
      title: copy.metadata.title,
      description: copy.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function CaseStudyPage({
  searchParams,
}: {
  searchParams: Promise<{ pain?: string }>;
}) {
  const locale = await getRequestLocale();
  const { pain } = await searchParams;
  const sourcePath = withLocalePrefix(`/case-study${pain ? `?pain=${pain}` : ""}`, locale);
  const copy = getCaseStudyMessages(locale);
  const links = [
    { path: "/pain", label: copy.pain, section: "case_study_header_pain_cta" },
    { path: "/pricing", label: copy.pricing, section: "case_study_header_pricing_cta" },
  ];

  return (
    <div className={styles.page}>
      <TrackMarketingEventOnView
        eventType="case_study_recruitment_view"
        locale={locale}
        pagePath={withLocalePrefix("/case-study", locale)}
        section={pain ?? "general"}
      />
      <div className={styles.container}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className={styles.lead}>{copy.intro}</p>
            <div className={styles.actions}>
              <Button nativeButton={false} role="link" render={<Link href="#aanmelden" />}>
                {copy.join}
              </Button>
              {links.map((link) => (
                <Button
                  key={link.path}
                  nativeButton={false}
                  role="link"
                  variant="outline"
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix(link.path, locale)}
                      locale={locale}
                      pagePath={sourcePath}
                      section={link.section}
                      ctaLabel={link.label}
                    />
                  }
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </div>
          <Image src="/illustrations/05-gravel.webp" alt={copy.image} width={600} height={440} priority />
        </header>
        <section className={styles.why}>
          <p className={styles.eyebrow}>{copy.whyEyebrow}</p>
          <h2>{copy.why}</h2>
          <p>{copy.whyIntro}</p>
          <div className={styles.reasons}>
            {copy.reasons.map((reason) => (
              <article key={reason.title}>
                <h3>{reason.title}</h3>
                <p>{reason.body}</p>
              </article>
            ))}
          </div>
        </section>
        <div className={styles.formLayout} id="aanmelden">
          <section className={styles.formCard} aria-labelledby="case-study-form-title">
            <h2 id="case-study-form-title">{copy.formTitle}</h2>
            <p>{copy.formIntro}</p>
            <CaseStudyRecruitmentForm
              locale={locale}
              sourcePath={sourcePath}
              painSlug={pain}
              copy={copy.form}
            />
          </section>
          <aside className={styles.side}>
            <section>
              <h2>{copy.helpTitle}</h2>
              <p>{copy.helpIntro}</p>
              <ul>{copy.help.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section className={styles.expectation}>
              <h2>{copy.expectations}</h2>
              <p>{copy.expectationIntro}</p>
              <ul>{copy.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section>
              <h2>{copy.contextTitle}</h2>
              <p>{copy.contextIntro}</p>
              <Button
                nativeButton={false}
                role="link"
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/guides", locale)}
                    locale={locale}
                    pagePath={sourcePath}
                    section="case_study_sidebar_guides_cta"
                    ctaLabel={copy.guides}
                  />
                }
              >
                {copy.guides}
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
