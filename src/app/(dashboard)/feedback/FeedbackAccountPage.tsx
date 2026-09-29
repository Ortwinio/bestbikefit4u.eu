"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card, CardContent, CardFooter } from "@/components/prototyper-ui/ui/card";
import { EmptyState, LoadingState } from "@/components/prototyper-ui/ui/states";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/SegmentedControl";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toolsFeedback } from "@/i18n/account/toolsFeedback";
import { cn } from "@/utils/cn";
import { FeedbackDetailDialog } from "@/components/feedback/FeedbackDetailDialog";
import { useFeedbackPanel } from "@/components/feedback/FeedbackPanelProvider";
import {
  feedbackApi,
  type FeedbackOverviewRow,
  type FeedbackType,
  type FeatureRequestRow,
  type PublicReleaseRow,
} from "@/components/feedback/feedback-api";
import { getFeedbackCopy, getFeedbackLocale } from "@/components/feedback/feedback-copy";
import { formatFeedbackDate, truncateText } from "@/components/feedback/feedback-format";
import { getFeedbackStatusDescription } from "@/components/feedback/feedback-flow";
import { trackFeedbackSignal } from "@/components/feedback/feedback-activity";
import type { Id } from "../../../../convex/_generated/dataModel";

type FeedbackTab = "mine" | "board" | "changelog";

function isFeedbackTab(value: string | null): value is FeedbackTab {
  return value === "mine" || value === "board" || value === "changelog";
}

function getStatusTone(status: string) {
  if (status === "released" || status === "live") return "success";
  if (status === "declined") return "danger";
  if (
    status === "planned" ||
    status === "in_progress" ||
    status === "in_qa" ||
    status === "rolling_out"
  )
    return "info";
  if (status === "triaged" || status === "needs_info") return "warning";
  return "neutral";
}

function statusClassName(status: string) {
  const tone = getStatusTone(status);
  if (tone === "success") return "border-transparent bg-[var(--bbf-lime)] text-[var(--bbf-inkt)]";
  if (tone === "danger")
    return "border-transparent bg-destructive text-destructive-foreground text-foreground";
  if (tone === "warning")
    return "border-transparent bg-warning text-warning-foreground text-foreground";
  return "border-transparent bg-secondary text-secondary-foreground";
}

