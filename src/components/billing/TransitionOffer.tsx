"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Locale } from "@/i18n/config";
import { transitionOfferCopy } from "@/i18n/account/transitionOffer";
import { withLocalePrefix } from "@/i18n/navigation";

export type TransitionStatus = { status: "none" } | { status: "expired" }
  | { status: "upcoming"; goLiveAt: number }
  | { status: "available"; redeemBy: number }
  | { status: "redeemed"; bikeId: string; expiresAt: number };
export type TransitionBike = { _id: string; name: string };
const actionClass = "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm " +
  "font-bold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function TransitionOfferView({ locale, offer, bikes, bikeId, onRedeem }: {
  locale: Locale; offer?: TransitionStatus; bikes: TransitionBike[]; bikeId?: string;
  onRedeem: (bikeId: string) => Promise<unknown>;
}) {
  const copy = transitionOfferCopy[locale];
  const headingId = useId();
  const selectId = useId();
  const [selected, setSelected] = useState(bikeId ?? "");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const pending = useRef(false);
  const bike = bikes.find(item => item._id === (bikeId ?? selected));
  if (!offer || offer.status === "none" || offer.status === "expired" || offer.status === "redeemed") return null;
  if (bikeId && offer.status !== "available") return null;
  const date = new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(offer.status === "upcoming" ? offer.goLiveAt : offer.redeemBy);
  async function redeem() {
    if (!bike || pending.current || offer?.status !== "available") return;
    pending.current = true;
    setBusy(true);
    setError("");
    try { await onRedeem(bike._id); setSuccess(true); }
    catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      setError(message.includes("TRANSITION_OFFER_ALREADY_REDEEMED") ? copy.redeemed
        : message.includes("TRANSITION_OFFER_NOT_FOUND") ? copy.missing
        : message.includes("TRANSITION_OFFER_UNAVAILABLE") ? copy.unavailable : copy.error);
    } finally { pending.current = false; setBusy(false); }
  }
  return <section id={bikeId ? undefined : "transition-offer"} aria-labelledby={headingId}
    className="space-y-4 rounded-3xl border border-border bg-card p-6 text-card-foreground">
    <h2 id={headingId} className="font-display text-2xl font-bold">{copy.title}</h2>
    <p className="text-sm text-muted-foreground">{offer.status === "upcoming" ? copy.upcoming : copy.available} {date}</p>
    {offer.status === "available" && (success ? <p role="status">{copy.success}</p> : <>
      <p className="text-sm">{copy.explanation}</p>
      {!bikes.length ? <><p>{copy.noBikes}</p><Link className={actionClass}
        href={withLocalePrefix("/bikes/new", locale)}>{copy.addBike}</Link></> : <>
        {!bikeId && !confirming && <div className="space-y-2"><label htmlFor={selectId}>{copy.choose}</label>
          <select id={selectId} value={selected} onChange={event => { setSelected(event.target.value); setError(""); }}
            className="block min-h-11 w-full rounded-xl border border-border bg-background p-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <option value="">{copy.choose}</option>
            {bikes.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select></div>}
        {confirming ? <><p>{copy.confirmation} <strong>{bike?.name}</strong>.</p>
          <div className="flex flex-wrap gap-3"><button type="button" className={actionClass} disabled={busy || !bike}
            onClick={() => void redeem()}>{busy ? copy.saving : copy.confirm}</button>
            <button type="button" disabled={busy} className="min-h-11 rounded-full border border-border px-5 py-3 focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => { setConfirming(false); setError(""); }}>{copy.cancel}</button></div></>
          : <button type="button" className={actionClass} disabled={!bike}
            onClick={() => setConfirming(true)}>{bikeId ? copy.useHere : copy.use}</button>}
      </>}
      {error && <p role="alert">{error}</p>}
    </>)}
  </section>;
}

export function TransitionOffer({ locale, bikeId }: { locale: Locale; bikeId?: string }) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.queries.getCurrentUser, isAuthenticated ? {} : "skip");
  const offer = useQuery(api.pricing.queries.getTransitionOffer, isAuthenticated && user ? {} : "skip");
  const bikes = useQuery(api.bikes.queries.listSummariesByUser, isAuthenticated && user ? {} : "skip");
  const redeem = useMutation(api.pricing.mutations.redeemTransitionOffer);
  if (!isAuthenticated || !user || !bikes) return null;
  return <TransitionOfferView key={`${user._id}:${bikeId ?? "dashboard"}`} locale={locale} offer={offer}
    bikes={bikes} bikeId={bikeId} onRedeem={id => redeem({ bikeId: id as Id<"bikes"> })} />;
}
