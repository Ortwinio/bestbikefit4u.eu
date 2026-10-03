"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { AdviceGroup, AdviceItem, AdviceSource } from "../../../../../shared/advice/types";
import type { PerformedInput, FeedbackInput } from "@/components/profile/AdviceProgressActions";
import { AdviceGroupsView } from "@/components/profile/AdviceGroupsView";
import { ProfileSectionTabs } from "@/components/profile/ProfileSectionTabs";
import { Button } from "@/components/ui";
import { advicePageCopy } from "@/i18n/account/advicePage";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { api } from "../../../../../convex/_generated/api";
import { isPaidAccessEnforced } from "../../../../../shared/pricing/flags";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";

export type RecalculationResult = { items: Array<{ source: string; id: string;
  status: "updated" | "pending" | "skipped" | "failed"; reason?: string; replacementId?: string }> };
const listAdviceGroups = makeFunctionReference<"query", Record<string, never>, AdviceGroup[]>("advice/queries:listAdviceGroups");
const listBikes = makeFunctionReference<"query", Record<string, never>, Array<{ _id: string; name: string }>>(
  "bikes/queries:listSummariesByUser",
);
const recalculateAll = makeFunctionReference<"mutation", Record<string, never>, RecalculationResult>(
  "advice/mutations:recalculateAll",
);
const recordInterest = makeFunctionReference<"mutation", { calculator: string }, null>("profiles/mutations:recordPromptInterest");
const currentUser = makeFunctionReference<"query", Record<string, never>, { _id: string } | null>("users/queries:getCurrentUser");
type ProgressIdentity = { source: AdviceSource; recordId: string; key: string; expectedRevision: number; expectedUserId: string };
const markPerformed = makeFunctionReference<"mutation", ProgressIdentity & PerformedInput, unknown>("advice/progress:markPerformed");
const submitFeedback = makeFunctionReference<"mutation", ProgressIdentity & FeedbackInput, unknown>("advice/progress:submitFeedback");
const calculatorFor: Record<string, string> = {
  saddleHeightMm: "bike-fit", saddleSetbackMm: "bike-fit", handlebarDropMm: "bike-fit",
  handlebarReachMm: "bike-fit", stemLengthMm: "bike-fit", handlebarWidthMm: "bike-fit",
  crankLengthMm: "bike-fit", recommendedStackMm: "bike-fit", recommendedReachMm: "bike-fit",
  saddleWidthMm: "saddle-width", gearRangePercent: "gearing", pressureFrontBar: "tire-pressure",
  pressureRearBar: "tire-pressure", speed: "power-speed", power: "power-speed", ftp: "ftp-wkg",
  wattsPerKg: "ftp-wkg", climbPower: "climb-planner", fluid: "fuel-hydration", carbohydrate: "fuel-hydration",
  crankLength: "crank-length", saddleHeight: "saddle-height", frameSize: "frame-size",
  saddleSetback: "bike-fit", barDrop: "bike-fit", saddleToBarReach: "bike-fit",
  frameStack: "bike-fit", frameReach: "bike-fit",
};
const calculatorKeys = ["saddle-height", "bike-fit", "frame-size", "crank-length", "power-speed",
  "climb-planner", "ftp-wkg", "fuel-hydration"];

