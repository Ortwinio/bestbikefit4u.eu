# Step 04 — Dashboard Message Delivery

## Goal

Render admin-authored messages inside the dashboard shell with clear targeting, placement, and receipt behavior.

---

## Required first action

Audit the existing message domain:

- query shape of `getMyMessages`
- existing message types
- current receipt tables and indexes
- any existing dismiss/acknowledge mutations

If the real contract differs from this plan, adapt the implementation and document the delta.

---

## Deliverables

### 1. Message classification hook

Create a user-facing hook that:

- loads current user messages
- groups them into:
  - shell banners
  - dashboard-home cards
  - modal candidates
- exposes dismiss and acknowledge actions

### 2. Shell banners

Render in dashboard layout:

- `banner`
- `sticky_warning`
- `safety_alert`

Requirements:

- dismissible only when allowed by type
- persisted dismissal
- tokenized severity styling

### 3. Dashboard home cards

Render on dashboard home only:

- `inbox_card`
- `release_announcement`
- `upgrade_prompt`

Requirements:

- dismissible
- no empty container when none exist

### 4. Modal delivery

Render at most one highest-priority modal candidate at a time.

Requirements:

- shown once until acknowledged
- acknowledgement persisted
- does not continuously reopen on the same session after close

### 5. Changelog tie-in

If `release_announcement` cards also need deep links into `/feedback?tab=changelog`, ensure the CTA is routed consistently with locale-aware navigation helpers.

---

## Acceptance criteria

- [ ] Banner types render in the dashboard shell
- [ ] Non-dismissible banner types have no dismiss action
- [ ] Dismissible banner/card types persist dismissal
- [ ] Dashboard home cards render only on dashboard home
- [ ] Modal messages acknowledge once and do not reappear after acknowledgement
- [ ] All message CTAs use the standard navigation/link patterns
- [ ] No empty message containers render when no messages exist
- [ ] `npm run typecheck` passes

