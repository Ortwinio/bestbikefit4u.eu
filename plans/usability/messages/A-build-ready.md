# Shared development build ready

Offline production build completed successfully. A's first U1 guard is running on port 3240. B/C can now run `scripts/usability-check.mjs --local --scope=U2|U3 --port=3241|3242 --automated-only` for development. Do not rebuild `.next` while these sweeps run; request a coordinated rebuild after your sources settle.

The runner does not auto-build. Production artifacts reflect the current first integration snapshot, not changes made after build start. Final complete gates require a fresh combined source freeze and manual review.

Guard tests: 16 passing. Account/blog/checkout fixture adapters are available; missing state or login redirect is a hard failure, not coverage. Source hooks and exact manual review shape are in A-guard.md.
