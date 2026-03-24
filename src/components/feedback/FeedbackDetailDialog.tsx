"use client";

import { useQuery } from "convex/react";
import { AccessibleDialog, Card, LoadingState, EmptyState } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getFeedbackCopy, getFeedbackLocale } from "./feedback-copy";
import { feedbackApi } from "./feedback-api";
import { formatFeedbackDateTime, prettyPrintJson } from "./feedback-format";
import { getFeedbackStatusDescription } from "./feedback-flow";
import type { Id } from "../../../convex/_generated/dataModel";

export interface FeedbackDetailDialogProps {
  open: boolean;
  onClose: () => void;
  feedbackItemId: Id<"feedback_items"> | null;
}

function commentAuthorLabel(authorName?: string, fallback = "Team") {
  return authorName ?? fallback;
}

export function FeedbackDetailDialog({
  open,
  onClose,
  feedbackItemId,
}: FeedbackDetailDialogProps) {
  const { locale } = useDashboardMessages();
  const copy = getFeedbackCopy(getFeedbackLocale(locale));
  const detail = useQuery(
    feedbackApi.queries.getPublicFeedbackDetail,
    open && feedbackItemId ? { feedbackItemId } : "skip"
  );

  return (
    <AccessibleDialog
      open={open}
      onClose={onClose}
      title={detail?.item.title ?? copy.states.detailLoading}
      description={detail?.item.description ?? copy.states.detailLoading}
    >
      {detail === undefined ? (
        <LoadingState label={copy.states.detailLoading} />
      ) : detail ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="dashboard-card-surface border border-[color:var(--border)]">
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {copy.dialog.titleLabel}
              </p>
              <p className="mt-1 text-sm text-[color:var(--foreground)]">{detail.item.title}</p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                {getFeedbackStatusDescription(detail.item.status, getFeedbackLocale(locale))}
              </p>
            </Card>
            <Card className="dashboard-card-surface border border-[color:var(--border)]">
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {copy.dialog.pagePathLabel}
              </p>
              <p className="mt-1 text-sm text-[color:var(--foreground)]">
                {detail.item.pagePath ?? "—"}
              </p>
            </Card>
          </div>

          {detail.item.expectedResult || detail.item.actualResult ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {detail.item.expectedResult ? (
                <Card className="dashboard-card-surface border border-[color:var(--border)]">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.dialog.expectedResultLabel}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--foreground)]">
                    {detail.item.expectedResult}
                  </p>
                </Card>
              ) : null}
              {detail.item.actualResult ? (
                <Card className="dashboard-card-surface border border-[color:var(--border)]">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {copy.dialog.actualResultLabel}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--foreground)]">
                    {detail.item.actualResult}
                  </p>
                </Card>
              ) : null}
            </div>
          ) : null}

          {detail.item.browserInfoJson ? (
            <Card className="dashboard-card-surface border border-[color:var(--border)]">
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {copy.dialog.browserInfoLabel}
              </p>
              <pre className="mt-2 max-h-56 overflow-auto rounded-[var(--radius-md)] bg-[color:var(--secondary)] p-3 text-xs text-[color:var(--foreground)]">
                {prettyPrintJson(detail.item.browserInfoJson)}
              </pre>
            </Card>
          ) : null}

          {detail.item.linkedRelease ? (
            <Card className="dashboard-card-surface border border-[color:var(--border)]">
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {copy.states.linkedRelease}
              </p>
              <p className="mt-1 text-sm font-medium text-[color:var(--foreground)]">
                {detail.item.linkedRelease.name}
                {detail.item.linkedRelease.versionLabel
                  ? ` · ${detail.item.linkedRelease.versionLabel}`
                  : ""}
              </p>
              {detail.item.linkedRelease.releaseNotes ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--muted-foreground)]">
                  {detail.item.linkedRelease.releaseNotes}
                </p>
              ) : null}
            </Card>
          ) : null}

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {copy.states.comments}
            </p>
            {detail.item.comments.length === 0 ? (
              <EmptyState
                title={copy.states.noComments}
                className="border border-[color:var(--border)] bg-[color:var(--secondary)] py-8"
              />
            ) : (
              <div className="space-y-3">
                {detail.item.comments.map((comment, index) => (
                  <Card
                    key={`${comment.createdAt}-${index}`}
                    className="dashboard-card-surface border border-[color:var(--border)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[color:var(--foreground)]">
                        {commentAuthorLabel(comment.authorName, copy.states.commentAuthorFallback)}
                      </p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {formatFeedbackDateTime(comment.createdAt, getFeedbackLocale(locale))}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-[color:var(--foreground)]">
                      {comment.body}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title={copy.states.detailNotFound}
          description={copy.states.detailNotFound}
        />
      )}
    </AccessibleDialog>
  );
}
