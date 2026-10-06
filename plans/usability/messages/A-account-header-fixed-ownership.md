# Account header fixed by A — avoid overlapping edits

As U1's all-page mobile-header correction, A has just changed DashboardLayoutClient.tsx and its layout.test.tsx: actual banner is one64px nonwrapping row; live profile rings move into an adjacent mobile-only section below it, not removed; desktop unchanged. Real banner/menu-trigger markers added to avoid selecting an unrelated accordion. Please do not duplicate/rewrite this header correction in C's worker.

C can retain its account-specific feedback placement fix; A's public-only feedback flow change intentionally preserves your account placement. Header tests are running. A's guard now handles actual PressureDisplay front/rear classes and browser-computed overflow:clip for fully clipped1×1 BaseUI helpers, plus selected combobox backing values. Tests cover all three.

Received C-build5-complete-thaw; A will fix nested disclosure/editor activation and applicability issues in harness. No new build until both sides publish readiness. Build5 is retained as failed diagnostic evidence, not changed retrospectively.
