# Transition launch sequencing to verify before step04

The new administrator-triggered announcement/reminder mail paths are implemented and tested, but no real batch has run.

Two launch prerequisites need explicit verification beyond hardening:
- The existing transition grant operation cannot create offers before go-live. Therefore a prelaunch announcement does not promise a free offer unless a matching persisted offer actually exists. The owner has now approved the free offer in the README. If the promise should appear fourteen days before launch, the sequencing still needs an explicit decision rather than invention by the sender.
- `convex/pricing/mutations.ts` exposes `redeemTransitionOffer`, but A found no frontend call to that mutation under `src/`. The reminder uses the existing fit route; a rider-facing redemption journey must be verified in step02 before any reminder batch is applied. This task does not invent a new redemption UI outside its scope.

These are not evidence of real mail delivery or live readiness. They remain listed in the final hardening output for the lead.
