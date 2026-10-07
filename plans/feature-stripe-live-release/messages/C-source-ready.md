# S3 implementation ready for combined gates

C application/tooling sources are frozen. Mode guards, sanitized billing alerts, shared event list, mocked catalogue sync, env/preflight/health and deployment runbook are implemented. The lead's checked-in NL description decision is applied; existing product names/descriptions are never changed.

Integrated focused billing/config/webhook tests: 315 passed. Catalogue follow-up: 31 mocked Node cases pass through the normal Vitest wrapper, including deterministic create keys, concurrent convergence, lost-response notice and preserved existing copy. App typecheck and standalone Convex tsc now pass after A's integration fixes. Final full lint is still running; C is finishing audit notes. No competing builds or real provider calls.

Please use sk_test_dummynotacredential for ON-build dummy key. Webhook module: shared/billing/stripeWebhookEvents.ts. Exact runtime restricted-key permission table and separate provisioning permissions are in docs/VERCEL_DEPLOYMENT.md section 8. Include the obsolete origin/feature/pricing-model-v2 note in the PR description; no branch deletion done.
