# Email Lifecycle Plan — Sprint: Claim Sync, Analytics & SEO

**Date:** 2026-03-31
**Author:** Lifecycle marketing
**Infrastructure:** Resend (already integrated via `AUTH_RESEND_KEY`), Convex scheduled actions for triggers

---

## Sequence Map

```
[Sign up]
    │
    ▼
[01] Welcome + First Fit Nudge  (T+0 min, auth magic-link delivered by @convex-dev/auth)
    │
    ▼ (if fit not started within 48h)
[02] Fit Reminder               (T+48h, triggered by Convex cron)
    │
    ▼ (after first fit completed)
[03] Results Recap + Next Steps (T+1h post-completion)
    │
    ├─── [if free tier] ──► [04] Upgrade Nudge   (T+72h post-results)
    │
    └─── [if case study opt-in submitted] ──► [05] Case Study Confirmation (T+0 immediate)

[Win-back]
    │
    └─── No activity for 21 days ──► [06] Re-engagement  (T+21d since last login)

[Admin internal]
    │
    └─── Case study lead submitted ──► [07] Internal Lead Notification (T+0 immediate, to support@)
```

---

## Flow Segments

### Pre-purchase (free-tier users who have not upgraded)
Emails 01, 02, 03, 04, 06

### Post-purchase (Pro subscribers)
Email 03 (same results recap, no upgrade nudge)
Email 05 (if case study opt-in submitted)

### Win-back
Email 06

---

## Email Briefs

---

### [01] Welcome — Magic-Link Auth Email

**Type:** Transactional (already sent by `@convex-dev/auth`)
**Trigger:** User requests a sign-in code
**Audience:** All users (new and returning)
**Sent by:** Resend, via `AUTH_RESEND_KEY` and `AUTH_EMAIL_FROM`

**Current state:** The magic-link email is managed by `@convex-dev/auth`. The from address is `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`.

**Recommended copy additions (customize in auth config):**
The default `@convex-dev/auth` template is minimal. Customize the email body to include a brief orientation paragraph:

```
Subject: Your BestBikeFit4U sign-in code

Here is your sign-in code: [CODE]

(Valid for 10 minutes. If you didn't request this, you can ignore this email.)

---
Once you're in, you'll need two measurements to get started: your height and inseam.
Takes about 10 minutes. Your fit targets are waiting.
```

**CTA:** Sign-in code (native auth flow)
**Success metric:** Code claimed within 10 minutes (tracked by Convex auth session)

---

### [02] Fit Not Started — Reminder

**Type:** Lifecycle trigger
**Trigger:** User created account but has zero `fitSessions` records after 48 hours
**Audience:** Free-tier users only (new sign-ups with no fit session)
**Implementation:** Convex cron job queries `users` created >48h ago with no `fitSessions`

**Subject line options:**
- `Your bike fit is waiting — takes 10 minutes`
- `Two measurements away from your setup targets`
- `You signed up — now let's get your fit numbers`

**Body outline:**
1. Acknowledge the sign-up without being patronizing
2. Remove the friction barrier: explain exactly what's needed (height + inseam)
3. What they'll receive (saddle height, reach, stem, crank, frame size)
4. One CTA

**Suggested copy:**

```
Hi [first name or "there"],

You signed up for BestBikeFit4U — but your fit targets are still sitting in the queue.

Here's all you need to start:
→ Your height (in cm or inches)
→ Your inseam measurement (a tape measure and a book will do)

In 10 minutes you'll have:
• Saddle height range
• Handlebar reach and drop
• Stem length guidance
• Frame size recommendation

These are real numbers — not "try raising your saddle a bit" advice.

[Get my fit targets]
```

**CTA:** `Get my fit targets` → `/login` with `src=reminder_email`
**Success metric:** Click-to-fit-start rate (track `cta_click` event with `section: "email_reminder"`)

---

### [03] Results Recap + Next Steps

**Type:** Post-event transactional
**Trigger:** `recommendations` record created for a session (fit completed)
**Audience:** All users who complete a fit session
**Implementation:** Convex scheduled action after `recommendations.mutations.generate` completes

**Subject line options:**
- `Your fit targets are ready — here's what to adjust first`
- `[First name], your setup numbers are in`
- `Saddle height: [Xmm]. Here's your full fit plan.`

**Body outline:**
1. Lead with the single most important number (saddle height) — create immediate value
2. Bullet the top 3–4 adjustments in priority order
3. Remind them the full report is in their dashboard
4. One soft upgrade mention for free-tier users (not aggressive — just present)
5. Optional: link to the relevant pain page if a pain area was reported

**Suggested copy:**

