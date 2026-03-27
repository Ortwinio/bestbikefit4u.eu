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
import {
  ArrowRight,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/cn";

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
  return (
    <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-muted">
      <img
        src={imageUrl ?? "/default-bike.svg"}
        alt=""
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}

export function BikeWithFitHistory({
  bike,
  sessions,
}: BikeWithFitHistoryProps) {
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const removeSession = useMutation(api.sessions.mutations.remove);
  const [sessionToDelete, setSessionToDelete] = useState<Doc<"fitSessions"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: messages.sessions.status.completed, className: "bg-success/15 text-success" };
      case "in_progress":
        return { label: messages.sessions.status.inProgress, className: "bg-primary/10 text-primary" };
      case "processing":
        return { label: messages.sessions.status.processing, className: "bg-warning/15 text-warning" };
      case "archived":
        return { label: messages.sessions.status.archived, className: "bg-muted text-muted-foreground" };
      default:
        return { label: status.replaceAll("_", " "), className: "bg-muted text-muted-foreground" };
    }
  };

  const bikeTitle =
    bike?.name || (bike ? getBikeTypeLabel(bike.bikeType, messages) : messages.fitHistory.noBikeLinked);
  const bikeSubtitle = bike
    ? [bike.brand, bike.model].filter(Boolean).join(" ") || getBikeTypeLabel(bike.bikeType, messages)
    : messages.fitHistory.bikeWithoutName;

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await removeSession({ sessionId: sessionToDelete._id });
      toast.success({ description: messages.fitHistory.delete.success });
      setSessionToDelete(null);
    } catch {
      toast.error({ description: messages.fitHistory.delete.failed });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card variant="bordered" className="dashboard-card-surface overflow-hidden">

        {/* Bike header */}
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FitHistoryBikeImage source={bike?.photoUrl} />
              <div>
                <CardTitle className="text-base">{bikeTitle}</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">{bikeSubtitle}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              render={
                <Link
                  href={withLocalePrefix(bike ? `/fit?bikeId=${bike._id}` : "/fit", locale)}
                />
              }
            >
              {messages.fitHistory.startNewSession}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        {/* Sessions */}
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {sessions.map(({ session, recommendation }) => {
              const statusConfig = getStatusConfig(session.status);
              const date = new Date(session.completedAt ?? session.createdAt)
                .toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
              const ridingStyleLabel = session.ridingStyle
                ? messages.sessions.ridingStyle[session.ridingStyle]
                : messages.nav.bikeFitting;

              return (
                <div key={session._id} className="px-6 py-4">
                  {/* Top row: riding style + date + status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{ridingStyleLabel}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          statusConfig.className
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {date}
                    </div>
                  </div>

                  {/* Metrics */}
                  {recommendation ? (
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-sm text-muted-foreground">
                          {messages.fitHistory.saddleHeight}:{" "}
                          <span className="font-medium text-foreground">
                            {recommendation.calculatedFit.saddleHeightMm} mm
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-sm text-muted-foreground">
                          {messages.fitHistory.handlebarDrop}:{" "}
                          <span className="font-medium text-foreground">
                            {recommendation.calculatedFit.handlebarDropMm} mm
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-sm text-muted-foreground">
                          {messages.fitHistory.confidence}:{" "}
                          <span className="font-medium text-foreground">
                            {formatConfidence(recommendation.confidenceScore)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {messages.fitHistory.noRecommendationYet}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={withLocalePrefix(`/fit/${session._id}/results`, locale)} />}
                    >
                      {messages.fitHistory.viewReport}
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSessionToDelete(session)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      {messages.fitHistory.delete.action}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AccessibleDialog
        open={sessionToDelete !== null}
        title={messages.fitHistory.delete.dialogTitle}
        onClose={() => {
          if (!isDeleting) setSessionToDelete(null);
        }}
      >
        {/* Session being deleted */}
        {sessionToDelete && (() => {
          const deleteDate = new Date(sessionToDelete.completedAt ?? sessionToDelete.createdAt)
            .toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US", {
              day: "numeric", month: "short", year: "numeric",
            });
          const deleteStyle = sessionToDelete.ridingStyle
            ? messages.sessions.ridingStyle[sessionToDelete.ridingStyle]
            : messages.nav.bikeFitting;
          const deleteStatusConfig = getStatusConfig(sessionToDelete.status);
          return (
            <div className="mb-4 flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-muted/50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{deleteStyle}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{deleteDate}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", deleteStatusConfig.className)}>
                    {deleteStatusConfig.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Warning panel */}
        <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-lg)] border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {messages.fitHistory.delete.dialogDescription}
          </p>
        </div>

        {/* Actions — full-width stacked */}
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {messages.fitHistory.delete.confirm}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSessionToDelete(null)}
            disabled={isDeleting}
          >
            {messages.common.cancel}
          </Button>
        </div>
      </AccessibleDialog>
    </>
  );
}
