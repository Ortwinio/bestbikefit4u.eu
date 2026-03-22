# Step 09 — Feedback, Bug Reports & Support

## Goal

Build the feedback management module: the admin inbox for bugs, feature requests, fit quality concerns, and support cases. Includes the user-facing feedback submission UI in the rider dashboard, and the admin triage, assignment, and reply workflow.

---

## Pre-requisites

- Steps 01–03 complete
- `feedback_items` and `feedback_comments` tables in schema (step 02)
- `listFeedbackItems`, `getFeedbackDetail` queries in admin backend (step 03)
- `updateFeedbackStatus`, `addFeedbackComment`, `linkFeedbackToRelease` mutations in admin backend (step 03)

---

## Part A — User-facing feedback submission

### A1. Feedback button placement

Add a "Report an issue / Give feedback" entry point to the rider dashboard. Place it in:
1. The dashboard sidebar (bottom section, near settings)
2. The fit results page — a "Something looks wrong?" link beneath the recommendations

### A2. Feedback submission dialog

`src/components/feedback/FeedbackDialog.tsx`

A modal triggered by the above entry points. Steps:

**Step 1 — Type selection**

```
What would you like to share?

[ Bug report ]          [ Feature request ]
[ Fit quality concern ] [ Question / Support ]
```

**Step 2 — Form fields** (differ by type)

Bug report form:
- Title (required, max 100 chars)
- Description: "What happened?" (required)
- Expected result: "What did you expect?" (optional)
- Severity selector: Low / Medium / High (radio)
- Auto-attached: current page URL, current fit session ID if on results page

Feature request form:
- Title (required)
- Problem to solve (required)
- Desired outcome (optional)
- Category (dropdown: Fit accuracy / Gear recommendations / Mobile / Reporting / Other)

Fit quality concern form:
- Which result seems off? (dropdown of recommendation types)
- Description (required)
- Auto-attached: fit session ID

Support / Question form:
- Title (required)
- Description (required)

**Step 3 — Confirmation**

"Thank you for your feedback! We've received your report. You'll see updates in your dashboard."

### A3. Convex mutation — user feedback submission

```ts
// convex/feedback/mutations.ts (public, not admin)
export const submitFeedback = mutation({
  args: {
    type: v.union(
      v.literal("bug"),
      v.literal("feature_request"),
      v.literal("fit_quality"),
      v.literal("billing"),
      v.literal("general")
    ),
    title: v.string(),
    description: v.string(),
    expectedResult: v.optional(v.string()),
    severity: v.optional(v.string()),
    linkedFitRunId: v.optional(v.string()),
    linkedBikeId: v.optional(v.id("bikes")),
    browserInfo: v.optional(v.string()),
    appVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await ctx.db.insert("feedback_items", {
      userId,
      ...args,
      status: "new",
      createdAt: Date.now(),
    });
  },
});
```

---

## Part B — Admin feedback inbox

### B1. Feedback list page

`src/app/(admin)/feedback/page.tsx`

**View tabs** (at top):
- All
- Bugs
- Feature requests
- Fit quality
- Support

**Filters** (inline, right of tabs):
- Status: All / New / Triaged / Planned / Closed
- Priority: All / Critical / High / Medium / Low
- Assigned to me (toggle)

**Table columns**:
- Title (clickable)
- Type badge (color-coded)
- Priority badge
- Status badge
- Reporter name
- Reported date
- Assigned to (name or "Unassigned")
- Linked release (if any)

**Bulk actions** (checkbox selection):
- Change status
- Assign to admin
- Mark as duplicate of...

### B2. Feedback detail page

`src/app/(admin)/feedback/[itemId]/page.tsx`

**Left panel — Item detail**

- Title (editable inline by admin)
- Type badge, priority badge, status badge
- Reporter: name, plan badge, link to user detail
- Reported: date, page, fit run link, bike link (if attached)
- Browser info (collapsible)
- Description, expected result, actual result (from submission)

**Right panel — Admin actions**

