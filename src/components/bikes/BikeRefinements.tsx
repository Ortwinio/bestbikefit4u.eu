"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { BIKE_REFINEMENT_RULES } from "../../../shared/profileScore";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { withLocalePrefix } from "@/i18n/navigation";
import { bikeProfileValue } from "./bikeProfileModel";

export function BikeRefinements({ bike, locale, locked }: { bike: Doc<"bikes">; locale: Locale; locked: boolean }) {
  const copy = getPricingAccessCopy(locale);
  const remove = useMutation(api.bikes.profile.removeRefinement);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return <section id="bike-refinements" className="space-y-5 rounded-3xl border border-border bg-card p-5 sm:p-7" aria-label={copy.refinements}>
    <header><h2 className="font-display text-2xl font-bold">{copy.refinements}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.refinementIntro}</p></header>
    {error && <p role="alert">{copy.saveError}</p>}
    <div className="grid gap-4 md:grid-cols-2">
      {BIKE_REFINEMENT_RULES.map(rule => {
        const field = rule.key === "gears" ? "gearing" : rule.fields[0];
        const value = bikeProfileValue(bike, field);
        const present = rule.key === "gears" ? Boolean(bike.gearing?.chainrings?.length || bike.gearing?.cassetteTeeth?.length) : value !== undefined;
        const label = copy.bikeFields[rule.key];
        const display = rule.key === "gears"
          ? [bike.gearing?.chainrings?.join("/"), bike.gearing?.cassetteTeeth?.join("/")].filter(Boolean).join(" · ") || "—"
          : typeof value === "number" ? `${value.toLocaleString(locale)} ${rule.key === "seatAngle" || rule.key === "headAngle" ? "°" : "mm"}` : "—";
        return <div key={rule.key} className="min-w-0 space-y-3 rounded-2xl border border-border p-4">
          <h3 className="font-semibold">{label}</h3>
          <p className="break-words font-mono text-xl">{display}</p>
          <p className="text-sm text-muted-foreground">{copy.bikeReasons[rule.key]}</p>
          {locked ? <p className="text-sm text-muted-foreground">{present ? copy.retained : copy.locked}</p> :
            <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring"
              href={rule.key === "gears"
                ? `${withLocalePrefix(`/bikes/${bike._id}/edit`, locale)}#bike-settings-gearing` : `#bike-profile-${rule.key}`}>
              {copy.editBike}: {label}
            </Link>}
          {present && <Button variant="ghost" disabled={pending} aria-label={`${copy.remove}: ${label}`}
            onClick={async () => {
              if (pending) return;
              setPending(true); setError(false);
              try { await remove({ bikeId: bike._id, field, expectedCurrentValue: value }); }
              catch { setError(true); }
              finally { setPending(false); }
            }}>{copy.remove}</Button>}
        </div>;
      })}
    </div>
    {locked && <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring"
      href={withLocalePrefix(`/checkout?product=single&bikeId=${bike._id}`, locale)}>{copy.unlock}</Link>}
  </section>;
}
