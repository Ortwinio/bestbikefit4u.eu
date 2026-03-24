# Step 02 — Global Trigger And Panel Shell

## Goal

Create the new app-wide feedback entry system using Prototyper UI sheet behavior.

## Tasks

1. Introduce a global feedback provider mounted high enough to serve:
   - public pages
   - auth pages
   - dashboard pages
   - calculator flows
   - exclude admin routes
2. Replace the old floating-button wiring with a single shared trigger component.
3. Build the panel shell with:
   - `Dialog`
   - `DialogContent side="right"`
   - tokenized header/body/footer
   - consistent close behavior
   - responsive widths
   - the approved welcome copy in the panel introduction:
     - `Together we create the BestBikeFit experience. We ride longer, hurt less often, and perform better. Your feedback is food for champions.`
   - copy layout that leaves room for:
     - a short mission-led intro
     - a practical explanation of what feedback types are supported
     - calm, non-corporate microcopy
4. Support opening the panel from:
   - floating trigger
   - contextual inline entry points
   - optional `/feedback` CTA reuse
5. Implement smart page-aware defaults when the opening context is clear:
   - fit results and recommendation pages
   - billing or upgrade flows
   - profile or setup flows
   - feature/roadmap-oriented pages
6. Ensure the user can still change the selected type before submission.
5. Preserve focus handling, escape-to-close, and mobile-safe placement.

## Constraints

- Use Prototyper UI only.
- No bespoke drawer implementation.
- No hard-coded page-specific styling branches unless unavoidable.
- The new panel replaces the old creation dialog.
- Rider-facing tone should feel warm, premium, and direct rather than operational.

## Non-goals

- Do not redesign `/feedback` page content in this step.
- Do not change backend submission semantics in this step.
- Do not add attachments or screenshot upload.

## Deliverable

- global trigger component
- global provider/state model
- right-side panel shell
- migration plan for old dialog callers
- approved opening copy implemented in the shell contract
- page-aware opening/default contract

## Done When

- The feedback trigger is available from every non-admin page.
- Every entry point opens the same right-side panel.
- The old modal-first creation path is no longer the canonical UX.
- Known entry contexts can prefill the most likely feedback type without locking the user into it.