function typeBadgeClassName() {
  return "border-transparent bg-secondary text-secondary-foreground";
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

function formatReleaseName(release: PublicReleaseRow) {
  return release.versionLabel ? `${release.name} · ${release.versionLabel}` : release.name;
}

export function FeedbackAccountPage() {
  const { locale } = useDashboardMessages();
  const pageCopy = toolsFeedback[locale];
  const { openPanel } = useFeedbackPanel();
  const copy = getFeedbackCopy(getFeedbackLocale(locale));
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<FeedbackTab>(() => {
    const requested = searchParams?.get("tab") ?? null;
    return isFeedbackTab(requested) ? requested : "mine";
  });
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

  function openFeedbackPanel(defaultType?: FeedbackType) {
    openPanel({
      defaultType,
      pagePath: pathname ?? "/feedback",
    });
  }

  function updateTab(nextTab: FeedbackTab) {
    setTab(nextTab);
    trackFeedbackSignal(
      pathname ?? "/feedback",
      "switch_feedback_tab",
      `Switched feedback hub to the ${nextTab} tab`,
    );
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
      trackFeedbackSignal(
        pathname ?? "/feedback",
        "vote_feature_request",
        current.hasUpvoted ? "Removed a vote from a feature request" : "Upvoted a feature request",
      );
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
    <div className="mx-auto max-w-6xl space-y-6">
      <header
        className={
          "flex flex-col gap-6 rounded-[28px] bg-[var(--bbf-lime)] p-6 sm:p-8 lg:flex-row " +
          "lg:items-center lg:justify-between"
        }
      >
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground">
            {pageCopy.eyebrow}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {pageCopy.title}
          </h1>
          <p className="max-w-2xl text-foreground">{pageCopy.subtitle}</p>
        </div>
        <Button type="button" onClick={() => openFeedbackPanel()} className="shrink-0 self-start">
          <Plus className="size-4" />
          {copy.page.primaryCta}
        </Button>
      </header>
      <nav aria-label={pageCopy.navigation}>
        <SegmentedControl
          value={tab}
          onValueChange={(value) => updateTab(value as FeedbackTab)}
          className="grid w-full grid-cols-3 sm:inline-flex sm:w-auto"
        >
          <SegmentedControlItem value="mine" className="min-w-0 whitespace-normal">
            {copy.tabs.mine}
          </SegmentedControlItem>
          <SegmentedControlItem value="board" className="min-w-0 whitespace-normal">
            {copy.tabs.board}
          </SegmentedControlItem>
          <SegmentedControlItem value="changelog" className="min-w-0 whitespace-normal">
            {copy.tabs.changelog}
          </SegmentedControlItem>
        </SegmentedControl>
      </nav>
      <div>
        {tab === "mine" ? (
          <section className="space-y-4">
            {myFeedback === undefined ? (
              <LoadingState label={copy.states.loading} />
            ) : latestMyFeedback.length === 0 ? (
              <EmptyState
                title={copy.states.emptyMineTitle}
                description={copy.states.emptyMineDescription}
                action={
                  <Button type="button" variant="default" onClick={() => openFeedbackPanel()}>
                    {copy.actions.emptySubmit}
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4">
                {latestMyFeedback.map((item) => (
                  <Card
                    key={String(item._id)}
                    className="rounded-3xl border border-border bg-card shadow-none"
                  >
                    <CardContent className="gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Pill className={typeBadgeClassName()}>
                              {copy.types[item.type].label}
                            </Pill>
                            <Pill className={statusClassName(item.status)}>
                              {copy.statuses[item.status]}
                            </Pill>
                          </div>
                          <button
                            type="button"
                            className="text-left font-display text-2xl font-bold text-foreground hover:underline"
                            onClick={() => {
                              trackFeedbackSignal(
                                pathname ?? "/feedback",
                                "open_feedback_detail",
                                "Opened a feedback thread from the feedback hub",
                              );
                              setSelectedFeedbackId(item._id);
                            }}
                          >
                            {item.title}
                          </button>
                          <p className="max-w-3xl text-sm text-muted-foreground">
                            {truncateText(item.description, 220)}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {formatFeedbackDate(item.createdAt, getFeedbackLocale(locale))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>
                          {item.commentCount ?? 0} {copy.states.comments}
                        </span>
                        {item.releaseSummary ? <span>{item.releaseSummary}</span> : null}
                        {item.pagePath ? <span>{item.pagePath}</span> : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getFeedbackStatusDescription(item.status, getFeedbackLocale(locale))}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-between border-t border-border px-4 py-3">
                      <div className="text-xs text-muted-foreground">
                        {item.upvoteCount ?? 0} {copy.actions.votes}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          trackFeedbackSignal(
                            pathname ?? "/feedback",
                            "open_feedback_detail",
                            "Opened a feedback thread from the feedback hub",
                          );
                          setSelectedFeedbackId(item._id);
                        }}
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
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => openFeedbackPanel("feature_request")}
                  >
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
                    <Card
                      key={itemId}
                      className="rounded-3xl border border-border bg-card shadow-none"
                    >
                      <CardContent className="gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              <Pill className={typeBadgeClassName()}>
                                {copy.types[item.type].label}
                              </Pill>
                              <Pill className={statusClassName(item.status)}>
                                {copy.statuses[item.status]}
                              </Pill>
                            </div>
                            <h2 className="font-display text-2xl font-bold text-foreground">
                              {item.title}
                            </h2>
                            <p className="max-w-3xl text-sm text-muted-foreground">
                              {item.description}
                            </p>
                            <p className="max-w-3xl text-sm text-muted-foreground">
                              {getFeedbackStatusDescription(item.status, getFeedbackLocale(locale))}
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
                            <div className="text-sm font-semibold text-foreground">
                              {item.upvoteCount}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
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
            {voteError ? <p className="text-sm text-[color:var(--danger)]">{voteError}</p> : null}
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
                  <Card
                    key={String(release._id)}
                    className="rounded-3xl border border-border bg-card shadow-none"
                  >
                    <CardContent className="gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Pill className={statusClassName(release.status)}>
                              {copy.releaseStatuses[release.status]}
                            </Pill>
                            {release.type ? (
                              <Pill className="border-border bg-secondary text-foreground">
                                {copy.releaseTypes[release.type]}
                              </Pill>
                            ) : null}
                          </div>
                          <p className="text-base font-semibold text-foreground">
                            {formatReleaseName(release)}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {release.liveAt
                            ? formatFeedbackDate(release.liveAt, getFeedbackLocale(locale))
                            : release.publishedAt
                              ? formatFeedbackDate(release.publishedAt, getFeedbackLocale(locale))
                              : ""}
                        </div>
                      </div>

                      {release.releaseNotes ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {copy.states.releaseNotes}
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-foreground">
                            {release.releaseNotes}
                          </p>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {copy.states.shippedItems}
                        </p>
                        {release.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground">—</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {release.items.map((item, index) => (
                              <Pill
                                key={`${item.title}-${index}`}
                                className={cn(
                                  "border-border bg-secondary text-foreground",
                                  statusClassName(item.status),
                                )}
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

      <FeedbackDetailDialog
        open={selectedFeedbackId !== null}
        onClose={() => setSelectedFeedbackId(null)}
        feedbackItemId={selectedFeedbackId}
      />
    </div>
  );
}
