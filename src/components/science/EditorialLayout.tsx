import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { ShortAnswer, containsSafetyAdvice } from "@/components/calculators/CalculatorAnswerSection";
import type { Locale } from "@/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui";
import type { PublicHero, PublicSurfaceCard, PublicCtaBand } from "@/components/public";
import type { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { withLocalePrefix } from "@/i18n/navigation";
import { getGuideLinkLabel } from "@/lib/guides/content";
import styles from "./editorial.module.css";

export function EditorialShell({ children }: { children: ReactNode; className?: string }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}

export function EditorialHero({
  eyebrow,
  title,
  description,
  actions,
  illustration,
  className,
  image = "/illustrations/03-cockpit-afstellen.webp",
  imageAlt,
  answerLocale,
}: ComponentProps<typeof PublicHero> & { image?: string; imageAlt: string; answerLocale?: Locale }) {
  return (
    <header className={`${styles.hero} ${className ?? ""}`}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        {answerLocale ? <ShortAnswer text={description} locale={answerLocale} /> : <p className={styles.intro}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.heroArt}>
        <Image src={image} alt={imageAlt} width={720} height={540} priority sizes="(max-width: 760px) 100vw, 40vw" />
        {illustration && <div className={styles.heroCaption}>{illustration}</div>}
      </div>
    </header>
  );
}

export function EditorialSection({
  header,
  children,
  className,
  contentClassName,
  ...props
}: {
  header?: { eyebrow?: string; title: string; description?: string; action?: ReactNode; icon?: ReactNode };
  children: ReactNode;
  contentClassName?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section className={`${styles.section} ${className ?? ""}`} {...props}>
      {header && (
        <div className={styles.sectionHeading}>
          {header.eyebrow && <p className={styles.eyebrow}>{header.eyebrow}</p>}
          <h2>{header.title}</h2>
          {header.description && <p>{header.description}</p>}
          {header.action}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

export function EditorialCard({
  title,
  description,
  leading,
  footer,
  children,
  className,
  titleAs: Title = "h3",
  compact: _compact,
  variant: _variant,
  ...props
}: ComponentProps<typeof PublicSurfaceCard>) {
  return (
    <Card className={`${styles.card} ${className ?? ""}`} {...props}>
      {leading && <div className={styles.badge}>{leading}</div>}
      {title && <Title>{title}</Title>}
      {description && <p>{description}</p>}
      {children}
      {footer}
    </Card>
  );
}

export function EditorialCta({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className,
}: ComponentProps<typeof PublicCtaBand>) {
  return (
    <section className={`${styles.cta} ${className ?? ""}`}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
      <div className={styles.actions}>{actions}</div>
    </section>
  );
}

export function EditorialLinks({ title, links, locale }: ComponentProps<typeof RelatedLinksSection>) {
  return (
    <EditorialSection header={{ title }}>
      <div className={styles.links}>
        {links.map((link) => (
          <Link key={link.href} href={withLocalePrefix(link.href, locale)}>
            <span>
              <strong>{locale === "nl" && link.href.startsWith("/guides/")
                ? getGuideLinkLabel(link.href, locale)
                : link.label}</strong>
              {link.description && <small>{link.description}</small>}
            </span>
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </EditorialSection>
  );
}

export function EditorialFaq({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: readonly { q: string; a: string }[];
}) {
  return (
    <section className={`${styles.section} ${styles.faq}`}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className="mt-3">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.map((item) => containsSafetyAdvice(item.a) ? (
          <section key={item.q} data-usability="safety" className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">{item.q}</h3>
            <p>{item.a}</p>
          </section>
        ) : (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
