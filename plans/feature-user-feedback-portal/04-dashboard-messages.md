# Step 04 — Dashboard Messages

## Goal

Render admin-authored messages in the dashboard layout. Different message types surface in different places: banners at the top, inbox cards on the dashboard home, modals on first view, release announcements in the changelog.

---

## Pre-requisites

- Step 01 complete: `dismissMessage` and `acknowledgeMessage` mutations exist
- `getMyMessages` query exists in `convex/messages/queries.ts`

---

## 1. Message type → rendering location

| `type` | Where rendered | Dismissible |
|---|---|---|
| `banner` | Top of every page (below nav) | Yes — X button |
| `sticky_warning` | Top of every page, cannot be dismissed | No |
| `inbox_card` | Dashboard home page card area | Yes |
| `release_announcement` | Dashboard home page card area | Yes |
| `upgrade_prompt` | Dashboard home page card area | Yes |
| `modal` | Full-screen overlay, shown once on load | Yes — acknowledged on close |
| `safety_alert` | Top of every page, warning styling | No |

---

## 2. `useDashboardMessages` hook extension

Create `src/hooks/useAdminMessages.ts` (different from the i18n hook):

```ts
export function useAdminMessages() {
  const messages = useQuery(api.messages.queries.getMyMessages);
  const dismiss = useMutation(api.messages.mutations.dismissMessage);
  const acknowledge = useMutation(api.messages.mutations.acknowledgeMessage);

  const banners = messages?.filter(
    (m) => m.type === "banner" || m.type === "sticky_warning" || m.type === "safety_alert"
  ) ?? [];

  const cards = messages?.filter(
    (m) =>
      m.type === "inbox_card" ||
      m.type === "release_announcement" ||
      m.type === "upgrade_prompt"
  ) ?? [];

  const modals = messages?.filter((m) => m.type === "modal") ?? [];

  return { banners, cards, modals, dismiss, acknowledge };
}
```

---

## 3. Banner component

Create `src/components/messages/DashboardBanner.tsx`:

```tsx
export function DashboardBanner({ message, onDismiss }: {
  message: DashboardMessage;
  onDismiss?: () => void;
}) {
  const isStickyOrSafety =
    message.type === "sticky_warning" || message.type === "safety_alert";

  return (
    <div className={cn(
      "flex items-start gap-3 px-4 py-3 text-sm",
      message.type === "safety_alert"
        ? "bg-[color:color-mix(in_oklch,var(--destructive)_15%,var(--card))] text-[color:var(--destructive-foreground)]"
        : message.type === "sticky_warning"
        ? "bg-[color:color-mix(in_oklch,var(--warning)_15%,var(--card))] text-[color:var(--warning-foreground)]"
        : "bg-[color:var(--secondary)] text-[color:var(--foreground)]"
    )}>
      <div className="flex-1">
        <span className="font-semibold">{message.title}</span>
        {" — "}
        <span>{message.body}</span>
        {message.ctaText && message.ctaUrl && (
          <a href={message.ctaUrl} className="ml-2 font-semibold underline">
            {message.ctaText}
          </a>
        )}
      </div>
      {!isStickyOrSafety && onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

---

## 4. Integration into dashboard layout

In `src/app/(dashboard)/layout.tsx`:

```tsx
const { banners, modals, dismiss, acknowledge } = useAdminMessages();

// In JSX, above the <main> tag:
{banners.map((banner) => (
  <DashboardBanner
    key={String(banner._id)}
    message={banner}
    onDismiss={
      banner.type !== "sticky_warning" && banner.type !== "safety_alert"
        ? () => void dismiss({ messageId: banner._id })
        : undefined
    }
  />
))}

// Modal — show only the first unacknowledged modal
{modals[0] && (
  <DashboardMessageModal
    message={modals[0]}
    onClose={() => void acknowledge({ messageId: modals[0]._id })}
  />
)}
```

---

## 5. Inbox cards on dashboard home

In `src/app/(dashboard)/dashboard/page.tsx`:

```tsx
const { cards, dismiss } = useAdminMessages();

// Render above or below existing dashboard content:
{cards.length > 0 && (
  <div className="space-y-3">
    {cards.map((card) => (
      <DashboardMessageCard
        key={String(card._id)}
        message={card}
        onDismiss={() => void dismiss({ messageId: card._id })}
      />
    ))}
  </div>
)}
```

### `DashboardMessageCard` component

```tsx
export function DashboardMessageCard({ message, onDismiss }: {
  message: DashboardMessage;
  onDismiss: () => void;
}) {
  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardContent className="flex items-start gap-4 py-4">
        <div className="flex-1">
          {message.type === "release_announcement" && (
            <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-wide text-[color:var(--success)]">
              New release
            </span>
          )}
          <p className="font-semibold text-[color:var(--foreground)]">{message.title}</p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{message.body}</p>
          {message.ctaText && message.ctaUrl && (
            <a href={message.ctaUrl} className="mt-2 inline-block text-sm font-semibold text-[color:var(--primary)]">
              {message.ctaText} →
            </a>
          )}
        </div>
        <button onClick={onDismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}
```

---

## 6. Modal component

Create `src/components/messages/DashboardMessageModal.tsx`:

```tsx
export function DashboardMessageModal({ message, onClose }: {
  message: DashboardMessage;
  onClose: () => void;
}) {
  return (
    <AccessibleDialog open title={message.title} description={message.body} onClose={onClose}>
      {message.ctaText && message.ctaUrl && (
        <div className="mt-4">
          <Button asChild>
            <a href={message.ctaUrl}>{message.ctaText}</a>
          </Button>
        </div>
      )}
      <div className="mt-3">
        <Button variant="ghost" onClick={onClose}>
          Dismiss
        </Button>
      </div>
    </AccessibleDialog>
  );
}
```

---

## Acceptance criteria

- [ ] Banner messages render in the dashboard layout across all pages
- [ ] Safety alerts and sticky warnings cannot be dismissed
- [ ] Regular banners dismiss with one click and the receipt is persisted
- [ ] Modal messages appear once on next login; closing records an acknowledged receipt and they don't reappear
- [ ] Inbox cards appear on the dashboard home page
- [ ] Release announcement cards show a "New release" label
- [ ] Dismissed cards do not reappear after page reload
- [ ] No messages renders when there are none (no empty container)
- [ ] `npm run typecheck` passes
