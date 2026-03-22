# Step 03 — `/feedback` Page: My Submissions, Feature Board, Changelog

## Goal

Build the `/feedback` page with three tabs. This is the user's central place to track their own submissions, upvote feature requests, and read the product changelog.

---

## Pre-requisites

- Step 01 complete: all queries and `upvoteFeedbackItem` mutation exist
- Step 02 complete: `FeedbackDialog` exists for "Submit feedback" button

---

## Route

`src/app/(dashboard)/feedback/page.tsx`

This is a `"use client"` page inside the `(dashboard)` route group. No sub-routes needed — tabs are client-side.

Add to `isProtectedAppPath` in `src/i18n/navigation.ts`:
```ts
"/feedback"
```

---

## 1. Page layout

```tsx
export default function FeedbackPage() {
  const [tab, setTab] = useState<"mine" | "board" | "changelog">("mine");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{messages.feedback.page.title}</h1>
          <p>{messages.feedback.page.subtitle}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          {messages.feedback.page.submitButton}
        </Button>
      </div>

      {/* Tab switcher — use Selectable in segment mode */}
      <div className="flex gap-2">
        {tabs.map(({ key, label }) => (
          <Selectable key={key} mode="button" variant="segment"
            data-active={tab === key} onClick={() => setTab(key)}>
            {label}
          </Selectable>
        ))}
      </div>

      {tab === "mine" && <MySubmissionsTab />}
      {tab === "board" && <FeatureBoardTab />}
      {tab === "changelog" && <ChangelogTab />}

      <FeedbackDialog open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
```

---

## 2. My Submissions tab

Data: `useQuery(api.feedback.queries.getMyFeedback)`

### Status badge

Map `status` to a user-friendly label and a semantic color:

| Status | Label | Color |
|---|---|---|
| `new` | Received | muted |
| `triaged` | Under review | muted |
| `needs_info` | Needs info | warning |
| `planned` | Planned | primary-soft |
| `in_progress` | In progress | primary |
| `in_qa` | Testing | primary |
| `released` | Released ✓ | success |
| `closed` | Closed | muted |
| `declined` | Not planned | muted |

Use a tokenized status pill (small `<span>` with semantic background tokens — no external badge library).

### Item row

```
┌─────────────────────────────────────────────────────────┐
│  [Bug]  Dashboard crashes on Safari        [Received]   │
│  Submitted 2 days ago                                   │
├─────────────────────────────────────────────────────────┤
│  [Feature]  Import bikes from Strava      [Released ✓]  │
│  Submitted 3 weeks ago · Released in: v1.4              │
│  1 admin reply                                          │
└─────────────────────────────────────────────────────────┘
```

Clicking a row opens `FeedbackDetailSheet` (see §5).

### Empty state

"You haven't submitted any feedback yet. Use the button above to report a bug or request a feature."

---

## 3. Feature Board tab

Data: `useQuery(api.feedback.queries.getFeatureBoard)`

### Item row

```
┌─────────────────────────────────────────────────────────┐
│  ▲ 47   Import bikes from Strava           [Planned]    │
│  ▲ 23   Dark mode for fit results       [In progress]   │
│  ▲ 12   Export fit results to PDF          [Received]   │
└─────────────────────────────────────────────────────────┘
```

The upvote button:
- Shows the count
- Filled / highlighted if `item.hasUpvoted`
- On click: `useMutation(api.feedback.mutations.upvoteFeedbackItem)({ feedbackItemId: item._id })`
- Optimistic UI: flip `hasUpvoted` and adjust count immediately, revert on error

```tsx
function UpvoteButton({ item }: { item: FeatureBoardItem }) {
  const upvote = useMutation(api.feedback.mutations.upvoteFeedbackItem);
  return (
    <button
      onClick={() => void upvote({ feedbackItemId: item._id })}
      aria-label={item.hasUpvoted ? messages.feedback.board.removeVote : messages.feedback.board.vote}
      className={cn(
        "flex flex-col items-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
        item.hasUpvoted
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent"
      )}
    >
      <span>▲</span>
      <span>{item.upvoteCount ?? 0}</span>
    </button>
  );
}
```

