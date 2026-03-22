# Step 11 — Dashboard Messages

## Goal

Build the admin dashboard messaging module (compose, target, schedule, publish, track) and the user-facing message rendering system in the rider dashboard.

---

## Pre-requisites

- Steps 01–03 complete
- `dashboard_messages`, `message_targets`, `message_receipts` tables in schema (step 02)
- `createDashboardMessage`, `publishDashboardMessage` mutations in admin backend (step 03)

---

## Part A — Admin: message management

### A1. Message list page

`src/app/(admin)/messages/page.tsx`

**Status tabs**: All / Draft / Scheduled / Published / Expired / Paused

**Table columns**:
- Title
- Type badge (banner / inbox_card / modal / safety_alert / etc.)
- Priority badge
- Target summary (e.g. "All users" / "Pro users" / "1 specific user")
- Published date (or scheduled date)
- Delivery stats: Delivered / Viewed / Clicked
- Status badge
- Actions: "View / Edit" link

**"New message" button** → navigates to `/admin/messages/new`

---

### A2. Message compose page

`src/app/(admin)/messages/new/page.tsx`
(and `/admin/messages/[messageId]/edit` for drafts)

A three-section form:

#### Section 1 — Content

- **Type** (dropdown):
  - Banner — appears at top of dashboard
  - Inbox card — appears in notification inbox
  - Modal — shown once on login
  - Sticky warning — persistent until dismissed
  - Release announcement
  - Upgrade prompt
  - Safety alert
  - Re-fit reminder
  - Support reply (auto-filled when replying from feedback module — not created here manually)

- **Title** (required)
- **Body** (rich textarea — markdown supported, previewed inline)
- **CTA text** (optional — label for the action button)
- **CTA URL** (optional — destination when CTA is clicked)
- **Priority**: Low / Normal / High / Urgent
- **Dismissible**: toggle
- **Requires acknowledgement**: toggle
- **Locale**: All languages / EN only / NL only

#### Section 2 — Audience

**Target type selector** (can combine multiple):

Each row is a targeting rule. User must add at least one.

| Target type | Input |
|---|---|
| All users | No additional input |
| Specific user | User email search |
| Plan / tier | Checkbox: Free / Premium / Pro |
| Organization | Organization name search |
| Locale | EN / NL |
| Strava connected | Yes / No |
| Fit completed | Yes / No |
| Bike type | Dropdown: road / gravel / mtb / etc. |

"Add audience rule" button adds a row. Multiple rules are **OR** combined for v1 (union of all matching users).

Below the audience builder, show an estimated reach: "This message will be delivered to approximately N users." Computed client-side from a `estimateMessageReach` query.

#### Section 3 — Scheduling

- **Send**: Now / Scheduled
- If scheduled: date+time picker for `startsAt`
- **Expiry**: None / On date
- If expiry: date picker for `expiresAt`
- **Linked release**: optional dropdown search
- **Linked feedback item**: optional dropdown search

#### Actions

- **Save draft** — saves without publishing
- **Preview** — shows a preview of how the message will look in the user dashboard
- **Publish now** — calls `publishDashboardMessage` mutation; if audience targets exist, delivers immediately
- **Schedule** — saves with `startsAt` set

---

### A3. Message detail / performance page

`src/app/(admin)/messages/[messageId]/page.tsx`

**Top section**: title, type, status, published date, linked release/feedback.

**Delivery stats panel**:
- Total delivered
- Viewed (with %)
- Clicked (with %)
- Acknowledged (with %) — for messages requiring acknowledgement
- Dismissed (with %)

**Audience breakdown**:
- Table of targets as configured
- Estimated reach at send time

**Actions** (based on status):
- Draft: "Edit" / "Publish"
- Published: "Pause" / "Duplicate" / "Expire now"
- Paused: "Resume" / "Expire now"
- Expired: "Duplicate"

**Duplicate** → creates a new draft with all fields pre-filled from the current message.

---

## Part B — User-facing message rendering

### B1. Message delivery query

Add a new **public** query that returns a user's pending messages:

```ts
// convex/messages/queries.ts (new public module)
export const getMyMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    // Get all messages targeted to this user
    // Targeting rules (message_targets) evaluated server-side:
    // - targetType "all": match
    // - targetType "user", targetValue = userId: match
    // - targetType "plan", targetValue = user.tier: match
    // - targetType "strava_connected": check integrations table
    // - targetType "fit_completed": check fitSessions table

    // Filter to messages where:
    // - publishedAt is set
    // - startsAt <= now (or not set)
    // - expiresAt > now (or not set)
    // - pausedAt is not set
    // - user has not dismissed or acknowledged

    // Return sorted by priority (urgent > high > normal > low), then publishedAt desc
    return matchingMessages;
  },
});
```

