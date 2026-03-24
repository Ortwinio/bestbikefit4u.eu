import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { requireUserId } from "../lib/authz";

type ReleaseSummary = {
  _id: Id<"releases">;
  name: string;
  versionLabel?: string;
  type: Doc<"releases">["type"];
  status: Doc<"releases">["status"];
  description?: string;
  releaseNotes?: string;
  rolloutDate?: number;
  liveAt?: number;
  createdAt: number;
};

function buildReleaseSummary(release: Doc<"releases">): ReleaseSummary {
  return {
    _id: release._id,
    name: release.name,
    versionLabel: release.versionLabel,
    type: release.type,
    status: release.status,
    description: release.description,
    releaseNotes: release.releaseNotes,
    rolloutDate: release.rolloutDate,
    liveAt: release.liveAt,
    createdAt: release.createdAt,
  };
}

async function getLinkedRelease(
  ctx: QueryCtx,
  item: Pick<Doc<"feedback_items">, "_id" | "linkedReleaseId">
) {
  if (item.linkedReleaseId) {
    return await ctx.db.get(item.linkedReleaseId);
  }

  const releaseItem = await ctx.db
    .query("release_items")
    .withIndex("by_item", (q) =>
      q.eq("itemType", "feedback_item").eq("itemId", String(item._id))
    )
    .first();

  return releaseItem ? await ctx.db.get(releaseItem.releaseId) : null;
}

function getVisibleCommentCount(comments: Doc<"feedback_comments">[]) {
  return comments.filter((comment) => !comment.isInternal).length;
}

function getCommentAuthorName(user: Doc<"users"> | null) {
  if (!user) {
    return undefined;
  }

  if ("displayName" in user && typeof user.displayName === "string" && user.displayName.trim()) {
    return user.displayName.trim();
  }

  if ("name" in user && typeof user.name === "string" && user.name.trim()) {
    return user.name.trim();
  }

  if ("email" in user && typeof user.email === "string" && user.email.includes("@")) {
    return user.email.split("@")[0];
  }

  return undefined;
}

const OPEN_FEATURE_STATUSES = [
  "new",
  "triaged",
  "needs_info",
  "planned",
  "in_progress",
  "in_qa",
] as const;

export const getMyFeedback = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const items = await ctx.db
      .query("feedback_items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    items.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      items.map(async (item) => {
        const [comments, linkedRelease] = await Promise.all([
          ctx.db
            .query("feedback_comments")
            .withIndex("by_feedback_item", (q) => q.eq("feedbackItemId", item._id))
            .collect(),
          getLinkedRelease(ctx, item),
        ]);

        return {
          _id: item._id,
          type: item.type,
          title: item.title,
          description: item.description,
          status: item.status,
          category: item.category,
          pageUrl: item.pageUrl,
          pathname: item.pathname,
          queryString: item.queryString,
          locale: item.locale,
          routeFamily: item.routeFamily,
          activitySummary: item.activitySummary,
          contextCompleteness: item.contextCompleteness,
          activityTrailJson: item.activityTrailJson,
          pagePath: item.pagePath,
          linkedSessionId: item.linkedSessionId,
          linkedBikeId: item.linkedBikeId,
          contactEmail: item.contactEmail,
          contactName: item.contactName,
          expectedResult: item.expectedResult,
          actualResult: item.actualResult,
          browserInfoJson: item.browserInfoJson,
          upvoteCount: item.upvoteCount ?? 0,
          requesterCount: item.requesterCount ?? item.upvoteCount ?? 0,
          commentCount: getVisibleCommentCount(comments),
          releaseSummary: linkedRelease
            ? linkedRelease.versionLabel
              ? `${linkedRelease.name} · ${linkedRelease.versionLabel}`
              : linkedRelease.name
            : undefined,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      })
    );
  },
});

export const getFeatureBoard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const [items, upvotes] = await Promise.all([
      ctx.db
        .query("feedback_items")
        .withIndex("by_type", (q) => q.eq("type", "feature_request"))
        .collect(),
      ctx.db
        .query("feedback_upvotes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    const openStatuses = new Set<Doc<"feedback_items">["status"]>(OPEN_FEATURE_STATUSES);
    const upvotedItemIds = new Set(upvotes.map((upvote) => String(upvote.feedbackItemId)));

    return items
      .filter((item) => openStatuses.has(item.status))
      .sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0) || (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
      .map((item) => ({
        _id: item._id,
        type: item.type,
        title: item.title,
        description: item.description,
        status: item.status,
        category: item.category,
        pageUrl: item.pageUrl,
        pathname: item.pathname,
        queryString: item.queryString,
        locale: item.locale,
        routeFamily: item.routeFamily,
        activitySummary: item.activitySummary,
        contextCompleteness: item.contextCompleteness,
        activityTrailJson: item.activityTrailJson,
        pagePath: item.pagePath,
        linkedSessionId: item.linkedSessionId,
        linkedBikeId: item.linkedBikeId,
        contactEmail: item.contactEmail,
        contactName: item.contactName,
        expectedResult: item.expectedResult,
        actualResult: item.actualResult,
        browserInfoJson: item.browserInfoJson,
        upvoteCount: item.upvoteCount ?? 0,
        requesterCount: item.requesterCount ?? item.upvoteCount ?? 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        hasUpvoted: upvotedItemIds.has(String(item._id)),
      }));
  },
});

export const getPublicFeedbackDetail = query({
  args: {
    feedbackItemId: v.id("feedback_items"),
  },
  handler: async (ctx, { feedbackItemId }) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(feedbackItemId);
    if (!item || item.userId !== userId) {
      return null;
    }

    const [comments, linkedRelease] = await Promise.all([
      ctx.db
        .query("feedback_comments")
        .withIndex("by_feedback_item", (q) => q.eq("feedbackItemId", feedbackItemId))
        .collect(),
      getLinkedRelease(ctx, item),
    ]);
    const authorIds = Array.from(new Set(comments.map((comment) => comment.authorUserId)));
    const authors = new Map(
      await Promise.all(
        authorIds.map(async (authorUserId) => [authorUserId, await ctx.db.get(authorUserId)] as const)
      )
    );

    return {
      item: {
        _id: item._id,
        type: item.type,
        title: item.title,
        description: item.description,
        status: item.status,
        category: item.category,
        pageUrl: item.pageUrl,
        pathname: item.pathname,
        queryString: item.queryString,
        locale: item.locale,
        routeFamily: item.routeFamily,
        activitySummary: item.activitySummary,
        contextCompleteness: item.contextCompleteness,
        activityTrailJson: item.activityTrailJson,
        pagePath: item.pagePath,
        linkedSessionId: item.linkedSessionId,
        linkedBikeId: item.linkedBikeId,
        contactEmail: item.contactEmail,
        contactName: item.contactName,
        expectedResult: item.expectedResult,
        actualResult: item.actualResult,
        browserInfoJson: item.browserInfoJson,
        upvoteCount: item.upvoteCount ?? 0,
        requesterCount: item.requesterCount ?? item.upvoteCount ?? 0,
        commentCount: getVisibleCommentCount(comments),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        comments: comments
          .filter((comment) => !comment.isInternal)
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((comment) => ({
            ...comment,
            authorName: getCommentAuthorName(authors.get(comment.authorUserId) ?? null),
          })),
        linkedRelease: linkedRelease ? buildReleaseSummary(linkedRelease) : null,
      },
    };
  },
});
