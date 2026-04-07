# Commercial UX Contract

Output of plan step 01. All page-level work in this plan must follow these rules.

## Current Funnel Friction Points

1. **Hero primary CTA goes to `/login`** — first-time visitors hit an account wall before seeing any value.
2. **Calculators buried below the fold** — four content sections (How It Works, Reasons, Features, Trust) push the calculator grid far down the page.
3. **Login page is sign-in-only framing** — title says "Sign in to BestBikeFit4U"; first-time visitors see no onboarding or create-account messaging.
4. **Pricing lacks outcome framing** — plan cards list features, not rider outcomes; no proof module or confidence mechanism near the buying decision.
5. **Calculator result pages end without a clear next step** — free tool output does not bridge into account creation or Pro upgrade.
6. **FAQ and contact are support-only** — no conversion or trust reinforcement on these pages.

## CTA Hierarchy (all public pages)

| Level | Purpose | Example label | Destination |
|-------|---------|---------------|-------------|
| **Primary** | Start with value | "Try the Free Bike Fit Calculator" | `/calculators/bike-fit` |
| **Secondary** | Understand plans / proof | "Compare Free vs Pro" | `/pricing` |
| **Tertiary** | Sign in (returning users) | "Already have an account? Sign in" | `/login` |

Every high-intent public page should present at least a primary and a tertiary action. Secondary is required on homepage, calculator result pages, and FAQ.

## Required Proof Modules

Use these on high-intent pages (homepage, pricing, login, calculator results):

| Module | When to use | Source constraint |
|--------|-------------|-------------------|
| **Trust strip** | Near the hero or above the fold | Methodology, practical outputs, transparent limitations — must be grounded in real product capabilities |
| **Outcome framing** | Near plan comparison or CTA | Describe Free vs Pro in rider-outcome terms, not just feature lists |
| **Support reassurance** | Near pricing CTA and login | Position support as premium and available, without overstating capacity |
| **Sample output** | Calculator result pages | Show what a personalized fit report includes, referencing real report fields |

## Disclaimer Rule

Keep every honest caveat. Pair each with a practical "what this is useful for" statement.

**Pattern:** `"[Limitation]. [Practical value despite limitation]."`

Example: "Complex pain or injury cases may need an in-person fitter. This tool gives you a solid starting point so you arrive at the fitter with better context."

## Page-Level Conversion Requirements

### Homepage
- Hero primary CTA opens `/calculators/bike-fit`
- Trust strip visible above the fold or immediately below the hero
- Calculator grid and/or quick-check card appear before education sections (How It Works, Reasons, Features)
- Returning-user sign-in path remains visible but deprioritized (tertiary)
- Final CTA band points to calculator, not login

### Login / Auth Start Page
- Reframe as "Create your account / Sign in" — serve both new and returning users
- Add passwordless explanation and support reassurance
- Add proof of value (what you get after signing up)
- Keep sourceTag and analytics events intact

### Pricing
- Add use-case framing: Free = try the tools, Pro = ongoing fit tracking and multiple bikes
- Add a proof module near the comparison table (e.g., sample output, methodology trust)
- Add one confidence mechanism grounded in live product reality (e.g., "cancel anytime" if true, session count, etc.)
- CTA language should reference outcomes, not just "start"

### Calculators (all five)
- Result page includes a clear next-step section with:
  - Primary: create account / sign in to save and refine
  - Secondary: view pricing
- Disclaimer paired with practical value statement
- Consistent CTA hierarchy across all calculator result pages

### FAQ
- Add a next-step CTA after the last FAQ item
- Add brief trust/proof paragraph
- Position as a trust page, not just a support page

### Contact
- Add brief conversion reassurance ("real people, real support")
- Add a next-step CTA for visitors who came to evaluate

## Component Reuse Direction

### Extend, don't duplicate

| Existing component | Use for |
|-------------------|---------|
| `PublicCtaBand` | All page-bottom CTA bands |
| `PublicHero` | Calculator and content page heroes |
| `PublicFeatureCard` | Trust and feature modules |
| `TrackedCtaLink` | All CTA links (preserves analytics) |
| `BikeQuickCheckCard` | Homepage quick-check module |

### New patterns needed

| Pattern | Purpose |
|---------|---------|
| **TrustStrip** | Compact 3-column trust indicators near the hero (methodology, outputs, limitations) |
| **NextStepBridge** | Consistent post-result CTA module for calculator pages |

Build these as extensions of existing primitives, not as a parallel design system.

## CTA Tracking Rules

- When CTA destinations change, update the `section` prop on `TrackedCtaLink` to reflect the new semantic location
- When CTA labels change, update the `ctaLabel` prop
- Do not remove existing analytics events; add new ones where new CTAs are introduced
- Keep `conversionKey` on pricing and signup CTAs

## Visual System Rules (defer to step 07 for full token work)

- Use native Tailwind tokens: `text-foreground`, `bg-card`, `border-border`, `text-primary`, `bg-secondary`
- Do not introduce new arbitrary color-mix values in TSX
- CTA hierarchy: primary button for primary action, outline button for secondary, text link for tertiary
- Consistent rounded corners: `rounded-2xl` for cards, `rounded-3xl` for feature cards, `rounded-[2rem]` for section frames
