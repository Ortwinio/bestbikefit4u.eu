"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BikeWithFitHistory } from "@/components/bikes/BikeWithFitHistory";
import { Button, EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { fitHistoryCopy } from "@/i18n/account/fitHistory";
import { isPaidAccessEnforced } from "../../../../shared/pricing/flags";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";

export default function FitHistoryPage() {
  const { locale } = useDashboardMessages();
  const text = fitHistoryCopy[locale];
  const sessions = useQuery(api.sessions.queries.getAllSessionsWithBikes);
  const access = useQuery(api.pricing.queries.getAccess, isPaidAccessEnforced() ? {} : "skip");
  const pricing = getPricingAccessCopy(locale);

  const groupedSessions = useMemo(() => {
    if (!Array.isArray(sessions)) {
      return [];
    }

    const groups = new Map<
      string,
      {
        bike: (typeof sessions)[number]["bike"];
        entries: Array<(typeof sessions)[number]>;
        latestCreatedAt: number;
      }
    >();

    for (const entry of sessions) {
      const key = entry.bike?._id ?? `unlinked-${entry.session._id}`;
      const existing = groups.get(key);
      if (existing) {
        existing.entries.push(entry);
        existing.latestCreatedAt = Math.max(
          existing.latestCreatedAt,
          entry.session.createdAt
        );
      } else {
        groups.set(key, {
          bike: entry.bike,
          entries: [entry],
          latestCreatedAt: entry.session.createdAt,
        });
      }
    }

    return [...groups.values()].sort(
      (a, b) => b.latestCreatedAt - a.latestCreatedAt
    );
  }, [sessions]);

  return (
    <div className="min-w-0 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground [overflow-wrap:anywhere] sm:text-[44px]">
          {text.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {text.subtitle}
        </p>
      </header>

      {sessions === undefined ? (
        <div role="status" aria-busy="true" className="rounded-[28px] border border-border bg-card p-6">
          <LoadingState label={text.loading} />
        </div>
      ) : !Array.isArray(sessions) ? (
        <ErrorState title={text.errorTitle} description={text.errorDescription} />
      ) : groupedSessions.length === 0 ? (
        <EmptyState
          className="rounded-[28px] border-border bg-card px-5 py-12 shadow-none sm:py-16"
          title={text.emptyTitle}
          description={text.emptyDescription}
          action={
            <Button role="link" className="whitespace-normal" render={<Link href={withLocalePrefix("/fit", locale)} />}>
              {text.emptyCta}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedSessions.map((group) => (
            <BikeWithFitHistory
              key={group.bike?._id ?? group.entries[0]?.session._id}
              bike={group.bike}
              sessions={group.entries.map((entry) => ({
                session: entry.session,
                recommendation: entry.recommendation,
              }))}
            />
          ))}
        </div>
      )}
      {access?.enforced && access.maxBikes === 1 && <section className="space-y-3 rounded-3xl bg-primary p-6 text-primary-foreground">
        <h2 className="font-display text-2xl font-bold">{pricing.history}</h2><p>{pricing.historyDetail}</p>
        <Link className="inline-flex min-h-11 items-center font-semibold underline focus-visible:focus-ring"
          href={withLocalePrefix("/checkout?product=annual", locale)}>{pricing.annual}</Link>
      </section>}
    </div>
  );
}
