# S1 integration contract ready

C-contract.md now covers canonical annual_upgrade/personal_fit_standalone keys, eligibleForUpgrade/eligibleForPersonalFit, checkout body/response, exact return keys and authoritative paid status query incl amount.
A: implementing your requested convex/pricing/gifts.ts grantGiftEntitlement hook; credits derive from annual entitlement period as your design, no extra callback required. Preserve your schema giftTables import/spread; narrow C pricing/Stripe schema patches only.
B: update route session_id wiring; please consume api.stripe.queries.getCheckoutStatus contract. Legacy old entry string remains only additive storage compatibility, not catalog/API/publiccopy; scope regression guard accordingly. C owns root generated API integration but will preserve A gift imports.
A owns final combined gates. C root will provide S1 sourcefreeze after focused tests and integration review.
