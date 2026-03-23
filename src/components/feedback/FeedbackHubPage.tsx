"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Check, MessageSquarePlus, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  EmptyState,
  LoadingState,
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { FeedbackDialog } from "./FeedbackDialog";
import { FeedbackDetailDialog } from "./FeedbackDetailDialog";
import {
  feedbackApi,
  type FeedbackOverviewRow,
  type FeedbackType,
  type FeatureRequestRow,
  type PublicReleaseRow,
} from "./feedback-api";
import { getFeedbackCopy, getFeedbackLocale } from "./feedback-copy";
import { formatFeedbackDate, truncateText } from "./feedback-format";
import type { Id } from "../../../convex/_generated/dataModel";

type FeedbackTab = "mine" | "board" | "changelog";

function isFeedbackTab(value: string | null): value is FeedbackTab {
  return value === "mine" || value === "board" || value === "changelog";
}

function getStatusTone(status: string) {
  if (status === "released" || status === "live") return "success";
  if (status === "declined") return "danger";
  if (status === "planned" || status === "in_progress" || status === "in_qa" || status === "rolling_out")
    return "info";
  if (status === "triaged" || status === "needs_info") return "warning";
  return "neutral";
}

function statusClassName(status: string) {
  const tone = getStatusTone(status);
  if (tone === "success") {
    return "border-[color:color-mix(in_oklch,var(--success)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_12%,var(--secondary)_88%)] text-[color:var(--success)]";
  }
  if (tone === "danger") {
    return "border-[color:color-mix(in_oklch,var(--danger)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_12%,var(--secondary)_88%)] text-[color:var(--danger)]";
  }
  if (tone === "warning") {
    return "border-[color:color-mix(in_oklch,var(--warning)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--secondary)_88%)] text-[color:var(--warning)]";
  }
  if (tone === "info") {
    return "border-[color:color-mix(in_oklch,var(--primary)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary)_88%)] text-[color:var(--primary)]";
  }
  return "border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--foreground)]";
}

function typeBadgeClassName(type: FeedbackType) {
  if (type === "bug") {
    return "border-[color:color-mix(in_oklch,var(--danger)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_12%,var(--secondary)_88%)] text-[color:var(--danger)]";
  }
  if (type === "feature_request") {
    return "border-[color:color-mix(in_oklch,var(--primary)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary)_88%)] text-[color:var(--primary)]";
  }
  return "border-[color:color-mix(in_oklch,var(--warning)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--secondary)_88%)] text-[color:var(--warning)]";
}

function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold leading-none",
        className
      )}
    >
      {children}
    </span>
  );
}

function formatReleaseName(release: PublicReleaseRow, copy = getFeedbackCopy("en")) {
  return release.versionLabel ? `${release.name} · ${release.versionLabel}` : release.name;
}

