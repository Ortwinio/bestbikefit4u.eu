"use client";

import Link from "next/link";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getBikeTypeLabel } from "@/lib/bikes";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface BikeWithFitHistoryProps {
  bike: Doc<"bikes"> | null;
  sessions: Array<{
    session: Doc<"fitSessions">;
    recommendation: Doc<"recommendations"> | null;
  }>;
}

export function BikeWithFitHistory({
  bike,
  sessions,
}: BikeWithFitHistoryProps) {
  const { locale, messages } = useDashboardMessages();

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

  const bikeTitle =
    bike?.name || (bike ? getBikeTypeLabel(bike.bikeType, messages) : messages.fitHistory.noBikeLinked);
  const bikeSubtitle = bike
    ? [bike.brand, bike.model].filter(Boolean).join(" ") ||
      getBikeTypeLabel(bike.bikeType, messages)
    : messages.fitHistory.bikeWithoutName;

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{bikeTitle}</CardTitle>
            <p className="mt-1 text-sm text-gray-600">{bikeSubtitle}</p>
          </div>
          <Link
            href={withLocalePrefix(
              bike ? `/fit?bikeId=${bike._id}` : "/fit",
              locale
            )}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            {messages.fitHistory.startNewSession}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map(({ session, recommendation }) => (
            <div
              key={session._id}
              className="rounded-[var(--radius-md)] border border-[color:var(--border)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {messages.fitHistory.latestSession}:{" "}
                    {new Date(session.completedAt ?? session.createdAt).toLocaleDateString(
                      locale === "nl" ? "nl-NL" : "en-US"
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {getStatusLabel(session.status)}
                  </p>
                  {recommendation ? (
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      <p>
                        {messages.fitHistory.saddleHeight}:{" "}
                        {recommendation.calculatedFit.saddleHeightMm} mm
                      </p>
                      <p>
                        {messages.fitHistory.handlebarDrop}:{" "}
                        {recommendation.calculatedFit.handlebarDropMm} mm
                      </p>
                      <p>
                        {messages.fitHistory.confidence}:{" "}
                        {Math.round(recommendation.confidenceScore * 100)}%
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      {messages.fitHistory.noRecommendationYet}
                    </p>
                  )}
                </div>
                <Link
                  href={withLocalePrefix(`/fit/${session._id}/results`, locale)}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  {messages.fitHistory.viewReport}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
