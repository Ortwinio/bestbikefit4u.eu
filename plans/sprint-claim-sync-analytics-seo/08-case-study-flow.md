# T09 — Case study recruitment flow

**Ticket:** T09
**Effort:** 1 developer-day
**Deploys independently:** Yes

---

## Context

The pricing page and homepage have no social proof. Testimonials and case studies are the highest-converting trust signal for a consumer SaaS product at this stage. This ticket builds the supply-side: a low-friction, GDPR-compliant opt-in that surfaces to users after they receive their fit results.

The goal is to collect 10–20 willing participants in the first month who can be interviewed by email and turned into published case studies.

---

## User experience

### Step 1 — Opt-in card (fit results page)

After the fit results section, a card appears at the very bottom of the page:

```
┌────────────────────────────────────────────────────┐
│  Want to be featured?                              │
│                                                    │
│  We're collecting real rider stories. If this fit  │
│  gave you useful targets, we'd love to include     │
│  your experience on BestBikeFit4U. Takes 10        │
│  minutes by email. No marketing without consent.   │
│                                                    │
│  [Yes, I'm interested]    [Maybe later]           │
└────────────────────────────────────────────────────┘
```

"Maybe later" dismisses the card for the current session. It reappears after the user's next completed fit session. It does not persist a permanent dismissal.

"Yes, I'm interested" opens the intake form as a modal.

---

### Step 2 — Intake form (modal)

```
How long have you been cycling?
  ○ Less than 1 year
  ○ 1–3 years
  ○ 3–10 years
  ○ 10+ years

What were you trying to solve? (optional, max 200 chars)
[                                                  ]

Did the fit targets help?
  ○ Yes, they gave me clear direction
  ○ Partially — still working on it
  ○ Still testing

Would you be willing to do a short email interview?
  ○ Yes
  ○ No

Your first name
[____________]

Email address (pre-filled from account, editable)
[____________________________]

☐ I agree to BestBikeFit4U contacting me by email about this case study.
  (Required — GDPR consent. You can withdraw at any time.)

[Submit]   [Cancel]
```

On submit:
- Write record to Convex `caseStudyLeads` table
- Send internal notification email to `support@bestbikefit4u.eu` via Resend
- Show confirmation message: "Thanks — we'll be in touch by email."
- Close modal

---

## Convex schema changes

Add to `convex/schema.ts`:

```ts
caseStudyLeads: defineTable({
  userId: v.id("users"),
  sessionId: v.id("fitSessions"),
  cyclingExperience: v.union(
    v.literal("lt_1yr"),
    v.literal("1_3yr"),
    v.literal("3_10yr"),
    v.literal("10plus_yr")
  ),
  problemDescription: v.optional(v.string()),
  helpRating: v.union(
    v.literal("yes"),
    v.literal("partial"),
    v.literal("still_testing")
  ),
  willingToInterview: v.boolean(),
  firstName: v.string(),
  email: v.string(),
  consentGiven: v.boolean(),     // must be true — GDPR
  submittedAt: v.number(),       // Date.now()
}).index("by_user", ["userId"]),
```

---

## Convex mutation

Create `convex/caseStudies/mutations.ts`:

```ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";

export const submitCaseStudyLead = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    cyclingExperience: v.union(
      v.literal("lt_1yr"),
      v.literal("1_3yr"),
      v.literal("3_10yr"),
      v.literal("10plus_yr")
    ),
    problemDescription: v.optional(v.string()),
    helpRating: v.union(
      v.literal("yes"),
      v.literal("partial"),
      v.literal("still_testing")
    ),
    willingToInterview: v.boolean(),
    firstName: v.string(),
    email: v.string(),
    consentGiven: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    // Idempotency: one lead per user per session
    const existing = await ctx.db
      .query("caseStudyLeads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();

    if (existing) return existing._id;

    if (!args.consentGiven) {
      throw new Error("Consent is required");
    }

    const id = await ctx.db.insert("caseStudyLeads", {
      userId,
      ...args,
      submittedAt: Date.now(),
    });

    // Schedule internal notification email
    await ctx.scheduler.runAfter(0, "caseStudies/emails:sendLeadNotification", {
      leadId: id,
    });

    return id;
  },
});
```

---

## Internal notification email

Create `convex/caseStudies/emails.ts`:

```ts
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { BRAND } from "../lib/brand"; // or import the support email directly

export const sendLeadNotification = internalAction({
  args: { leadId: v.id("caseStudyLeads") },
  handler: async (ctx, { leadId }) => {
    const lead = await ctx.runQuery("caseStudies/queries:getLead", { leadId });
    if (!lead) return;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: BRAND.authEmailFrom,
      to: "support@bestbikefit4u.eu",
      subject: `New case study lead: ${lead.firstName}`,
      html: `
        <p><strong>Name:</strong> ${lead.firstName}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Cycling experience:</strong> ${lead.cyclingExperience}</p>
        <p><strong>Problem:</strong> ${lead.problemDescription ?? "—"}</p>
        <p><strong>Did it help:</strong> ${lead.helpRating}</p>
        <p><strong>Willing to interview:</strong> ${lead.willingToInterview ? "Yes" : "No"}</p>
        <p><strong>Submitted:</strong> ${new Date(lead.submittedAt).toISOString()}</p>
      `,
    });
  },
});
```

---

## Dashboard component

Create `src/components/features/casestudy/CaseStudyOptIn.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui";

interface Props {
  sessionId: Id<"fitSessions">;
  userEmail: string;
}

export function CaseStudyOptIn({ sessionId, userEmail }: Props) {
  const [state, setState] = useState<"idle" | "form" | "submitted" | "dismissed">("idle");
  const submitLead = useMutation(api.caseStudies.mutations.submitCaseStudyLead);

  // Form state
  const [experience, setExperience] = useState<string>("");
  const [problem, setProblem] = useState("");
  const [helpRating, setHelpRating] = useState<string>("");
  const [willingToInterview, setWillingToInterview] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState(userEmail);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (state === "dismissed" || state === "submitted") return null;

  // ... render opt-in card and form modal
}
```

Wire `<CaseStudyOptIn sessionId={session._id} userEmail={user.email} />` into the bottom of `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`.

---

## Analytics events

Add to `MarketingEventTracker` event types:

```ts
| "case_study_opt_in_shown"
| "case_study_opt_in_clicked"
| "case_study_dismissed"
| "case_study_submitted"
```

Fire each event at the appropriate interaction point in `CaseStudyOptIn.tsx`.

---

## GDPR requirements

- [ ] Consent checkbox is present and unchecked by default
- [ ] Checkbox label clearly states the purpose: "I agree to BestBikeFit4U contacting me by email about this case study."
- [ ] `consentGiven: false` is rejected server-side (mutation throws)
- [ ] The word "marketing" must not appear in the purpose statement — this is not marketing consent, it is research/interview consent
- [ ] No collected data is used in published marketing without the user explicitly agreeing to be featured (that is a second consent step, handled manually during the interview process)
- [ ] User can request deletion of their lead record under GDPR Article 17 — the existing data deletion flow must include `caseStudyLeads`

---

## Acceptance criteria

- [ ] Opt-in card renders at the bottom of the fit results page for all users
- [ ] "Maybe later" dismisses the card for the current browser session — it reappears after the next fit session
- [ ] "Yes, I'm interested" opens the intake modal
- [ ] Intake form cannot be submitted without the consent checkbox checked
- [ ] Successful submission writes a row to `caseStudyLeads` in Convex
- [ ] Second submission for the same user + session returns the existing lead ID (idempotent)
- [ ] Internal notification email arrives at `support@bestbikefit4u.eu` within 60 seconds of submission
- [ ] Confirmation message displays after successful submit
- [ ] `case_study_opt_in_shown`, `case_study_opt_in_clicked`, `case_study_dismissed`, `case_study_submitted` events fire and appear in GA4

## Edge cases

- Free-tier users see the opt-in card — case study value is tier-agnostic
- If the user's account email is unavailable (edge case in auth), the email field renders empty and is required
- The modal must trap focus for accessibility and close on Escape key
- A user who dismisses, completes another fit session, and returns should see the card again — do not use localStorage to persist dismissal; use React state only (resets on page reload)

## Human audit checklist

- [ ] Complete a full fit session as a test user — confirm opt-in card appears
- [ ] Dismiss with "Maybe later" — refresh page — confirm card reappears
- [ ] Submit the form — check Convex dashboard for new row in `caseStudyLeads`
- [ ] Check `support@bestbikefit4u.eu` inbox — confirm notification email arrives
- [ ] Try to submit without ticking consent checkbox — confirm it is blocked
- [ ] Submit twice for the same session — confirm only one row in database