```
Your fit numbers are ready.

Here's where to start:

Saddle height:     [Xmm]
Handlebar drop:    [Xmm]
Reach adjustment:  [direction + mm]

Your full report — saddle setback, stem length, crank guidance, frame size — is in your dashboard.

[View my full report]

---
[If pain area was reported]
You flagged [knee / lower back / hand] discomfort during the questionnaire.
We've included position-specific guidance in your report.
Read the guide: [Pain page link]
---

Made an adjustment? Let us know how it went — your feedback makes the next fit more accurate.
```

**CTA (primary):** `View my full report` → `/fit/[sessionId]/results`
**CTA (secondary):** Pain page link if applicable
**Success metric:** Click-through to results page; secondary: email report send rate from results page

---

### [04] Upgrade Nudge (Free → Pro)

**Type:** Promotional lifecycle
**Trigger:** User viewed fit results (tracked by `funnel_results_view` event) + is on free tier + 72 hours have passed since results were viewed
**Audience:** Free-tier users who have completed at least one fit and viewed results
**Implementation:** Convex cron checks `fitSessions` completion time + user plan

**Subject line options:**
- `Your fit report — one step further with Pro`
- `PDF + multiple bikes: what Pro unlocks`
- `Keep your fit numbers with you — upgrade for €9/month`

**Body outline:**
1. Reference what they already have (free fit was valuable)
2. State specifically what Pro adds — no vague "more features" language
3. Price clearly stated: €9/month, cancel any time
4. No manufactured urgency — no fake countdown timers

**Suggested copy:**

```
You've got your fit targets. Here's what Pro adds on top:

✓ PDF export — save your report, share it with your fitter or bike shop
✓ Multiple bike profiles — fit your road bike and gravel bike separately
✓ Email report delivery — send your results directly to your inbox any time

€9 per month. Cancel any time from account settings.

[Upgrade to Pro]

---
Questions? Reply to this email — it reaches a real person.
```

**CTA:** `Upgrade to Pro` → `/pricing`
**Success metric:** Conversion rate (upgrade events); unsubscribe rate (if >2%, reduce frequency or revise copy)
**Constraint:** Only send if `PRODUCT_LIVE_FLAGS.premiumPlanPublic === false` — never mention Premium tier publicly.

---

### [05] Case Study Confirmation

**Type:** Transactional
**Trigger:** `caseStudyLeads.mutations.submit` called with `consentAccepted: true`
**Audience:** Users who submitted the post-fit case study opt-in form
**Implementation:** Convex scheduled action after successful mutation

**Subject line options:**
- `Thanks — we'll be in touch about your rider story`
- `Got it — here's what happens next`

**Body outline:**
1. Confirm receipt immediately
2. Set expectations: what the interview looks like (short email thread, 3–5 questions)
3. Reassure about data use: interview consent ≠ published marketing
4. Remind them they can withdraw at any time

**Suggested copy:**

```
Hi [first name],

Thanks for putting your hand up — we'll reach out within a few days with a short set of questions by email.

What to expect:
• 3–5 questions about your riding, the fit, and the position changes you made
• Entirely by email — no calls, no video
• Nothing published without a second, explicit consent from you

Your details are stored securely and used only for this case study process.
To withdraw at any time, reply to this email.

See you on the other side of the fit.

— The BestBikeFit4U team
```

**CTA:** None (purely confirmatory)
**Success metric:** Open rate (proxy for trust); interview response rate (tracked manually)
**GDPR note:** This email is the confirmation of research consent, not a marketing email. Do not add promotional content or upgrade prompts to this email.

---

### [06] Win-Back

**Type:** Re-engagement
**Trigger:** No `fitSessions` activity and no dashboard login for 21 days
**Audience:** Previously active users (completed at least one fit) who have gone quiet
**Implementation:** Convex cron, query users with last `fitSessions` record > 21 days ago

**Subject line options:**
- `Your fit targets from [month] — still worth checking`
- `Anything change since your last fit?`
- `New season, new position?`

**Body outline:**
1. Acknowledge the gap without guilt-tripping
2. Give a concrete, simple reason to return (season change, new bike, new goals)
3. Reference the existing fit data so they feel progress is preserved
4. One gentle CTA

**Suggested copy (seasonal variant — spring):**

```
Hi [first name],

Spring rides are starting. If you made any changes after your last fit, it's worth running a fresh session — a few kilograms gained or lost, or a new bike, can shift your optimal position by more than you'd expect.

Your previous targets are still in your dashboard.

[Log in and check my numbers]
```

**CTA:** `Log in and check my numbers` → `/login` with `src=winback_email`
**Success metric:** Re-activation rate (new `fitSessions` created within 7 days of email)
**Frequency cap:** Maximum one win-back email per 60 days per user. Do not send if user has unsubscribed.

---

### [07] Internal Lead Notification (Case Study)

