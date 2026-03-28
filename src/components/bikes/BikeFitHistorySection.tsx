"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, CalendarDays, Gauge, Sparkles } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingState, EmptyState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface BikeFitHistorySectionProps {
  bikeId: Id<"bikes">;
}

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
  };
}

export function BikeFitHistorySection({
  bikeId,
}: BikeFitHistorySectionProps) {
  const { locale, messages } = useDashboardMessages();
  const history = useQuery(api.sessions.queries.getSessionsWithRecommendationsByBike, {
    bikeId,
  });

  if (history === undefined) {
    return <LoadingState label={messages.layout.loading} />;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return messages.sessions.status.completed;
      case "in_progress":
        return messages.sessions.status.inProgress;
      case "processing":
        return messages.sessions.status.processing;
      case "archived":
        return messages.sessions.status.archived;
      default:
        return status.replaceAll("_", " ");
    }
  };

  return (
    <Card variant="bordered" className="dashboard-card-surface overflow-hidden">
      <CardHeader className="border-b border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_70%,var(--background)_30%),color-mix(in_oklch,var(--card)_88%,var(--primary)_12%))]">
        <CardTitle>{messages.bikes.sections.fittingHistory}</CardTitle>
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          {messages.fitHistory.subtitle}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {history.length === 0 ? (
          <EmptyState
            title={messages.dashboardFit.noResultsYet}
            description={messages.bikes.subtitle}
            action={
              <Button {...linkButtonProps(withLocalePrefix(`/fit?bikeId=${bikeId}`, locale))}>
                {messages.bikeForm.actions.startFitForBike}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {history.map(({ session, recommendation }) => (
              <div
                key={session._id}
                className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--secondary)]/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
                        <CalendarDays className="h-4 w-4 text-[color:var(--primary)]" />
                      {new Date(session.completedAt ?? session.createdAt).toLocaleDateString(
                        locale === "nl" ? "nl-NL" : "en-US"
                      )}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                        {getStatusLabel(session.status)}
                      </p>
                    </div>

                    {recommendation ? (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 px-4 py-3">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                            <Sparkles className="h-4 w-4" />
                            {messages.fitHistory.saddleHeight}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                            {recommendation.calculatedFit.saddleHeightMm} mm
                          </p>
                        </div>
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 px-4 py-3">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                            <Gauge className="h-4 w-4" />
                            {messages.fitHistory.handlebarDrop}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                            {recommendation.calculatedFit.handlebarDropMm} mm
                          </p>
                        </div>
                        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 px-4 py-3">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                            <ArrowRight className="h-4 w-4" />
                            {messages.fitHistory.handlebarReach}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                            {recommendation.calculatedFit.handlebarReachMm} mm
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {messages.fitHistory.noRecommendationYet}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    {...linkButtonProps(withLocalePrefix(`/fit/${session._id}/results`, locale))}
                  >
                    {messages.home.recentSessions.actions.viewResults}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full justify-between sm:w-auto"
              {...linkButtonProps(withLocalePrefix(`/fit?bikeId=${bikeId}`, locale))}
            >
              {messages.bikeForm.actions.startFitForBike}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
