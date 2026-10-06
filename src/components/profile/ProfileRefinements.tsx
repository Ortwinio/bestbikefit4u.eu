"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import type { getAccess } from "../../../shared/pricing/access";
import { REFINEMENT_RULES } from "../../../shared/profileScore";
import { PROFILE_OBSERVATION_FIELDS } from "../../../shared/profileObservationFields";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { getProfileProvenanceCopy } from "@/i18n/account/profileProvenance";
import { withLocalePrefix } from "@/i18n/navigation";
import { BikeNumberField } from "@/components/bikes/BikeFormControls";
import { saveObservation } from "./ProfileProvenanceModel";

export function ProfileRefinements({ locale, profile, access }: {
  locale: Locale;
  profile: Doc<"profiles">;
  access: ReturnType<typeof getAccess> | null | undefined;
}) {
  const copy = getPricingAccessCopy(locale);
  const provenance = getProfileProvenanceCopy(locale);
  const save = useMutation(saveObservation);
  const remove = useMutation(api.profiles.mutations.removePaidField);
  const [draft, setDraft] = useState<{ field: string; value: string; expected: number | null } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <section className="space-y-5 rounded-3xl border border-border bg-card p-5 sm:p-7" aria-label={copy.refinements}>
    <header><h2 className="font-display text-2xl font-bold">{copy.refinements}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.refinementIntro}</p></header>
    {error && <p role="alert">{error}</p>}
    <div className="grid gap-4 md:grid-cols-2">
      {REFINEMENT_RULES.map(rule => {
        const field = rule.fields[0];
        const definition = PROFILE_OBSERVATION_FIELDS[field];
        const value = profile[field];
        const label = copy.fields[field];
        const locked = !access?.fullProfile;
        return <div key={field} className="space-y-3 rounded-2xl border border-border p-4">
          <h3 className="font-semibold">{label}</h3>
          <p className="text-sm text-muted-foreground">{copy.reasons[field]}</p>
          <p className="font-mono text-xl">{value === undefined ? "—" : `${value.toLocaleString(locale)} ${definition.unit}`}</p>
          {locked ? <p className="text-sm text-muted-foreground">{value === undefined ? copy.locked : copy.retained}</p> :
            <Button variant="outline" disabled={pending} onClick={() => {
              setDraft({ field, value: value === undefined ? "" : String(value), expected: value ?? null }); setError(null);
            }}>{value === undefined ? provenance.add : provenance.edit}: {label}</Button>}
          {value !== undefined && <Button variant="ghost" disabled={pending} aria-label={`${copy.remove}: ${label}`}
            onClick={async () => {
              if (pending) return;
              setPending(true); setError(null);
              try { await remove({ field, expectedCurrentValue: value }); setDraft(null); }
              catch { setError(copy.saveError); }
              finally { setPending(false); }
            }}>{copy.remove}</Button>}
          {!locked && draft?.field === field && <form className="space-y-3" onSubmit={async event => {
            event.preventDefault();
            if (pending || !draft.value.trim()) return;
            setPending(true); setError(null);
            try {
              const result = await save({ field, value: Number(draft.value), expectedCurrentValue: draft.expected,
                kind: "measured", method: "single_measurement" });
              if (result.status === "conflict") setError(provenance.conflict);
              else setDraft(null);
            } catch { setError(copy.saveError); }
            finally { setPending(false); }
          }}>
            <BikeNumberField label={`${label} (${definition.unit})`} tooltip={provenance.valueHelp} tooltipLabel={label}
              min={definition.range?.[0]} max={definition.range?.[1]} step={0.1}
              value={draft.value === "" ? null : Number(draft.value)} disabled={pending}
              onChange={value => setDraft({ ...draft, value: value === null ? "" : String(value) })} />
            <div className="flex flex-wrap gap-2"><Button type="submit" disabled={pending}>{provenance.save}</Button>
              <Button type="button" variant="ghost" disabled={pending} onClick={() => setDraft(null)}>{provenance.cancel}</Button></div>
          </form>}
        </div>;
      })}
    </div>
    {access?.enforced && !access.fullProfile && <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring"
      href={withLocalePrefix("/pricing", locale)}>{copy.unlock}</Link>}
  </section>;
}
