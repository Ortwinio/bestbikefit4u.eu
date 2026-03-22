import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import type { Doc, Id } from "../_generated/dataModel";

type PublicFeedbackSummary = {
  _id: Id<"feedback_items">;
  title: string;
  description: string;
  status: Doc<"feedback_items">["status"];
  category?: string;
  priority?: Doc<"feedback_items">["priority"];
  upvoteCount?: number;
  requesterCount?: number;
  createdAt: number;
  updatedAt?: number;
};

type PublicReleaseSummary = {
  _id: Id<"releases">;
  name: string;
  versionLabel?: string;
  status: Doc<"releases">["status"];
  type: Doc<"releases">["type"];
  description?: string;
  releaseNotes?: string;
  rolloutDate?: number;
  liveAt?: number;
  createdAt: number;
};

function buildPublicFeedbackSummary(item: Doc<"feedback_items">): PublicFeedbackSummary {
  return {
    _id: item._id,
    title: item.title,
    description: item.description,
    status: item.status,
    category: item.category,
    priority: item.priority,
    upvoteCount: item.upvoteCount,
    requesterCount: item.requesterCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function buildPublicReleaseSummary(release: Doc<"releases">): PublicReleaseSummary {
  return {
    _id: release._id,
    name: release.name,
    versionLabel: release.versionLabel,
    status: release.status,
    type: release.type,
    description: release.description,
    releaseNotes: release.releaseNotes,
    rolloutDate: release.rolloutDate,
    liveAt: release.liveAt,
    createdAt: release.createdAt,
  };
}

export const getPublicReleases = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    const [rollingOut, live] = await Promise.all([
      ctx.db
        .query("releases")
        .withIndex("by_status", (q) => q.eq("status", "rolling_out"))
        .collect(),
      ctx.db
        .query("releases")
        .withIndex("by_status", (q) => q.eq("status", "live"))
        .collect(),
    ]);

    const releases = [...rollingOut, ...live]
      .filter((release) => release.type !== "internal")
      .sort(
        (a, b) =>
          (b.rolloutDate ?? b.liveAt ?? b.createdAt) -
          (a.rolloutDate ?? a.liveAt ?? a.createdAt)
      );

    return await Promise.all(
      releases.map(async (release) => {
        const releaseItems = await ctx.db
          .query("release_items")
          .withIndex("by_release", (q) => q.eq("releaseId", release._id))
          .collect();

        const linkedFeatureRequests = Array.from(
          new Map(
            (
              await Promise.all(
                releaseItems
                  .filter((item) => item.itemType === "feedback_item")
                  .map(async (item) => {
                    const feedbackItem = await ctx.db.get(item.itemId as Id<"feedback_items">);
                    return feedbackItem && feedbackItem.type === "feature_request"
                      ? buildPublicFeedbackSummary(feedbackItem)
                      : null;
                  })
              )
            )
              .filter((item): item is PublicFeedbackSummary => item !== null)
              .map((item) => [item._id, item] as const)
          ).values()
        ).sort(
          (a, b) =>
            (b.updatedAt ?? b.createdAt) -
            (a.updatedAt ?? a.createdAt)
        );

        return {
          ...buildPublicReleaseSummary(release),
          publishedAt: release.liveAt ?? release.rolloutDate ?? release.createdAt,
          items: linkedFeatureRequests,
        };
      })
    );
  },
});
