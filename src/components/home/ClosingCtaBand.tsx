import { CheckCircle2 } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card, CardContent } from "@/components/prototyper-ui/ui/card";
import type { Locale } from "@/i18n/config";
import { HOME_CLOSING_CTA_CONTENT } from "./homeRedesignContent";

type ClosingCtaBandProps = {
  locale: Locale;
  homePath: string;
  fitHref: string;
  pricingHref: string;
  campaignActive: boolean;
  campaign: {
    startFreeCta: string;
    donateCta: string;
    donationUrl: string;
    optionalNote: string;
  };
  recommendation: {
    title: string;
    description: string;
    items: string[];
  };
  cta: {
    title: string;
    description: string;
    button: string;
  };
};

export function ClosingCtaBand({
  locale,
  homePath,
  fitHref,
  pricingHref,
  campaignActive,
  campaign,
  recommendation,
  cta,
}: ClosingCtaBandProps) {
  const content = HOME_CLOSING_CTA_CONTENT[locale];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="items-center gap-10 border border-border/70 bg-card/95 p-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:p-10">
          <CardContent className="max-w-2xl p-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
              {content.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              {recommendation.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {recommendation.description}
            </p>
            <ul className="mt-8 space-y-4">
              {recommendation.items.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <div className="mt-12 lg:mt-0">
            <Card className="public-cta-surface gap-0 rounded-[1.75rem] border p-8 text-foreground shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {content.eyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-bold">
                {cta.title}
              </h3>
              <p className="mt-4 text-[color:var(--muted-foreground)]">
                {cta.description}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {campaignActive ? (
                  <>
                    <CampaignCtaGroup
                      locale={locale}
                      pagePath={homePath}
                      startHref={fitHref}
                      startSection="final_cta_primary"
                      donateHref={campaign.donationUrl}
                      donateSection="final_cta_secondary"
                      startLabel={campaign.startFreeCta}
                      donateLabel={campaign.donateCta}
                      buttonSize="lg"
                      className="items-start"
                    />
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {campaign.optionalNote}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      className="min-h-12 rounded-full px-6 text-base"
                      render={
                        <TrackedCtaLink
                          href={fitHref}
                          locale={locale}
                          pagePath={homePath}
                          section="final_cta_primary"
                          ctaLabel={cta.button}
                        />
                      }
                    >
                      {cta.button}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="min-h-12 rounded-full px-6 text-base"
                      render={
                        <TrackedCtaLink
                          href={pricingHref}
                          locale={locale}
                          pagePath={homePath}
                          section="final_cta_secondary"
                          ctaLabel={content.pricingLabel}
                        />
                      }
                    >
                      {content.pricingLabel}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </section>
  );
}
