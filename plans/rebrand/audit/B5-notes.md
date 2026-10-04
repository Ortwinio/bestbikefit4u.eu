# B5 — regression guard

`scripts/check-rebrand-copy.mjs` parses TypeScript/TSX string literals, template fragments and JSX text,
and checks CMS import JSON. It covers frontend copy/i18n/metadata, backend email/auth copy and shared
strings. It is part of `npm run lint` as `lint:brand`; its Vitest tests reject retired names even when
they occur next to an allowed email address or URL. Source guard: zero findings after the rebrand.

Exact exceptions: legacy `bestbikefit4u.eu` hosts and email domains; existing named media URL paths;
the retained `bestbikefit4u_guides_cms_backlog_v1_` source-data filename prefix. Comments, generated
Convex declarations and regression test files are not rendered copy and are excluded. No blanket
file-level exemption hides application copy. Runtime CMS normalization has separate tests preserving
embedded URLs/email addresses, IDs and slugs while replacing only the displayed product name.

The full browser sweep adds a `brand` check to visible body copy. All 320 NL/EN desktop/mobile cases
pass it. Head/manifest/OG identity is separately checked by RB-http-check; email and PDF copy are checked
by their dedicated render workflows. This does not constitute a production CMS database scan.

## Retained identifiers

No persisted names were migrated: `bf_locale`, `bf_cookie_consent`, `bbf.handoff`,
`dashboard-message-modal-suppressed-v1`, `feedback-activity-trail`, the `theme` preference,
`bbf_*` analytics events, Convex table/document/provider identifiers and subscription identifiers.
CSS token names and existing media/backlog filenames remain stable. New PDF downloads alone use
`bikefitboost-report-…`. The historical root PDF is unreferenced and retained as an archive, not served.
