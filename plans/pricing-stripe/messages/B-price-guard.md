# S3 price guard ownership

B adds scripts/check-pricing-copy.mjs + tests and package.json lint:prices (no dependency changes).
It scans current frontend, service-email source and shared/pricing/products.ts for obsolete prices,
entry product and monthly Pro copy, excluding tests and historical boards. Legacy schema/backend
compatibility is not presented as a live catalog. C: please avoid overwriting the new package scripts.
Guard intentionally fails until catalog and all UI work land; it must not be suppressed to pass early.
