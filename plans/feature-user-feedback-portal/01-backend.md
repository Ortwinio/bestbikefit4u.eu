# Step 01 — Backend

## Goal

Add the `feedback_upvotes` table, implement all missing user-facing queries and mutations, and add the message receipt mutations needed by step 04.

---

## Pre-requisites

- `feedback_items`, `feedback_comments`, `releases`, `release_items`, `dashboard_messages`, `message_receipts`, `message_targets` tables exist in schema
- `submitFeedback` mutation exists in `convex/feedback/mutations.ts`
- `getMyMessages` query exists in `convex/messages/queries.ts`

---

## 1. Schema — add `feedback_upvotes`

In `convex/schema.ts`:

```ts
feedback_upvotes: defineTable({
  feedbackItemId: v.id("feedback_items"),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_item", ["feedbackItemId"])
  .index("by_user_item", ["userId", "feedbackItemId"]),
```

---

## 2. Queries — `convex/feedback/queries.ts`

Create this file with three queries:

### `getMyFeedback`

```ts
export const getMyFeedback = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const items = await ctx.db
      .query("feedback_items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // For each item, attach the linked release name if released
    return await Promise.all(
      items.map(async (item) => {
        const release = item.linkedReleaseId
          ? await ctx.db.get(item.linkedReleaseId)
          : null;
        // Count non-internal comments (admin replies visible to user)
        const commentCount = (
          await ctx.db
            .query("feedback_comments")
            .withIndex("by_feedback_item", (q) =>
              q.eq("feedbackItemId", item._id)
            )
            .collect()
        ).filter((c) => !c.isInternal).length;
        return { ...item, linkedRelease: release, commentCount };
      })
    );
  },
});
```

### `getFeatureBoard`

```ts
export const getFeatureBoard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const items = await ctx.db
      .query("feedback_items")
      .withIndex("by_type", (q) => q.eq("type", "feature_request"))
      .collect();

    // Only show open/active items (exclude declined, closed, released)
    const visible = items.filter((item) =>
      ["new", "triaged", "needs_info", "planned", "in_progress", "in_qa"].includes(
        item.status
      )
    );

    // Get this user's upvotes in one pass
    const myUpvotes = await ctx.db
      .query("feedback_upvotes")
      .withIndex("by_user_item")
      .collect();
    const myUpvotedIds = new Set(
      myUpvotes
        .filter((u) => u.userId === userId)
        .map((u) => String(u.feedbackItemId))
    );

    return visible
      .map((item) => ({
        ...item,
        hasUpvoted: myUpvotedIds.has(String(item._id)),
      }))
      .sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));
  },
});
```

### `getPublicFeedbackDetail`

Returns a single feedback item owned by the calling user, plus non-internal comments:

```ts
export const getPublicFeedbackDetail = query({
  args: { feedbackItemId: v.id("feedback_items") },
  handler: async (ctx, { feedbackItemId }) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(feedbackItemId);
    if (!item || item.userId !== userId) return null;

    const comments = (
      await ctx.db
        .query("feedback_comments")
        .withIndex("by_feedback_item", (q) =>
          q.eq("feedbackItemId", feedbackItemId)
        )
        .order("asc")
        .collect()
    ).filter((c) => !c.isInternal);

    const release = item.linkedReleaseId
      ? await ctx.db.get(item.linkedReleaseId)
      : null;

    return { ...item, comments, linkedRelease: release };
  },
});
```

---

## 3. Queries — `convex/releases/queries.ts`

Create this file:

### `getPublicReleases`

```ts
export const getPublicReleases = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    const releases = await ctx.db
      .query("releases")
      .withIndex("by_status")
      .collect();

    // Show rolling_out and live; exclude internal type
    const visible = releases.filter(
      (r) =>
        (r.status === "rolling_out" || r.status === "live") &&
        r.type !== "internal"
    );

    // For each release, fetch linked feedback items (feature requests that shipped)
    return await Promise.all(
      visible
        .sort((a, b) => (b.liveAt ?? b.createdAt) - (a.liveAt ?? a.createdAt))
        .map(async (release) => {
          const releaseItems = await ctx.db
            .query("release_items")
            .withIndex("by_release", (q) => q.eq("releaseId", release._id))
            .collect();

          const feedbackItems = await Promise.all(
            releaseItems
              .filter((ri) => ri.itemType === "feedback_item")
              .map((ri) => ctx.db.get(ri.itemId as Id<"feedback_items">))
          );

          return {
            ...release,
            shippedItems: feedbackItems
              .filter(Boolean)
              .filter((f) => f!.type === "feature_request"),
          };
        })
    );
  },
});
```

---

## 4. Mutation — `upvoteFeedbackItem`

In `convex/feedback/mutations.ts`:

```ts
export const upvoteFeedbackItem = mutation({
  args: { feedbackItemId: v.id("feedback_items") },
  handler: async (ctx, { feedbackItemId }) => {
    const userId = await requireUserId(ctx);

    const item = await ctx.db.get(feedbackItemId);
    if (!item || item.type !== "feature_request") {
      throw new Error("Item not found or not a feature request");
    }

    const existing = await ctx.db
      .query("feedback_upvotes")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", userId).eq("feedbackItemId", feedbackItemId)
      )
      .unique();

    if (existing) {
      // Toggle off
      await ctx.db.delete(existing._id);
      await ctx.db.patch(feedbackItemId, {
        upvoteCount: Math.max(0, (item.upvoteCount ?? 1) - 1),
        updatedAt: Date.now(),
      });
      return { voted: false };
    } else {
      // Toggle on
      await ctx.db.insert("feedback_upvotes", {
        feedbackItemId,
        userId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(feedbackItemId, {
        upvoteCount: (item.upvoteCount ?? 0) + 1,
        updatedAt: Date.now(),
      });
      return { voted: true };
    }
  },
});
```

---

## 5. Mutations — message receipts

In `convex/messages/mutations.ts`:

```ts
export const dismissMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("message_receipts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("messageId"), messageId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { dismissedAt: Date.now() });
    } else {
      await ctx.db.insert("message_receipts", {
        messageId,
        userId,
        dismissedAt: Date.now(),
        receivedAt: Date.now(),
      });
    }
  },
});

export const acknowledgeMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("message_receipts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("messageId"), messageId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { acknowledgedAt: Date.now() });
    } else {
      await ctx.db.insert("message_receipts", {
        messageId,
        userId,
        acknowledgedAt: Date.now(),
        receivedAt: Date.now(),
      });
    }
  },
});
```

---

## Acceptance criteria

- [ ] `feedback_upvotes` table exists in schema with both indexes
- [ ] `getMyFeedback` returns the user's items with linked release and comment count
- [ ] `getFeatureBoard` returns open feature requests sorted by `upvoteCount` desc with `hasUpvoted` flag
- [ ] `getPublicFeedbackDetail` returns item + non-internal comments only
- [ ] `getPublicReleases` returns `live` + `rolling_out` releases, excludes `internal` type, joins shipped feedback items
- [ ] `upvoteFeedbackItem` is idempotent: first call votes, second call removes vote
- [ ] `upvoteCount` is never negative
- [ ] `dismissMessage` and `acknowledgeMessage` upsert receipts correctly
- [ ] `npm run typecheck` passes
