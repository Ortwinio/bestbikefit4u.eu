# Step 04 — UX Flow Review

## Objective

Walk through the complete user journey and document UX friction points, gaps, and quick wins. Focus on flow, clarity, and responsiveness — not aesthetic polish.

## Flows to Review

### 1. Landing Page (Public)
- Is the value proposition immediately clear (above the fold)?
- Is the primary CTA obvious and well-placed?
- Does the page work on 375px mobile without horizontal scroll?
- Does the language switch in the header work and is it discoverable?

### 2. Authentication Flow
- Sign-in: is the magic-code flow explained clearly?
- Error states: what happens if the code is wrong or expired?
- Is the flow localized in NL?

### 3. Questionnaire / Bike Fit Flow
- Is progress clearly indicated (ProgressBar)?
- Are questions easy to understand (no jargon without explanation)?
- Back navigation: does it work and preserve previous answers?
- Error states: what happens if a required answer is missing?
- Mobile: are form inputs easy to tap and fill on small screens?
- Are tooltips accessible (keyboard-triggerable, readable on mobile)?

### 4. Bike Setup / Dashboard
- Is the dashboard purpose immediately clear for a new user (empty state)?
- Dashboard home: what does a user see on first login (no bikes, no sessions)?
- Bike creation: is the flow intuitive?
- Is the loading state shown while Convex data loads?

### 5. Tire Pressure Module
- Is the entry point to tire pressure discoverable?
- Input UX: are the input fields and units labeled clearly?
- Result display: is the output easy to understand?
- Error/edge cases: what if the user enters out-of-range values?

### 6. Results Page
- Is the recommendation readable and actionable?
- Is PDF export visible and well-labeled?
- Mobile: is the results layout readable on small screens?

## Review Format

For each flow, note:
- **Works well**: things that are clear and effective
- **Friction**: steps that are confusing or require extra effort
- **Gaps**: missing states (empty, loading, error) or missing affordances
- **Priority**: P0 (blocks task completion), P1 (significant friction), P2 (polish)

## Output

Document in `output-04-ux-flow-review.md`:
- Per-flow findings in the format above
- Top 5 highest-priority UX improvements with rationale
