"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BikeWithFitHistory } from "@/components/bikes/BikeWithFitHistory";
import { Button, EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function FitHistoryPage() {
  const { locale, messages } = useDashboardMessages();
  const sessions = useQuery(api.sessions.queries.getAllSessionsWithBikes);

  const groupedSessions = useMemo(() => {
    if (!sessions) {
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

  if (sessions === undefined) {
    return <LoadingState label={messages.layout.loading} />;
  }

  if (!Array.isArray(sessions)) {
    return <ErrorState description={messages.fitHistory.emptyDescription} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {messages.fitHistory.title}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {messages.fitHistory.subtitle}
        </p>
      </div>

      {groupedSessions.length === 0 ? (
        <EmptyState
          title={messages.fitHistory.emptyTitle}
          description={messages.fitHistory.emptyDescription}
          action={
            <Link href={withLocalePrefix("/fit", locale)}>
              <Button>{messages.fitHistory.emptyCta}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
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
    </div>
  );
}
