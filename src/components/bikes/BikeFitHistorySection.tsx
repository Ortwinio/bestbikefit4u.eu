"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, CalendarDays, History } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Button, Card, CardContent, LoadingState, EmptyState, SectionHeader, MeasurementTile } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { FitReportActionGroup } from "@/components/reports";

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
      <SectionHeader
        icon={<History className="h-5 w-5 text-[color:var(--primary)]" />}
        title={messages.bikes.sections.fittingHistory}
      />
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
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <MeasurementTile
                          label={messages.fitHistory.saddleHeight}
                          value={recommendation.calculatedFit.saddleHeightMm}
                          unit="mm"
                        />
                        <MeasurementTile
                          label={messages.fitHistory.handlebarDrop}
                          value={recommendation.calculatedFit.handlebarDropMm != null ? Math.round(recommendation.calculatedFit.handlebarDropMm) : null}
                          unit="mm"
                        />
                        <MeasurementTile
                          label={messages.fitHistory.handlebarReach}
                          value={recommendation.calculatedFit.handlebarReachMm != null ? Math.round(recommendation.calculatedFit.handlebarReachMm) : null}
                          unit="mm"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {messages.fitHistory.noRecommendationYet}
                      </p>
                    )}
                  </div>
                  {recommendation ? (
                    <FitReportActionGroup
                      sessionId={session._id}
                      pagePath={withLocalePrefix(`/bikes/${bikeId}`, locale)}
                    />
                  ) : null}
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
