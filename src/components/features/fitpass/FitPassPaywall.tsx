"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import {
  COMMERCIAL_CURRENCY,
  FIT_PASS_PRODUCT,
  formatEuroPriceFromCents,
} from "@/config/commercial";

interface FitPassPaywallProps {
  locale: string;
  sessionId: string;
  userTier: string | undefined | null;
}

export function FitPassPaywall({
  locale,
  sessionId,
  userTier,
}: FitPassPaywallProps) {
  const logMarketingEvent = useMarketingEventLogger();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userTier === "pro" || userTier === "premium") {
    return null;
  }

  const isNl = locale === "nl";
  const pagePath = `${isNl ? "/nl" : ""}/fit/${sessionId}/results`;
  const priceLabel = formatEuroPriceFromCents(
    FIT_PASS_PRODUCT.priceCents,
    isNl ? "nl" : "en"
  );

  useEffect(() => {
    logMarketingEvent({
      eventType: "fit_pass_paywall_view",
      locale: isNl ? "nl" : "en",
      pagePath,
      section: "fit_pass_paywall",
      valueCents: FIT_PASS_PRODUCT.priceCents,
      currency: COMMERCIAL_CURRENCY,
    });
  }, [isNl, logMarketingEvent, pagePath]);

  const features = isNl
    ? [
        "Volledige fittabel met doelwaarden per onderdeel",
        "Praktische aanpasvolgorde voor deze fiets",
        "PDF-download en e-mailrapport voor deze sessie",
        "Bandenspanningscontext en 14-daags validatieplan",
      ]
    : [
        "Full fit table with target values by component",
        "Practical adjustment sequence for this bike",
        "PDF download and email delivery for this session",
        "Tire pressure context and a 14-day validation plan",
      ];

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    logMarketingEvent({
      eventType: "fit_pass_checkout_started",
      locale: isNl ? "nl" : "en",
      pagePath,
      section: "fit_pass_paywall",
      ctaLabel: FIT_PASS_PRODUCT.copy[isNl ? "nl" : "en"].cta,
      valueCents: FIT_PASS_PRODUCT.priceCents,
      currency: COMMERCIAL_CURRENCY,
    });
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, locale, productKey: "fit_pass" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isNl
            ? "Er ging iets mis. Probeer het opnieuw."
            : "Something went wrong. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-5 py-3 text-sm">
        <button
          onClick={() => setIsExpanded(true)}
          className="text-[color:var(--primary)] hover:underline"
        >
          {isNl ? "Ontgrendel het volledige rapport →" : "Unlock the full report →"}
        </button>
      </div>
    );
  }

  return (
    <Card
      variant="bordered"
      className="mt-6 overflow-hidden border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))]"
    >
      <CardContent className="px-6 py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
          {FIT_PASS_PRODUCT.copy[isNl ? "nl" : "en"].name}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">
          {FIT_PASS_PRODUCT.copy[isNl ? "nl" : "en"].title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
          {FIT_PASS_PRODUCT.copy[isNl ? "nl" : "en"].description}
        </p>

        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-[color:var(--muted-foreground)]"
            >
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-2xl font-bold text-[color:var(--foreground)]">
          {priceLabel}
          <span className="ml-2 text-sm font-medium text-[color:var(--muted-foreground)]">
            {isNl ? "eenmalig voor deze sessie" : "one-time for this session"}
          </span>
        </p>

        {error ? (
          <p className="mt-3 text-sm text-[color:var(--destructive)]">{error}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={handleUpgrade} isLoading={isLoading}>
            {FIT_PASS_PRODUCT.copy[isNl ? "nl" : "en"].cta}
          </Button>
          <button
            onClick={handleDismiss}
            className="text-sm text-[color:var(--muted-foreground)] hover:underline"
          >
            {isNl ? "Misschien later" : "Maybe later"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