### Empty state

"No open feature requests yet. Be the first to suggest one!"

---

## 4. Changelog tab

Data: `useQuery(api.releases.queries.getPublicReleases)`

### Release card

```
┌─────────────────────────────────────────────────────────┐
│  v1.4 — Strava Integration          [Live]   Mar 2026   │
│                                                         │
│  Connect your Strava account to import your bikes and   │
│  sync your recent ride data for smarter fit advice.     │
│                                                         │
│  What's included:                                       │
│  ✓  Import bikes from Strava                           │
│  ✓  Strava profile photo import                        │
└─────────────────────────────────────────────────────────┘
```

- Release name as heading
- `versionLabel` shown if set
- Status badge: `rolling_out` → "Rolling out" (warning), `live` → "Live" (success)
- `releaseNotes` rendered as plain text (no markdown for v1)
- `shippedItems` listed below with a ✓ prefix — only `feature_request` type items
- Date: `liveAt` formatted as month + year

### Empty state

"No releases yet. Check back soon!"

---

## 5. Feedback Detail Sheet

When a user clicks a row in My Submissions, show a side sheet (or use `AccessibleDialog` on mobile) with:

- Type badge + status badge
- Title as heading
- Full description
- Expected / actual result (for bugs)
- Submission date
- Admin replies (non-internal comments), rendered as a thread:
  ```
  BestBikeFit4U team · 1 day ago
  "Thanks for reporting this! We've reproduced the issue and it's fixed in the next release."
  ```
- Linked release (if released): "Released in: v1.4 Strava Integration"

No user reply input in v1.

---

## 6. Navigation additions

In `src/components/layout/DashboardSidebar.tsx` (and the mobile nav in `layout.tsx`), add:

```ts
{ href: "/feedback", label: messages.nav.feedback, icon: MessageSquarePlus }
```

Place between Settings and the sign-out section.

Add to `en.ts` nav:
```ts
feedback: "Feedback & Changelog"
```

---

## 7. i18n strings

Add to `feedback` key in `en.ts`:

```ts
page: {
  title: "Feedback & Changelog",
  subtitle: "Track your submissions, vote on features, and see what's new.",
  submitButton: "Submit feedback",
  tabs: {
    mine: "My submissions",
    board: "Feature requests",
    changelog: "Changelog",
  },
},
mine: {
  empty: "You haven't submitted any feedback yet.",
  typeLabels: {
    bug: "Bug",
    feature_request: "Feature",
    support_case: "Support",
  },
  statusLabels: {
    new: "Received",
    triaged: "Under review",
    needs_info: "Needs info",
    planned: "Planned",
    in_progress: "In progress",
    in_qa: "Testing",
    released: "Released",
    closed: "Closed",
    declined: "Not planned",
  },
  releasedIn: "Released in",
  adminReply: "1 admin reply",
  adminReplies: "{count} admin replies",
},
board: {
  empty: "No open feature requests yet. Be the first to suggest one!",
  vote: "Upvote",
  removeVote: "Remove upvote",
},
changelog: {
  empty: "No releases yet. Check back soon!",
  live: "Live",
  rollingOut: "Rolling out",
  whatsIncluded: "What's included",
},
detail: {
  title: "Submission detail",
  submittedOn: "Submitted on",
  adminReplies: "Admin replies",
  noReplies: "No replies yet.",
  releasedIn: "Released in",
},
```

---

## Acceptance criteria

- [ ] `/feedback` page renders with three tabs
- [ ] My Submissions shows the user's items with correct status labels and colors
- [ ] Status `released` items show the release name
- [ ] Items with admin comments show the reply count
- [ ] Clicking an item opens the detail sheet showing admin replies
- [ ] Feature Board lists open feature requests sorted by upvote count
- [ ] Upvote button toggles; count updates optimistically
- [ ] Already-voted items show the filled/highlighted button state
- [ ] Changelog shows live/rolling_out releases with notes and shipped features
- [ ] Empty states render correctly for all three tabs
- [ ] Sidebar and mobile nav link to `/feedback`
- [ ] `npm run typecheck` passes
