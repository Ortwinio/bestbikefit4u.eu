"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { isPaidAccessEnforced } from "../../../../shared/pricing/flags";
import { fitPassAccessCopy } from "@/i18n/marketing/fitPassAccess";
import { Button } from "@/components/prototyper-ui/ui/button";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";

interface FitPassLandingCtaProps {
  locale: string;
  label: string;
  loadingLabel?: string;
  alreadyActiveLabel: string;
  loginHref: string;
  dashboardHref: string;
}

export function FitPassLandingCta({
  locale,
  label,
  loadingLabel,
  loginHref,
  dashboardHref,
}: FitPassLandingCtaProps) {
  const user = useQuery(api.users.queries.getCurrentUser);
  const enforced = isPaidAccessEnforced();
  const access = useQuery(api.pricing.queries.getAccess, enforced && user ? {} : "skip");
  const isNl = locale === "nl";
  const copy = fitPassAccessCopy[isNl ? "nl" : "en"];
  const campaignActive = !enforced && isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(isNl ? "nl" : "en");
  const annualActive = enforced && Boolean(user) && access?.fullReport === true && access.maxBikes === null
    && (access.productId === "annual" || access.productId === "annual_entry" || access.productId === "annual_personal");
  const legacyActive = !enforced && (user?.tier === "pro" || user?.tier === "premium");

  if (user === undefined || (enforced && user && access === undefined)) {
    return (
      <Button disabled className="min-w-[200px]">
        {loadingLabel ?? label}
      </Button>
    );
  }

  if (annualActive || legacyActive) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-[color:var(--success)]/15 px-4 py-1.5 text-sm font-medium text-[color:var(--success)]">
          {annualActive ? copy.annualActive : copy.legacyActive}
        </div>
        {annualActive && <p className="text-center">{copy.annualDescription}</p>}
        <Button render={<Link href={dashboardHref} />} nativeButton={false} role="link" variant="outline">
          {copy.dashboard}
        </Button>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (campaignActive) {
      return (
        <CampaignCtaGroup
          locale={isNl ? "nl" : "en"}
          pagePath={loginHref}
          startHref={loginHref}
          startSection="fit_pass_landing_campaign_start"
          donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
          donateSection="fit_pass_landing_campaign_donate"
          startLabel={campaign.startFreeCta}
        />
      );
    }
    return (
      <Button render={<Link href={`/${isNl ? "nl" : "en"}/checkout?product=single`} />}
        nativeButton={false} role="link">
        {label}
      </Button>
    );
  }

  if (campaignActive) {
    return (
      <CampaignCtaGroup
        locale={isNl ? "nl" : "en"}
        pagePath={dashboardHref}
        startHref={dashboardHref}
        startSection="fit_pass_landing_campaign_dashboard"
        donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
        donateSection="fit_pass_landing_campaign_donate"
        startLabel={campaign.continueFreeCta}
      />
    );
  }

  // Choices and withdrawal consent are collected by the shared checkout flow.
  return (
    <Button render={<Link href={`/${isNl ? "nl" : "en"}/checkout?product=single`} />}
      nativeButton={false} role="link" className="min-w-[200px]">
      {label}
    </Button>
  );
}