**Important**: For v1, this query evaluates targeting by joining `message_targets` and checking each rule against the user's data. For scale, Phase 2 will pre-compute receipts at publish time; for now, evaluate at query time (acceptable for small user bases).

### B2. Mark message viewed / clicked / acknowledged

```ts
// convex/messages/mutations.ts (new public module)
export const markMessageViewed = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("message_receipts")
      .withIndex("by_message_user", (q) => q.eq("messageId", messageId).eq("userId", userId))
      .unique();
    if (existing) {
      if (!existing.viewedAt) {
        await ctx.db.patch(existing._id, { viewedAt: Date.now() });
      }
    } else {
      await ctx.db.insert("message_receipts", {
        messageId,
        userId,
        deliveredAt: Date.now(),
        viewedAt: Date.now(),
      });
    }
  },
});

export const markMessageDismissed = mutation({ ... });
export const markMessageAcknowledged = mutation({ ... });
export const markMessageClicked = mutation({ ... });
```

### B3. Dashboard notification inbox

Add a notification bell / inbox icon to the rider dashboard header (or sidebar bottom).

`src/components/layout/MessageInbox.tsx`

Renders a popover or dropdown with:
- Unread count badge on the bell icon
- List of inbox_card type messages (most recent first, max 10)
- Each card: title, body (truncated), CTA button if present, dismiss button
- "Mark all read" button

Messages of type `banner` render above the main dashboard content.
Messages of type `modal` render as a dialog shown once (check localStorage for `seenModal_{messageId}`).
Messages of type `sticky_warning` render as a persistent top banner that can only be dismissed after acknowledgement.

### B4. Dashboard banner placement

In `src/app/(dashboard)/layout.tsx`, add the message banner zone:

```tsx
import { MessageBannerZone } from "@/components/layout/MessageBannerZone";

// Inside the layout, above the page content:
<MessageBannerZone />
```

`MessageBannerZone` queries `getMyMessages`, filters to type `banner` or `sticky_warning`, and renders them stacked.

---

## Part C — Convex additions

### New public module: `convex/messages/`

```
convex/messages/
  queries.ts     — getMyMessages (targeting evaluation)
  mutations.ts   — markMessageViewed, markMessageDismissed, markMessageAcknowledged, markMessageClicked
```

### Admin query additions

```ts
// In convex/admin/queries.ts
export const estimateMessageReach = query({
  args: {
    targets: v.array(v.object({
      targetType: v.string(),
      targetValue: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { targets }) => {
    await requireAdminUserId(ctx);
    // Count users matching the target rules (OR logic)
    return { estimatedCount: number };
  },
});

export const getMessagePerformance = query({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    await requireAdminUserId(ctx);
    // Aggregate receipt counts from message_receipts
    return {
      delivered: number,
      viewed: number,
      clicked: number,
      acknowledged: number,
      dismissed: number,
    };
  },
});
```

### Admin mutation additions

```ts
export const pauseDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  ...
});

export const expireDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  ...
});

export const duplicateDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  // Creates a new draft with all fields copied
  ...
});
```

### Cron: expire scheduled messages

Add to `convex/crons.ts`:

```ts
crons.hourly(
  "expire-messages",
  { minuteUTC: 0 },
  internal.messages.actions.expireMessages,
);
```

`expireMessages` internal action: finds messages where `expiresAt < Date.now()` and `status` is published, sets them to expired.

---

## Acceptance criteria

- [ ] Admin can compose a message with all types, content fields, audience rules, and scheduling
- [ ] Estimated reach displays correctly in the composer
- [ ] Published message immediately appears for matching users in the rider dashboard
- [ ] Banner renders above dashboard content; inbox card appears in notification popover
- [ ] Modal appears once on login (localStorage-gated)
- [ ] Sticky warning cannot be dismissed without acknowledgement
- [ ] Dismiss / acknowledge / click actions write to `message_receipts`
- [ ] Admin performance page shows delivery stats aggregated from receipts
- [ ] Pause, expire, and duplicate actions work
- [ ] Scheduled messages respect `startsAt` and `expiresAt`
- [ ] Cron expires messages that have passed their expiry date
- [ ] `npm run typecheck` passes