export function AdvicePageClient({ locale }: { locale: Locale }) {
  const copy = advicePageCopy[locale];
  const { isAuthenticated } = useConvexAuth();
  const access = useQuery(api.pricing.queries.getAccess, isAuthenticated && isPaidAccessEnforced() ? {} : "skip");
  const pricing = getPricingAccessCopy(locale);
  const groups = useQuery(listAdviceGroups, isAuthenticated ? {} : "skip");
  const bikes = useQuery(listBikes, isAuthenticated ? {} : "skip");
  const user = useQuery(currentUser, isAuthenticated ? {} : "skip");
  const perform = useMutation(markPerformed);
  const feedback = useMutation(submitFeedback);
  const recalculate = useMutation(recalculateAll);
  const interest = useMutation(recordInterest);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<RecalculationResult | null>(null);
  const items = groups?.flatMap(group => group.items) ?? [];
  const staleCount = items.filter(item => item.staleness.stale).length;
  const unknownCount = items.filter(item => !item.staleness.stale
    && (item.staleness.status === "unknown" || item.status === "needs_calculation")).length;
  const counts = { updated: 0, pending: 0, skipped: 0, failed: 0 };
  for (const item of result?.items ?? []) counts[item.status]++;
  const reasons = [...new Set(result?.items.filter(item => item.status === "failed" || item.status === "skipped")
    .map(item => item.reason && Object.hasOwn(copy.reasons, item.reason)
      ? copy.reasons[item.reason as keyof typeof copy.reasons] : copy.unknownReason) ?? [])];

  async function recalc() {
    if (busy.current || !isAuthenticated || !items.length) return;
    busy.current = true;
    setPending(true);
    setFailed(false);
    setResult(null);
    try { setResult(await recalculate({})); }
    catch { setFailed(true); }
    finally { busy.current = false; setPending(false); }
  }

  function opened(item: AdviceItem) {
    const path = item.sourceLink.split(/[?#]/)[0];
    const tool = path.startsWith("/tools/") ? path.slice("/tools/".length) : null;
    const calculator = tool && calculatorKeys.includes(tool) ? tool
      : Object.hasOwn(calculatorFor, item.key) ? calculatorFor[item.key]
        : calculatorKeys.includes(item.key) ? item.key : null;
    if (calculator) void interest({ calculator }).catch(() => undefined);
  }

  function progressIdentity(item: AdviceItem): ProgressIdentity {
    if (!isAuthenticated || !user) throw new Error("AUTH_CHANGED");
    if (!item.source || item.adviceRevision === undefined) throw new Error("ADVICE_CHANGED");
    return { source: item.source, recordId: item.recordId, key: item.key,
      expectedRevision: item.adviceRevision, expectedUserId: user._id };
  }

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div><h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-2 text-muted-foreground">{copy.description}</p></div>
      <ProfileSectionTabs locale={locale} active="advice" />
    </header>
    {groups === undefined || bikes === undefined ? <p role="status">{copy.loading}</p> : <>
      {(staleCount > 0 || unknownCount > 0) && <section role="status"
        className="space-y-2 rounded-3xl border border-warning bg-warning px-6 py-5 text-warning-foreground">
        {staleCount > 0 && <p><strong>{copy.stale}: <span className="font-mono">{staleCount}</span>.</strong> {copy.staleHint}</p>}
        {unknownCount > 0 && <p><strong>{copy.unknown}: <span className="font-mono">{unknownCount}</span>.</strong> {copy.unknownHint}</p>}
      </section>}
      {items.length ? <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-muted-foreground">{copy.recalcHint}</p>
        <Button className="min-h-12 shrink-0 whitespace-normal" isPending={pending} disabled={pending}
          onClick={() => void recalc()}>{pending ? copy.recalculating : copy.recalc}</Button>
      </section> : <section className="space-y-3 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl font-bold">{copy.empty}</h2><p>{copy.emptyHint}</p>
        <Link className="inline-flex min-h-11 items-center font-semibold text-primary underline"
          href={`${withLocalePrefix("/dashboard", locale)}#dashboard-calculators-title`}>{copy.calculators}</Link>
      </section>}
      {failed && <p role="alert" className="rounded-2xl bg-destructive-soft p-5 text-destructive-text">{copy.recalcError}</p>}
      {result && <section role="status" aria-label={copy.summary} className="space-y-3 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">{copy.summary}</h2>
        <dl className="flex flex-wrap gap-x-8 gap-y-3">{(["updated", "pending", "skipped", "failed"] as const).map(status =>
          <div key={status}><dt className="text-sm text-muted-foreground">{copy[status]}</dt>
            <dd className="font-mono text-xl">{counts[status]}</dd></div>)}</dl>
        {!result.items.length && <p>{copy.noUpdates}</p>}
        {counts.pending > 0 && <p>{copy.pendingHint}</p>}
        {reasons.length > 0 && <ul className="list-disc space-y-1 pl-5">{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
      </section>}
      <AdviceGroupsView groups={groups} bikes={bikes} locale={locale} onOpenAdvice={opened}
        onMarkPerformed={(item, input) => perform({ ...progressIdentity(item), ...input })}
        onSubmitFeedback={(item, input) => feedback({ ...progressIdentity(item), ...input })} />
    </>}
    {access?.enforced && !access.fullProfile && <section className="space-y-3 rounded-3xl bg-primary p-6 text-primary-foreground">
      <h2 className="font-display text-2xl font-bold">{pricing.adviceTitle}</h2><p>{pricing.adviceDetail}</p>
      <Link className="inline-flex min-h-11 items-center font-semibold underline focus-visible:focus-ring"
        href={withLocalePrefix("/pricing", locale)}>{pricing.options}</Link>
    </section>}
  </div>;
}
