import Link from "next/link";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import type { Locale } from "@/i18n/config";
import { legalMessages } from "@/i18n/marketing/legal";
import { withLocalePrefix } from "@/i18n/navigation";
import styles from "./LegalPage.module.css";

export type LegalCopy = {
  metadata: { title: string; description: string; keywords: string[] };
  title: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: {
    title: string;
    body?: string;
    bullets?: string[];
    subsections?: { title: string; body: string }[];
    warningTitle?: string;
    warningBody?: string;
  }[];
};

type LegalPageProps = { kind: "privacy" | "terms"; locale: Locale; page: LegalCopy };

export function LegalPage({ kind, locale, page }: LegalPageProps) {
  const copy = legalMessages[locale];
  const cta = kind === "privacy" ? copy.privacyCta : copy.termsCta;
  const description = kind === "privacy" ? copy.privacyDescription : copy.termsDescription;
  const sectionId = (index: number) => `${kind}-${index + 1}`;

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className={styles.intro}>{page.metadata.description}</p>
        <p className={styles.date}>
          {page.lastUpdatedLabel}: {page.lastUpdatedDate}
        </p>
        <nav className={styles.types} aria-label={copy.navigation}>
          {(["privacy", "terms"] as const).map((type) => (
            <Link
              key={type}
              href={withLocalePrefix(`/${type}`, locale)}
              aria-current={kind === type ? "page" : undefined}
            >
              {copy[type]}
            </Link>
          ))}
        </nav>
      </header>
      <div className={styles.layout}>
        <nav className={styles.toc} aria-label={copy.contents}>
          <h2>{copy.contents}</h2>
          <ol>
            {page.sections.map((section, index) => (
              <li key={section.title}>
                <a href={`#${sectionId(index)}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <article className={styles.article} aria-label={page.title}>
          {page.sections.map((section, index) => {
            const splitAt = section.title.indexOf(" ");
            return (
              <section key={section.title} id={sectionId(index)} className={styles.section}>
                <h2>
                  <span className={styles.number}>{section.title.slice(0, splitAt)}</span>{" "}
                  <span>{section.title.slice(splitAt + 1)}</span>
                </h2>
                {section.warningTitle ? (
                  <div className={styles.warning}>
                    <p>
                      <strong>{section.warningTitle}</strong>
                    </p>
                    {section.warningBody ? <p>{section.warningBody}</p> : null}
                  </div>
                ) : null}
                {section.body ? <p>{section.body}</p> : null}
                {section.subsections?.map((sub) => (
                  <div key={sub.title} className={styles.subsection}>
                    <h3>{sub.title}</h3>
                    <p>{sub.body}</p>
                  </div>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </article>
      </div>
      <section className={styles.cta}>
        <div>
          <h2>{cta}</h2>
          <p>{description}</p>
        </div>
        <TrackedCtaLink
          href={withLocalePrefix(kind === "privacy" ? "/calculators/bike-fit" : "/", locale)}
          locale={locale}
          pagePath={withLocalePrefix(`/${kind}`, locale)}
          section={`${kind}_footer_cta`}
          ctaLabel={cta}
          className={styles.ctaLink}
        >
          {cta}
          <span aria-hidden="true"> →</span>
        </TrackedCtaLink>
      </section>
    </div>
  );
}
