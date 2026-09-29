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
  useToast,
  InfoBox,
  MeasurementTile,
  StatusChip,
} from "@/components/ui";
import { getBikeTypeLabel } from "@/lib/bikes";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { fitHistoryCopy } from "@/i18n/account/fitHistory";
import { FitReportActionGroup } from "@/components/reports";
import { ArrowRight, Trash2, AlertTriangle, Clock } from "lucide-react";

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

export function BikeWithFitHistory({ bike, sessions }: BikeWithFitHistoryProps) {
  const { locale, messages } = useDashboardMessages();
  const text = fitHistoryCopy[locale];
  const numberFormat = new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-US", {
    maximumFractionDigits: 10,
  });
  const toast = useToast();
  const removeSession = useMutation(api.sessions.mutations.remove);
  const [sessionToDelete, setSessionToDelete] = useState<Doc<"fitSessions"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusConfig = (status: string) => {
    const label = text.status[status as keyof typeof text.status] ?? status.replaceAll("_", " ");
    switch (status) {
      case "completed":
        return { label, className: "bg-[var(--bbf-lime)]" };
      case "in_progress":
        return { label, className: "bg-[var(--bbf-petrol-zacht)]" };
      case "processing":
        return { label, className: "bg-[var(--bbf-warning)]" };
      default:
        return { label, className: "bg-[var(--bbf-rand)]" };
    }
  };

  const bikeTitle = bike?.name || (bike ? getBikeTypeLabel(bike.bikeType, messages) : text.noBikeLinked);
  const handleDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await removeSession({ sessionId: sessionToDelete._id });
      toast.success({ description: text.delete.success });
      setSessionToDelete(null);
    } catch {
      toast.error({ description: text.delete.failed });
    } finally {
      setIsDeleting(false);
    }
  };

  const sessionDate = (session: Doc<"fitSessions">) => {
    const date = new Date(session.completedAt ?? session.createdAt);
    return (
      <time dateTime={date.toISOString()} className="text-xs text-muted-foreground">
        {new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
          .formatToParts(date)
          .map((part, index) => (
            <span
              key={`${part.type}-${index}`}
              className={part.type === "day" || part.type === "year" ? "font-mono" : undefined}
            >
              {part.value}
            </span>
          ))}
      </time>
    );
  };
  const sessionStyle = (session: Doc<"fitSessions">) =>
    session.ridingStyle ? messages.sessions.ridingStyle[session.ridingStyle] : messages.nav.bikeFitting;
  const sessionStatus = (session: Doc<"fitSessions">) => {
    const status = getStatusConfig(session.status);
    return (
      <StatusChip status="ok" className={status.className}>
        {status.label}
      </StatusChip>
    );
  };
  const measurementClass = "rounded-none border-0 bg-transparent p-0 [&_dd]:text-3xl";

  return (
    <>
      <Card
        variant="bordered"
        className="min-w-0 gap-0 rounded-[28px] bg-card p-5 shadow-none sm:px-7 sm:py-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
          <h2 className="min-w-0 font-display text-[26px] font-bold leading-tight [overflow-wrap:anywhere]">
            {bikeTitle}
          </h2>
          <Button
            role="link"
            size="sm"
            variant="outline"
            className="max-w-full whitespace-normal"
            render={<Link href={withLocalePrefix(bike ? `/fit?bikeId=${bike._id}` : "/fit", locale)} />}
          >
            {text.startNewSession}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border border-t border-border">
            {sessions.map(({ session, recommendation }) => (
              <article key={session._id} className="min-w-0 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{sessionStyle(session)}</h3>
                    {sessionStatus(session)}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {sessionDate(session)}
                  </div>
                </div>
                {recommendation ? (
                  <div className="my-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <MeasurementTile
                      className={measurementClass}
                      label={text.saddleHeight}
                      value={
                        recommendation.calculatedFit.saddleHeightMm != null
                          ? numberFormat.format(recommendation.calculatedFit.saddleHeightMm)
                          : null
                      }
                      unit="mm"
                    />
                    <MeasurementTile
                      className={measurementClass}
                      label={text.handlebarDrop}
                      value={
                        recommendation.calculatedFit.handlebarDropMm != null
                          ? numberFormat.format(recommendation.calculatedFit.handlebarDropMm)
                          : null
                      }
                      unit="mm"
                    />
                    <MeasurementTile
                      className={measurementClass}
                      label={text.confidence}
                      value={numberFormat.format(formatConfidence(recommendation.confidenceScore))}
                      unit="%"
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">{text.noRecommendationYet}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {recommendation ? (
                    <FitReportActionGroup
                      sessionId={session._id}
                      pagePath={withLocalePrefix("/fit-history", locale)}
                      className="flex max-w-full flex-wrap gap-2"
                    />
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSessionToDelete(session)}
                    className="text-destructive-text hover:bg-destructive/10 hover:text-destructive-text"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {text.delete.action}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
      <AccessibleDialog
        open={sessionToDelete !== null}
        title={text.delete.dialogTitle}
        onClose={() => {
          if (!isDeleting) setSessionToDelete(null);
        }}
      >
        {sessionToDelete && (
          <div className="mb-4 space-y-2 rounded-2xl border border-border bg-muted/50 p-4">
            <p className="break-words text-sm font-semibold">{bikeTitle}</p>
            <p className="text-sm font-medium">{sessionStyle(sessionToDelete)}</p>
            <div className="flex flex-wrap items-center gap-2">
              {sessionDate(sessionToDelete)}
              {sessionStatus(sessionToDelete)}
            </div>
          </div>
        )}
        <InfoBox
          variant="danger"
          icon={<AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />}
          className={
            "mb-5 border-0 bg-[var(--bbf-destructive)] text-[var(--bbf-inkt)] " +
            "[&>div>div]:text-[var(--bbf-inkt)]"
          }
        >
          {text.delete.dialogDescription}
        </InfoBox>
        <div className="flex flex-col gap-2">
          <Button variant="destructive" className="w-full" onClick={handleDelete} isLoading={isDeleting}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {text.delete.confirm}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSessionToDelete(null)}
            disabled={isDeleting}
          >
            {text.cancel}
          </Button>
        </div>
      </AccessibleDialog>
    </>
  );
}
