# Step 02 — Feedback Form & Floating Button

## Goal

Build the feedback submission form and a floating button that opens it from anywhere in the dashboard. The form adapts its fields to the submission type (bug / feature request / support).

---

## Pre-requisites

- Step 01 complete: `submitFeedback` mutation already exists in `convex/feedback/mutations.ts`
- Prototyper UI `AccessibleDialog`, `Input`, `Textarea`, `Button`, `RadioGroup`/`Selectable` available

---

## 1. Component: `FeedbackDialog`

Create `src/components/feedback/FeedbackDialog.tsx`.

This is a controlled dialog that can be opened from the floating button or from a direct link with a pre-set type.

### Props

```ts
interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  defaultType?: "bug" | "feature_request" | "support_case";
  // Context pre-fill
  linkedSessionId?: Id<"fitSessions">;
  linkedBikeId?: Id<"bikes">;
}
```

### Step 1 — Type selector

Show three cards/buttons the user clicks:

```
┌──────────────────────────────────────────────────────┐
│  What would you like to do?                          │
│                                                      │
│  🐛  Report a bug                                    │
│  ✨  Request a feature                               │
│  💬  Ask a support question                          │
└──────────────────────────────────────────────────────┘
```

If `defaultType` is set, skip step 1 and go directly to step 2.

### Step 2 — Fields by type

**Bug report fields:**
- `title`: Input — "Short description of the problem" (required)
- `actualResult`: Textarea — "What happened?" (required)
- `expectedResult`: Textarea — "What did you expect?" (optional)
- Page path: auto-filled from `window.location.pathname`, shown as read-only text
- Linked session: shown if `linkedSessionId` is provided, as read-only badge
- Browser info: auto-captured as JSON string (`navigator.userAgent`, viewport size)

**Feature request fields:**
- `title`: Input — "Feature title" (required)
- `description`: Textarea — "Describe the feature you'd like" (required)
- Optional prompt below: "Why would this improve your bike fit?" maps to `expectedResult`

**Support question fields:**
- `title`: Input — "Subject" (required)
- `description`: Textarea — "Your question" (required)

### Step 3 — Confirmation

After successful submit:
```
✓ Thanks! We received your [bug report / feature request / question].
  You can track its status in Feedback & Changelog.

  [View my submissions]   [Close]
```

### State

```ts
const [step, setStep] = useState<"type" | "form" | "done">("type");
const [type, setType] = useState<FeedbackType | null>(defaultType ?? null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Submit handler

```ts
const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await submitFeedback({
      type: type!,
      title,
      description,
      expectedResult: expectedResult || undefined,
      actualResult: actualResult || undefined,
      pagePath: window.location.pathname,
      linkedSessionId,
      linkedBikeId,
      browserInfoJson: JSON.stringify({
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      }),
    });
    setStep("done");
  } catch {
    setError(messages.feedback.form.submitError);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 2. Component: `FeedbackFloatingButton`

Create `src/components/feedback/FeedbackFloatingButton.tsx`.

A fixed button in the bottom-right corner of the dashboard:

```tsx
<div className="fixed bottom-6 right-6 z-40">
  <Button
    onClick={() => setOpen(true)}
    className="rounded-full shadow-lg"
    aria-label={messages.feedback.floatingButton.aria}
  >
    <MessageSquarePlus className="h-4 w-4 mr-2" />
    {messages.feedback.floatingButton.label}
  </Button>
  <FeedbackDialog open={open} onClose={() => setOpen(false)} />
</div>
```

Use `MessageSquarePlus` from `lucide-react`.

Add `FeedbackFloatingButton` to `src/app/(dashboard)/layout.tsx` — inside the main content wrapper but outside `<main>`, so it floats over all pages.

---

## 3. i18n strings

Add a top-level `feedback` key to both `en.ts` and `nl.ts`:

**`en.ts`:**

```ts
feedback: {
  floatingButton: {
    label: "Feedback",
    aria: "Submit feedback or report a bug",
  },
  typeSelector: {
    title: "What would you like to do?",
    bug: "Report a bug",
    bugDescription: "Something isn't working as expected",
    feature: "Request a feature",
    featureDescription: "Suggest an improvement or new capability",
    support: "Ask a question",
    supportDescription: "Get help with using BestBikeFit4U",
  },
  form: {
    titleLabel: "Title",
    titlePlaceholder: "Short description",
    descriptionLabel: "Description",
    actualResultLabel: "What happened?",
    actualResultPlaceholder: "Describe what went wrong",
    expectedResultLabel: "What did you expect?",
    expectedResultPlaceholder: "Describe what should have happened",
    featureWhyLabel: "Why would this help?",
    featureWhyPlaceholder: "Optional — helps us understand the value",
    pageLabel: "Page",
    submit: "Submit",
    back: "Back",
    submitError: "Could not submit. Please try again.",
  },
  done: {
    title: "Thanks for your feedback!",
    body: "We've received your {type}. You can track its status in Feedback & Changelog.",
    viewSubmissions: "View my submissions",
    close: "Close",
    typeBug: "bug report",
    typeFeature: "feature request",
    typeSupport: "support question",
  },
},
```

**`nl.ts`** (translate accordingly).

---

## Acceptance criteria

- [ ] Floating button is visible on all dashboard pages (desktop + mobile)
- [ ] Clicking the button opens the type selector
- [ ] Selecting a type shows the correct form fields
- [ ] Form validates required fields before submitting
- [ ] Page path and browser info are auto-captured
- [ ] Linked session/bike are pre-filled when provided
- [ ] Successful submit shows the confirmation screen
- [ ] "View my submissions" link navigates to `/feedback`
- [ ] Dialog closes cleanly and resets state on re-open
- [ ] `npm run typecheck` passes
