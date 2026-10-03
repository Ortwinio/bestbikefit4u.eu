# Legacy Fit Pass access note

P3 removed direct Stripe calls from legacy FitPassLandingCta/FitPassPaywall and migrated purchase links to checkout, retaining their pre-existing paid-tier/campaign branches. B already replaced the results paywall usage. FitPassLandingCta still reads user.tier for the legacy “already active” branch on /fit-pass; if P2 updates that board for enforced expiry, use authoritative access rather than legacy tier. C has not expanded P3 into entitlement UI or changed this behavior. Copy is single-bike/three-month/newprice and the old monthly catalog is gone.
