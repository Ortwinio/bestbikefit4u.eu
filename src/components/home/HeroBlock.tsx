import { AlertCircle, CheckCircle2, Ruler } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card } from "@/components/prototyper-ui/ui/card";
import { RatingBadge } from "@/components/public/RatingBadge";
import type { Locale } from "@/i18n/config";
import { HOME_HERO_MICROCOPY, HOME_HERO_PROOF_CARDS } from "./homeRedesignContent";
import { HeroBackground } from "./HeroBackground";

type HeroBlockProps = {
  locale: Locale;
  homePath: string;
  fitHref: string;
  pricingHref: string;
  loginHref: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  ratingValue?: string;
  ratingCount?: string;
};

export function HeroBlock({
  locale,
  homePath,
  fitHref,
  pricingHref,
  loginHref,
  title,
  titleAccent,
  description,
  primaryCta,
  secondaryCta,
  ratingValue,
  ratingCount,
}: HeroBlockProps) {
  const microcopy = HOME_HERO_MICROCOPY[locale];
  const proofCards = HOME_HERO_PROOF_CARDS[locale];

  const proofIcons = {
    check: CheckCircle2,
    ruler: Ruler,
    alert: AlertCircle,
  } as const;

  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <HeroBackground posterSrc="/bestbikefit4u-home-poster.jpg" />
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-primary-foreground/20 bg-black/35 px-6 py-10 text-center shadow-2xl backdrop-blur-sm sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
            {locale === "nl" ? "Persoonlijke bike fit, overal" : "Personal bike fit, anywhere"}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl">
            {title}
            <span className="block text-primary-foreground/80">{titleAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-primary-foreground/90">
            {description}
          </p>
          <p className="mt-4 text-sm font-medium text-primary-foreground/80">
            {microcopy.trustLine}
          </p>
          {ratingValue && ratingCount ? (
            <div className="mt-4 flex justify-center">
              <RatingBadge rating={ratingValue} count={ratingCount} variant="light" />
            </div>
          ) : null}
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="min-h-12 rounded-full px-6 text-base"
              render={
                <TrackedCtaLink
                  href={fitHref}
                  locale={locale}
                  pagePath={homePath}
                  section="hero_primary"
                  ctaLabel={primaryCta}
                />
              }
            >
              {primaryCta}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-h-12 rounded-full border-white/55 bg-white/15 px-6 text-base text-[color:oklch(0.18_0_0)] shadow-[0_12px_32px_-18px_color-mix(in_oklch,var(--foreground)_28%,transparent)] after:bg-white/10 hover-only:border-white/70 hover-only:bg-white/22 hover-only:text-[color:oklch(0.18_0_0)]"
              render={
                <TrackedCtaLink
                  href={pricingHref}
                  locale={locale}
                  pagePath={homePath}
                  section="hero_secondary"
                  ctaLabel={secondaryCta}
                />
              }
            >
              {secondaryCta}
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/72">
            {microcopy.ctaNote}
          </p>
          <p className="mt-4 text-sm text-primary-foreground/60">
            <TrackedCtaLink
              href={loginHref}
              locale={locale}
              pagePath={homePath}
              section="hero_tertiary"
              ctaLabel={
                locale === "nl" ? "Heb je al een account? Log in" : "Already have an account? Sign in"
              }
              className="underline underline-offset-2 hover:text-primary-foreground/80"
            >
              {locale === "nl" ? "Heb je al een account? Log in" : "Already have an account? Sign in"}
            </TrackedCtaLink>
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {proofCards.map((item) => {
              const Icon = proofIcons[item.icon];

              return (
                <Card
                  key={item.title}
                  className="border border-primary-foreground/18 bg-primary-foreground/10 px-4 py-4 text-primary-foreground shadow-none backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/12 text-primary-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-primary-foreground/76">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
