"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
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
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader>
        <CardTitle>{messages.bikes.sections.fittingHistory}</CardTitle>
      </CardHeader>
      <CardContent>
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
                className="rounded-[var(--radius-md)] border border-[color:var(--border)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(session.completedAt ?? session.createdAt).toLocaleDateString(
                        locale === "nl" ? "nl-NL" : "en-US"
                      )}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {getStatusLabel(session.status)}
                    </p>
                    {recommendation ? (
                    <p className="mt-2 text-sm text-gray-700">
                        {messages.bikes.fields.saddle}:{" "}
                        {recommendation.calculatedFit.saddleHeightMm} mm
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={withLocalePrefix(`/fit/${session._id}/results`, locale)}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {messages.home.recentSessions.actions.viewResults}
                  </Link>
                </div>
              </div>
            ))}
            <Link
              href={withLocalePrefix(`/fit?bikeId=${bikeId}`, locale)}
              className="inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              {messages.bikeForm.actions.startFitForBike}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