Status workflow selector:
```
New → Triaged → Needs Info → Planned → In Progress → In QA → Released → Closed
                                                              ↓
                                                            Declined
```

Priority selector (dropdown).

Assign to admin (user selector showing only admin users).

**Link to release**: Dropdown of releases + "Create new release" shortcut. On select: calls `linkFeedbackToRelease` mutation.

**Mark as duplicate of**: Search input for other feedback items. On select: sets `duplicateOf` field and auto-closes this item.

**Product area tagger**: Dropdown (Fit engine / Geometry / Billing / Mobile / Reports / Dashboard / Integrations / Other).

**Comment thread** (below both panels):

- Shows all `feedback_comments` for this item
- Internal comments (isInternal = true): shown with a gray background labeled "Internal note — not visible to user"
- User-visible replies: shown with a highlighted border, labeled "Reply sent to user"
- Text input + toggle "Internal note / Reply to user" + Submit button
- On submit: calls `addFeedbackComment`

If type is "Reply to user": also creates a `dashboard_messages` record with:
- type = "support_reply"
- target = `{ targetType: "user", targetValue: userId }`
- body = the comment text
- isDismissible = true

This closes the feedback loop: the user sees the reply in their dashboard inbox.

### B3. Feature request board

`src/app/(admin)/feedback/feature-requests/page.tsx`

A Kanban-style or grouped list view of feature requests, grouped by status.

Within each group, items are sorted by `upvoteCount` descending. Show:
- Title, upvote count, requester count (if duplicates merged), plan breakdown of requesters, linked release.

**Merge duplicates**: Select multiple feature requests, click "Merge" → merges into a single item, preserving all unique requesters and summing upvote counts.

---

## Part C — User-facing feedback status display

### C1. Feedback history in user dashboard

Add a "My reports" section to the settings page or a new `/dashboard/support` page.

Shows a list of the user's own `feedback_items`:
- Title, type badge, current status badge
- If a reply was sent: shows the reply inline (queries `message_receipts` for this user filtered to `type = "support_reply"`)
- If linked to a release that is `"live"`: shows "Fixed in [release name]"

This closes the loop: users can see that their bug was acknowledged, planned, and shipped.

---

## Convex additions needed

### New public module

Create `convex/feedback/mutations.ts` (user-facing, not admin):
- `submitFeedback` (defined above)

Create `convex/feedback/queries.ts` (user-facing):
```ts
export const getMyFeedbackItems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("feedback_items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});
```

### Admin queries (additions to step 03)

```ts
export const listFeedbackItems = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedToMe: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  ...
});

export const getFeedbackDetail = query({
  args: { feedbackItemId: v.id("feedback_items") },
  // Returns item + comments + user detail + linked release
  ...
});

export const getFeedbackStats = query({
  // For overview dashboard widget
  // Returns: counts by status, type, priority
  ...
});
```

### Admin mutations (additions to step 03)

```ts
export const updateFeedbackItem = mutation({
  args: {
    feedbackItemId: v.id("feedback_items"),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    productArea: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  ...
});

export const mergeFeedbackItems = mutation({
  args: {
    primaryId: v.id("feedback_items"),
    duplicateIds: v.array(v.id("feedback_items")),
  },
  // Sets duplicateOf on each duplicate, sums upvoteCounts into primary
  ...
});
```

---

## Acceptance criteria

- [ ] Feedback dialog is accessible from sidebar and fit results page
- [ ] Bug, feature request, fit quality, and support forms capture correct fields
- [ ] Submitted feedback appears in admin feedback list immediately
- [ ] Admin can change status, priority, assignment — changes persist and audit logged
- [ ] Comment thread shows internal notes and user-visible replies separately
- [ ] "Reply to user" sends a dashboard_messages record to the user
- [ ] User can see their submitted feedback items and replies in dashboard
- [ ] Feedback linked to a released item shows "Fixed in [release]" to the user
- [ ] Merge duplicates sums upvote counts and sets duplicateOf field
- [ ] Feature request board shows items sorted by upvote count
- [ ] `npm run typecheck` passes
