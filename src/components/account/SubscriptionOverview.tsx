"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, LoadingState, SectionHeader, StatRow } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { subscriptionCopy } from "@/i18n/account/subscription";
import { withLocalePrefix } from "@/i18n/navigation";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";
import { PRODUCTS } from "../../../shared/pricing/products";

export type SubscriptionOverviewDetails = {
  plan: "free" | "single" | "annual" | "personal";
  bikeName?: string;
  expiresAt?: number;
  startsAt?: number;
  periodPriceCents?: number;
  renewed?: boolean;
  cancelled?: boolean;
  introEligible?: boolean;
  enforced?: boolean;
  appointmentAvailable?: boolean;
};

export function SubscriptionOverview({ locale, subscription }: {
  locale: Locale;
  subscription: SubscriptionOverviewDetails | null | undefined;
}) {
  const copy = subscriptionCopy[locale];
  const confirmationId = useId();
  const [confirming, setConfirming] = useState(false);
  const [stubMessage, setStubMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const cancelSubscription = async () => {
    setCancelling(true);
    setStubMessage(null);
    try {
      sessionStorage.setItem("bbf-subscription-cancellation-choice", JSON.stringify({
        action: "cancel",
        locale,
      }));
      const response = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const result = await response.json();
      setStubMessage(result.code === "STRIPE_NOT_IMPLEMENTED"
        ? stripeNotImplemented(locale).message : copy.cancelFailed);
    } catch {
      setStubMessage(copy.cancelFailed);
    } finally {
      setCancelling(false);
    }
  };
  const date = (timestamp: number | undefined) => timestamp === undefined ? undefined :
    new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam",
    }).format(timestamp);
  const annual = subscription?.plan === "annual" || subscription?.plan === "personal";
  const renewalPrice = subscription?.periodPriceCents === PRODUCTS.annual.priceCents && subscription.renewed === false
    ? `${copy.renewalPrice} (${copy.renewalDiscount})` : copy.renewalPrice;
  const cancelCopy = subscription?.renewed === undefined ? copy.cancelUnknown :
    subscription.renewed ? copy.cancelRenewed : copy.cancelFirst;

  return (
    <Card variant="bordered" className="rounded-3xl border-border bg-card shadow-none">
      <SectionHeader title={copy.title} />
      <CardContent className="space-y-4 text-sm text-foreground">
        {subscription === undefined ? <LoadingState label={copy.loading} /> :
          subscription === null ? <p role="status">{copy.unavailable}</p> : <>
            {subscription.plan === "free" ? <p>{subscription.enforced === false ? copy.freeOpenDescription : copy.freeDescription}</p> : null}
            <dl className="rounded-2xl border border-border bg-muted/40 p-4 [&_dd]:text-right [&_dd]:break-words">
              <StatRow label={copy.currentPlan} value={`${copy[subscription.plan]}${subscription.cancelled ? ` · ${copy.cancelled}` : ""}`} />
              {subscription.plan === "free" ? <StatRow label={copy.cost} value="€0" /> : null}
              {subscription.plan === "single" ? <>
                <StatRow label={copy.bike} value={subscription.bikeName} />
                <StatRow label={copy.accessUntil} value={date(subscription.expiresAt)} />
              </> : null}
              {annual ? <>
                <StatRow label={subscription.renewed === undefined ? copy.period : subscription.renewed ? copy.renewedYear : copy.firstYear}
                  value={subscription.periodPriceCents === undefined ? undefined : new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-IE", { style: "currency", currency: "EUR" }).format(subscription.periodPriceCents / 100)} />
                <StatRow label={copy.started} value={date(subscription.startsAt)} />
                <StatRow label={copy.periodEnd} value={date(subscription.expiresAt)} />
                {!subscription.cancelled ? <StatRow label={copy.renewal} value={[date(subscription.expiresAt), renewalPrice].filter(Boolean).join(" · ")} /> : null}
              </> : null}
            </dl>
            {subscription.plan === "single" ? <p className="text-muted-foreground">{copy.singleDescription}</p> : null}
            {annual && !subscription.cancelled ? <>
              <p className="text-muted-foreground">{copy.reminder}</p>
              {subscription.plan === "personal" ? <p className="text-muted-foreground">{copy.personalRenewal}</p> : null}
              <Button variant="outline" disabled={cancelling} aria-expanded={confirming} aria-controls={confirmationId}
                onClick={() => { setConfirming(!confirming); setStubMessage(null); }}>{copy.cancel}</Button>
              {confirming ? <section id={confirmationId} aria-label={copy.cancelTitle}
                className="space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
                <h3 className="font-semibold">{copy.cancelTitle}</h3>
                <p>{cancelCopy}</p>
                <div className="flex flex-wrap gap-3">
                  <Button isLoading={cancelling} onClick={() => void cancelSubscription()}>{copy.confirm}</Button>
                  <Button variant="outline" disabled={cancelling} onClick={() => { setConfirming(false); setStubMessage(null); }}>{copy.keep}</Button>
                </div>
                {stubMessage ? <div role="status" className="space-y-2">
                  <p>{stubMessage}</p><p>{copy.notCancelled}</p>
                </div> : null}
              </section> : null}
            </> : null}
            {subscription.cancelled ? <p className="text-muted-foreground">{subscription.enforced === false ? copy.cancelledOpenDescription : copy.cancelledDescription}</p> : null}
            {subscription.appointmentAvailable === true ? <Link
              className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
              href={withLocalePrefix("/checkout?appointment=1", locale)}>
              {copy.planAppointment}
            </Link> : null}
            {!annual || subscription.cancelled ? <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
              href={withLocalePrefix("/pricing", locale)}>
              {subscription.plan === "single" && subscription.introEligible ? copy.intro : copy.prices}
            </Link> : null}
            <p className="text-xs text-muted-foreground">{copy.vat}</p>
          </>}
      </CardContent>
    </Card>
  );
}