export function FeedbackHubPage() {
  const { locale } = useDashboardMessages();
  const copy = getFeedbackCopy(getFeedbackLocale(locale));
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<FeedbackTab>(() => {
    const requested = searchParams?.get("tab") ?? null;
    return isFeedbackTab(requested) ? requested : "mine";
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<Id<"feedback_items"> | null>(null);
  const [voteOverrides, setVoteOverrides] = useState<
    Record<string, { hasUpvoted: boolean; upvoteCount: number }>
  >({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});
  const [voteError, setVoteError] = useState<string | null>(null);

  const myFeedback = useQuery(feedbackApi.queries.getMyFeedback);
  const featureBoard = useQuery(feedbackApi.queries.getFeatureBoard);
  const releases = useQuery(feedbackApi.releases.getPublicReleases);
  const upvoteFeedbackItem = useMutation(feedbackApi.mutations.upvoteFeedbackItem);

  useEffect(() => {
    const requested = searchParams?.get("tab") ?? null;
    if (isFeedbackTab(requested) && requested !== tab) {
      setTab(requested);
    }
  }, [searchParams, tab]);

  function updateTab(nextTab: FeedbackTab) {
    setTab(nextTab);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", nextTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const latestMyFeedback = (myFeedback ?? []) as FeedbackOverviewRow[];
  const featureRequests = (featureBoard ?? []) as FeatureRequestRow[];
  const publicReleases = (releases ?? []) as PublicReleaseRow[];

  const visibleFeatureRequests = featureRequests.map((item) => {
    const override = voteOverrides[String(item._id)];
    return override ? { ...item, ...override } : item;
  });

  async function handleVote(item: FeatureRequestRow) {
    const itemId = String(item._id);
    const current = voteOverrides[itemId] ?? item;
    const nextState = {
      hasUpvoted: !current.hasUpvoted,
      upvoteCount: Math.max(0, current.upvoteCount + (current.hasUpvoted ? -1 : 1)),
    };

    setPendingVotes((state) => ({ ...state, [itemId]: true }));
    setVoteOverrides((state) => ({ ...state, [itemId]: nextState }));
    setVoteError(null);

    try {
      const result = await upvoteFeedbackItem({ feedbackItemId: item._id });
      setVoteOverrides((state) => ({
        ...state,
        [itemId]: {
          hasUpvoted: result.hasUpvoted,
          upvoteCount: result.upvoteCount,
        },
      }));
    } catch (error) {
      console.error("Failed to toggle vote", error);
      setVoteOverrides((state) => {
        const next = { ...state };
        delete next[itemId];
        return next;
      });
      setVoteError(copy.states.voteError);
    } finally {
      setPendingVotes((state) => {
        const next = { ...state };
        delete next[itemId];
        return next;
      });
    }
  }

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,var(--primary)_0%,transparent_55%),radial-gradient(circle_at_top_right,var(--warning)_0%,transparent_40%)] opacity-20" />
      <div className="relative mx-auto max-w-6xl space-y-6">
        <Card className="dashboard-card-surface border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]">
          <CardContent className="gap-4 p-0">
            <div className="flex flex-col gap-4 rounded-[inherit] p-6 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl space-y-3">
                  <Pill className="border-[color:color-mix(in_oklch,var(--primary)_25%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary)_88%)] text-[color:var(--primary)]">
                    {copy.page.dashboardHint}
                  </Pill>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
                      {copy.page.title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                      {copy.page.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={withLocalePrefix("/dashboard", locale)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--primary)] hover:underline"
                  >
                    <ArrowRight className="h-4 w-4" />
                    {copy.page.backToDashboard}
                  </Link>
                  <Button type="button" variant="default" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {copy.page.primaryCta}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <SegmentedControl
                  value={tab}
                  onValueChange={(value) => updateTab(value as FeedbackTab)}
                  size="sm"
                  className="w-full justify-between md:w-auto"
                >
                  <SegmentedControlItem value="mine">{copy.tabs.mine}</SegmentedControlItem>
                  <SegmentedControlItem value="board">{copy.tabs.board}</SegmentedControlItem>
                  <SegmentedControlItem value="changelog">{copy.tabs.changelog}</SegmentedControlItem>
                </SegmentedControl>
                <Button
                  type="button"
                  variant="primary-soft"
                  onClick={() => setDialogOpen(true)}
                  className="hidden md:inline-flex"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  {copy.page.floatingCta}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {tab === "mine" ? (
          <section className="space-y-4">
            {myFeedback === undefined ? (
              <LoadingState label={copy.states.loading} />
            ) : latestMyFeedback.length === 0 ? (
              <EmptyState
                title={copy.states.emptyMineTitle}
                description={copy.states.emptyMineDescription}
                action={
                  <Button type="button" variant="default" onClick={() => setDialogOpen(true)}>
                    {copy.actions.emptySubmit}
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4">
                {latestMyFeedback.map((item) => (
                  <Card
                    key={String(item._id)}
                    className="dashboard-card-surface border border-[color:var(--border)]"
                  >
                    <CardContent className="gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Pill className={typeBadgeClassName(item.type)}>{copy.types[item.type].label}</Pill>
                            <Pill className={statusClassName(item.status)}>
                              {copy.statuses[item.status]}
                            </Pill>
                          </div>
                          <button
                            type="button"
                            className="text-left text-base font-semibold text-[color:var(--foreground)] hover:underline"
                            onClick={() => setSelectedFeedbackId(item._id)}
                          >
                            {item.title}
                          </button>
                          <p className="max-w-3xl text-sm text-[color:var(--muted-foreground)]">
                            {truncateText(item.description, 220)}
                          </p>
                        </div>
                        <div className="text-right text-xs text-[color:var(--muted-foreground)]">
                          {formatFeedbackDate(item.createdAt, getFeedbackLocale(locale))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-[color:var(--muted-foreground)]">
                        <span>
                          {item.commentCount ?? 0} {copy.states.comments}
                        </span>
                        {item.releaseSummary ? <span>{item.releaseSummary}</span> : null}
                        {item.pagePath ? <span>{item.pagePath}</span> : null}
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between border-t border-[color:var(--border)] px-4 py-3">
                      <div className="text-xs text-[color:var(--muted-foreground)]">
                        {item.upvoteCount ?? 0} {copy.actions.votes}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFeedbackId(item._id)}
                      >
                        {copy.actions.viewDetails}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === "board" ? (
          <section className="space-y-4">
            {featureBoard === undefined ? (
              <LoadingState label={copy.states.loading} />
            ) : visibleFeatureRequests.length === 0 ? (
              <EmptyState
                title={copy.states.emptyBoardTitle}
                description={copy.states.emptyBoardDescription}
                action={
                  <Button type="button" variant="default" onClick={() => setDialogOpen(true)}>
                    {copy.actions.openFeedback}
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4">
                {visibleFeatureRequests.map((item) => {
                  const itemId = String(item._id);
                  const isPending = Boolean(pendingVotes[itemId]);
                  return (
                    <Card key={itemId} className="dashboard-card-surface border border-[color:var(--border)]">
                      <CardContent className="gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Pill className={typeBadgeClassName(item.type)}>{copy.types[item.type].label}</Pill>
                              <Pill className={statusClassName(item.status)}>
                                {copy.statuses[item.status]}
                              </Pill>
                            </div>
                            <p className="text-base font-semibold text-[color:var(--foreground)]">
                              {item.title}
                            </p>
                            <p className="max-w-3xl text-sm text-[color:var(--muted-foreground)]">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant={item.hasUpvoted ? "default" : "outline"}
                              size="sm"
                              isPending={isPending}
                              onClick={() => void handleVote(item)}
                            >
                              <Check className="h-4 w-4" />
                              {item.hasUpvoted ? copy.actions.removeVote : copy.actions.upvote}
                            </Button>
                            <div className="text-sm font-semibold text-[color:var(--foreground)]">
                              {item.upvoteCount}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-[color:var(--muted-foreground)]">
                          {item.category ? <span>{item.category}</span> : null}
                          {item.requesterCount ? (
                            <span>
                              {item.requesterCount} {copy.actions.requesters}
                            </span>
                          ) : null}
                          {item.pagePath ? <span>{item.pagePath}</span> : null}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {voteError ? (
              <p className="text-sm text-[color:var(--danger)]">{voteError}</p>
            ) : null}
          </section>
        ) : null}

        {tab === "changelog" ? (
          <section className="space-y-4">
            {releases === undefined ? (
              <LoadingState label={copy.states.loading} />
            ) : publicReleases.length === 0 ? (
              <EmptyState
                title={copy.states.emptyChangelogTitle}
                description={copy.states.emptyChangelogDescription}
              />
            ) : (
              <div className="grid gap-4">
                {publicReleases.map((release) => (
                  <Card key={String(release._id)} className="dashboard-card-surface border border-[color:var(--border)]">
                    <CardContent className="gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Pill className={statusClassName(release.status)}>
                              {copy.releaseStatuses[release.status]}
                            </Pill>
                            {release.type ? (
                              <Pill className="border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--foreground)]">
                                {copy.releaseTypes[release.type]}
                              </Pill>
                            ) : null}
                          </div>
                          <p className="text-base font-semibold text-[color:var(--foreground)]">
                            {formatReleaseName(release, copy)}
                          </p>
                        </div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {release.liveAt
                            ? formatFeedbackDate(release.liveAt, getFeedbackLocale(locale))
                            : release.publishedAt
                              ? formatFeedbackDate(release.publishedAt, getFeedbackLocale(locale))
                              : ""}
                        </div>
                      </div>

                      {release.releaseNotes ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                            {copy.states.releaseNotes}
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-[color:var(--foreground)]">
                            {release.releaseNotes}
                          </p>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                          {copy.states.shippedItems}
                        </p>
                        {release.items.length === 0 ? (
                          <p className="text-sm text-[color:var(--muted-foreground)]">—</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {release.items.map((item, index) => (
                              <Pill
                                key={`${item.title}-${index}`}
                                className={cn("border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--foreground)]", statusClassName(item.status))}
                              >
                                {item.title}
                              </Pill>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>

      <FeedbackDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      <FeedbackDetailDialog
        open={selectedFeedbackId !== null}
        onClose={() => setSelectedFeedbackId(null)}
        feedbackItemId={selectedFeedbackId}
      />
    </div>
  );
}
