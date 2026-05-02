import Link from "next/link";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicCtaBand } from "@/components/public/PublicCtaBand";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import type { Locale } from "@/i18n/config";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { cn } from "@/utils/cn";

type CtaRepeatProps = {
  locale: Locale;
  pagePath: string;
  fitHref: string;
  campaignActive: boolean;
  startLabel: string;
  campaign?: {
    heading: string;
    subtext: string;
    donationUrl: string;
    donateLabel: string;
    footnote: string;
  };
  nonCampaign?: {
    heading: string;
    subtext: string;
    pricingHref: string;
    pricingLabel: string;
  };
  className?: string;
};

export function CtaRepeat({
  locale,
  pagePath,
  fitHref,
  campaignActive,
  startLabel,
  campaign,
  nonCampaign,
  className,
}: CtaRepeatProps) {
  const heading = campaignActive ? campaign?.heading : nonCampaign?.heading;
  const subtext = campaignActive ? campaign?.subtext : nonCampaign?.subtext;

  if (!heading || !subtext) {
    return null;
  }

  return (
    <PublicCtaBand
      className={cn("border border-[color:var(--border)]/80", className)}
      title={heading}
      description={subtext}
      actions={
        campaignActive && campaign ? (
          <CampaignCtaGroup
            locale={locale}
            pagePath={pagePath}
            startHref={fitHref}
            startSection="homepage_cta_primary"
            donateHref={campaign.donationUrl}
            donateSection="homepage_cta_secondary"
            startLabel={startLabel}
            donateLabel={campaign.donateLabel}
            buttonSize="lg"
          />
        ) : nonCampaign ? (
          <>
            <Button
              size="lg"
              render={
                <TrackedCtaLink
                  href={fitHref}
                  locale={locale}
                  pagePath={pagePath}
                  section="homepage_cta_primary"
                  ctaLabel={startLabel}
                />
              }
            >
              {startLabel}
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href={nonCampaign.pricingHref} />}
            >
              {nonCampaign.pricingLabel}
            </Button>
          </>
        ) : null
      }
      aside={campaignActive && campaign ? campaign.footnote : undefined}
    />
  );
}
