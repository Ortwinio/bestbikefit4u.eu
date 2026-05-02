import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card } from "@/components/prototyper-ui/ui/card";
import type { Locale } from "@/i18n/config";

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
}: HeroBlockProps) {
  return (
    <section className="relative overflow-hidden bg-[url('/bestbikefit4u-home.gif')] bg-cover bg-center bg-no-repeat py-24 sm:py-28">
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
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
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
              className="min-h-12 rounded-full border-primary-foreground/25 bg-[color:color-mix(in_oklch,var(--background)_88%,white_12%)] px-6 text-base text-[color:var(--foreground)] shadow-[0_12px_32px_-18px_color-mix(in_oklch,var(--foreground)_28%,transparent)] after:bg-[color:color-mix(in_oklch,var(--background)_92%,white_8%)] hover-only:after:bg-[color:color-mix(in_oklch,var(--muted)_70%,var(--background)_30%)]"
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
          <div className="mt-8 grid gap-3 text-left text-sm text-primary-foreground/80 sm:grid-cols-3">
            <Card className="border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-primary-foreground shadow-none">
              {locale === "nl"
                ? "Onderbouwde berekeningen, geen giswerk."
                : "Method-backed calculations, not guesswork."}
            </Card>
            <Card className="border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-primary-foreground shadow-none">
              {locale === "nl"
                ? "Zadelhoogte, reach en drop in millimeters."
                : "Saddle height, reach, and drop in millimeters."}
            </Card>
            <Card className="border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-primary-foreground shadow-none">
              {locale === "nl"
                ? "Eerlijk over wat online fitting wel en niet kan."
                : "Transparent about what online fitting can and cannot do."}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
