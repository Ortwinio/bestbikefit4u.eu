# Step 02 — Feedback Dialog, Validation, and Floating Entry Point

## Goal

Build a dashboard-wide submission experience that is modal-first, type-safe, tokenized, and reusable from multiple entry points.

---

## Deliverables

### 1. `FeedbackDialog`

Create a controlled dialog component in `src/components/feedback/FeedbackDialog.tsx`.

Required props:

```ts
interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  defaultType?: "bug" | "feature_request" | "support_case";
  linkedSessionId?: Id<"fitSessions">;
  linkedBikeId?: Id<"bikes">;
  pagePath?: string;
}
```

Behavior requirements:

- type selector step unless `defaultType` is provided
- form step with fields varying by type
- confirmation step after success
- local reset on close/reopen
- loading and error states

### 2. Validation contract

- required title/description fields by type
- no submit while invalid or pending
- user-facing inline validation messages
- bug reports capture:
  - current dashboard path
  - browser metadata
  - linked session/bike when present

### 3. Floating dashboard trigger

Create `src/components/feedback/FeedbackFloatingButton.tsx`.

Requirements:

- visible on all dashboard pages
- desktop and mobile safe positioning
- accessible label
- opens `FeedbackDialog`
- uses tokenized styles via the existing shared button/dialog primitives

### 4. Dashboard integration

Wire the floating trigger into `src/app/(dashboard)/layout.tsx`.

### 5. i18n

Add the complete `feedback` key set required by this step in both locale files.

---

## Design constraints

- Use existing shared UI primitives; do not add bespoke modal/button systems
- Do not introduce hard-coded blue/gray visual styling when tokenized classes exist
- Use the existing dashboard locale/message infrastructure

---

## Acceptance criteria

- [ ] Floating trigger appears on every dashboard page
- [ ] Dialog opens and closes correctly from the trigger
- [ ] Default type skips the type-selection step
- [ ] Required fields validate per submission type
- [ ] Path and browser metadata are captured for bug reports
- [ ] Session and bike context render when provided
- [ ] Successful submission shows confirmation state
- [ ] Reopening the dialog resets prior form state
- [ ] All strings are localized in English and Dutch
- [ ] `npm run typecheck` passes

