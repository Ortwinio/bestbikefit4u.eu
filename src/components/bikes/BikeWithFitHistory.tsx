"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from "@/components/ui";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { getBikeTypeLabel } from "@/lib/bikes";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

function formatConfidence(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

interface BikeWithFitHistoryProps {
  bike: Doc<"bikes"> | null;
  sessions: Array<{
    session: Doc<"fitSessions">;
    recommendation: Doc<"recommendations"> | null;
  }>;
}

function FitHistoryBikeImage({ source }: { source?: string }) {
  const imageUrl = useResolvedImageUrl(source);

  if (!imageUrl) {
    return (
      <img
        src="/default-bike.svg"
        alt=""
        className="h-24 w-36 rounded-[var(--radius-md)] object-cover"
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      className="h-24 w-36 rounded-[var(--radius-md)] object-cover"
    />
  );
}

export function BikeWithFitHistory({
  bike,
  sessions,
}: BikeWithFitHistoryProps) {
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const removeSession = useMutation(api.sessions.mutations.remove);
  const [sessionToDelete, setSessionToDelete] = useState<Doc<"fitSessions"> | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!sessionToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeSession({ sessionId: sessionToDelete._id });
      toast.success({ description: messages.fitHistory.delete.success });
      setSessionToDelete(null);
    } catch (error) {
      console.error("Failed to delete fit session:", error);
      toast.error({ description: messages.fitHistory.delete.failed });
      setIsDeleting(false);
      return;
    }
    setIsDeleting(false);
  };

  return (
    <>
      <Card variant="bordered" className="dashboard-card-surface">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-4">
              <FitHistoryBikeImage source={bike?.photoUrl} />
              <div>
                <CardTitle>{bikeTitle}</CardTitle>
                <p className="mt-1 text-sm text-gray-600">{bikeSubtitle}</p>
              </div>
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
                      {session.ridingStyle
                        ? messages.sessions.ridingStyle[session.ridingStyle]
                        : messages.nav.bikeFitting}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(
                        session.completedAt ?? session.createdAt
                      ).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US")}
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
                          {formatConfidence(recommendation.confidenceScore)}%
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-600">
                        {messages.fitHistory.noRecommendationYet}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={withLocalePrefix(`/fit/${session._id}/results`, locale)}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      {messages.fitHistory.viewReport}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSessionToDelete(session)}
                      className="text-sm font-semibold text-[color:var(--danger)] hover:opacity-80"
                    >
                      {messages.fitHistory.delete.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AccessibleDialog
        open={sessionToDelete !== null}
        title={messages.fitHistory.delete.dialogTitle}
        description={messages.fitHistory.delete.dialogDescription}
        onClose={() => {
          if (!isDeleting) {
            setSessionToDelete(null);
          }
        }}
      >
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setSessionToDelete(null)}
            disabled={isDeleting}
          >
            {messages.common.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            {messages.fitHistory.delete.confirm}
          </Button>
        </div>
      </AccessibleDialog>
    </>
  );
}
