import Link from "next/link";
import type { Messages } from "@/i18n/getDictionary";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card, CardContent } from "@/components/prototyper-ui/ui/card";
import { PublicSection } from "@/components/public/PublicSection";
import type { Locale } from "@/i18n/config";
import { HOME_QUOTES_SECTION_COPY } from "@/content/homeQuotes";
import { HOME_TESTIMONIALS } from "./homeRedesignContent";

type TestimonialBase = {
  name: string;
  initials: string;
  bikeContext: string;
  result: string;
  quote: string;
  photoUrl?: string;
};

type TestimonialSectionCopy = Messages["home"]["homepageRedesign"]["testimonials"] & {
  eyebrow?: string;
  badgeLabel?: string;
};

type TestimonialSectionProps = {
  locale: Locale;
  copy?: TestimonialSectionCopy;
  testimonials?: readonly TestimonialBase[];
  readMoreHref?: string;
  className?: string;
};

type TestimonialCardProps = TestimonialBase;
type TestimonialCardWithMetaProps = TestimonialCardProps & {
  badgeLabel: string;
};

export function TestimonialCard({
  name,
  initials,
  bikeContext,
  result,
  quote,
  photoUrl,
  badgeLabel,
}: TestimonialCardWithMetaProps) {
  return (
    <Card
      variant="secondary"
      className="h-full gap-0 overflow-hidden rounded-[14px] border border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] shadow-[0_16px_40px_-28px_color-mix(in_oklch,var(--foreground)_24%,transparent)]"
    >
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name}
              className="h-12 w-12 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--primary)]/25 bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)] shadow-[0_16px_36px_-24px_color-mix(in_oklch,var(--primary)_78%,transparent)] ring-2 ring-background/75">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-[color:var(--foreground)]">
              {name}
            </p>
            <p className="text-xs leading-5 text-[color:var(--muted-foreground)]">
              {bikeContext}
            </p>
            <p className="mt-2 inline-flex rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_64%,var(--background)_36%)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              {badgeLabel}
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold leading-6 text-[color:var(--primary)]">
          {result}
        </p>
        <blockquote className="text-sm leading-6 italic text-[color:var(--foreground)]/90">
          {quote}
        </blockquote>
      </CardContent>
    </Card>
  );
}

export function TestimonialSection({
  locale,
  copy,
  testimonials,
  readMoreHref,
  className,
}: TestimonialSectionProps) {
  const fallbackCopy = HOME_QUOTES_SECTION_COPY[locale];
  const fallbackTestimonials = HOME_TESTIMONIALS[locale].items;
  const sectionCopy = copy ?? {
    eyebrow: HOME_TESTIMONIALS[locale].eyebrow,
    title: fallbackCopy.title,
    subtitle: fallbackCopy.subtitle,
    readMoreLabel: fallbackCopy.readMoreLabel,
    badgeLabel: HOME_TESTIMONIALS[locale].badgeLabel,
    items: fallbackTestimonials,
  };
  const sectionTestimonials = testimonials ?? fallbackTestimonials;

  if (sectionTestimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-[color:color-mix(in_oklch,var(--muted)_44%,var(--background)_56%)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PublicSection
          className={className}
          header={{
            eyebrow: "eyebrow" in sectionCopy ? sectionCopy.eyebrow : HOME_TESTIMONIALS[locale].eyebrow,
            title: sectionCopy.title,
            description: sectionCopy.subtitle,
            align: "center",
          }}
          contentClassName="pt-8"
        >
          <div className="grid gap-6 md:grid-cols-3">
            {sectionTestimonials.map((testimonial) => (
              <TestimonialCard
                key={`${testimonial.name}-${testimonial.initials}`}
                {...testimonial}
                badgeLabel={sectionCopy.badgeLabel ?? HOME_TESTIMONIALS[locale].badgeLabel}
              />
            ))}
          </div>
          {readMoreHref ? (
            <div className="mt-8 text-center">
              <Button
                variant="link"
                className="text-sm font-semibold"
                render={<Link href={readMoreHref} />}
              >
                {sectionCopy.readMoreLabel}
              </Button>
            </div>
          ) : null}
        </PublicSection>
      </div>
    </section>
  );
}