**Type:** Internal operational
**Trigger:** `caseStudyLeads.mutations.submit` completes
**Audience:** `support@bestbikefit4u.eu`
**Implementation:** Already partially specced in `plans/sprint-claim-sync-analytics-seo/08-case-study-flow.md`. Implementation uses `AUTH_RESEND_KEY`.

**Subject:** `New case study lead: [first name] — [cycling experience]`

**Body:**
```
Name:                [first name]
Email:               [email]
Cycling experience:  [experience]
What they wanted:    [problem description or —]
Did the fit help:    [yes / partial / still testing]
Willing to interview: [Yes / No]
Source:              [session fit results page]
Submitted at:        [ISO timestamp]
```

**CTA:** None (internal notification only)
**Success metric:** Delivery rate; response latency (how quickly the team follows up)

---

## Copy Principles

1. **No injury claims in email copy.** Do not write "fix your pain" or "prevent injury." Use: "address the position factors behind your discomfort," "reduce the friction points in your ride," "find a position you can hold longer."

2. **Cyclist-specific language.** Use "saddle height" not "seat height." Use "reach" not "distance to handlebars." Use "inseam" not "leg length." Riders trust brands that speak their language.

3. **Numbers as proof.** The strongest trust signal in every email is a real measurement — not a vague benefit. Lead with the actual number (`Saddle height: 742mm`) rather than a generic statement.

4. **Plain text first.** Design emails to read well as plain text. HTML design is secondary. A fit recommendation that arrives as a clean text email beats a broken HTML template every time.

5. **One CTA per email.** Never have two equally prominent CTAs. Pick one and let the body text support it. Secondary links (pain pages, measurement guide) are in-text links, not buttons.

---

## Implementation Sequence

| Email | Implementation approach | Priority |
|---|---|---|
| [01] Magic link | Customize `@convex-dev/auth` template — 1 day | Week 1 |
| [07] Internal lead notification | Convex scheduled action post case-study submit — 0.5 day | Week 1 |
| [03] Results recap | Convex scheduled action post `recommendations.generate` — 1 day | Week 2 |
| [05] Case study confirmation | Convex scheduled action post `caseStudyLeads.submit` — 0.5 day | Week 2 |
| [02] Fit reminder | Convex cron, 48h after sign-up with no fit — 1 day | Week 3 |
| [04] Upgrade nudge | Convex cron, 72h post-results, free tier — 1 day | Week 3 |
| [06] Win-back | Convex cron, 21-day dormancy — 1 day | Week 4 |

---

## Measurement Plan

### Per-email metrics (track in Resend dashboard)

| Metric | Target | Alert threshold |
|---|---|---|
| Delivery rate | >98% | <95% = DNS/domain issue |
| Open rate (transactional) | >45% | <30% = subject line or sender trust issue |
| Open rate (promotional) | >25% | <15% = list quality or relevance issue |
| Click rate (transactional) | >30% | <15% = CTA copy or placement issue |
| Click rate (promotional) | >8% | <3% = offer not compelling |
| Unsubscribe rate | <0.5% | >1% = frequency or relevance issue |
| Bounce rate | <2% | >5% = email verification needed at sign-up |

### Funnel-level metrics (track in GA4 + Convex analytics)

| Metric | Definition | Measured by |
|---|---|---|
| Email → fit start rate | Users who clicked email CTA and started a fit session | `cta_click` event with `src=reminder_email` |
| Email → results view rate | Users who completed fit after email click | `funnel_results_view` correlated with email cohort |
| Email → upgrade rate | Free users who upgraded within 7 days of upgrade nudge email | Plan change event in Convex after email send cohort |
| Case study lead → interview rate | Leads contacted who respond to interview request | Manual tracking in support inbox |
| Win-back rate | Dormant users who create a new fit session within 7 days of win-back email | New `fitSessions` by cohort |

### A/B testing plan (when volume allows — target >200 recipients per variant)

| Email | Variable to test | Primary metric |
|---|---|---|
| [02] Fit reminder | Subject line: measurement-focused vs. outcome-focused | Open rate |
| [03] Results recap | Lead with saddle height number vs. lead with "Your fit is ready" | Click rate |
| [04] Upgrade nudge | PDF export as lead benefit vs. multiple bikes as lead benefit | Upgrade conversion rate |
| [06] Win-back | Seasonal angle vs. neutral "check your numbers" | Re-activation rate |

### Email health baseline

Establish before any promotional sends:
1. Verify `notifications.bestbikefit4u.eu` subdomain has SPF, DKIM, and DMARC records configured in DNS (Resend provides the required records)
2. Warm the sending domain with transactional emails (auth + report delivery) for at least 2 weeks before sending promotional campaigns
3. Target: Resend sender reputation score stays in the "Good" band throughout the sprint
