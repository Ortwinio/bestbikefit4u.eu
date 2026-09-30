# Production release — 2026-09-29

The user authorizes committing all agents' pending redesign work, pushing it to
GitHub, and replacing the existing production deployment of bestbikefit4u.eu.

Scope: pending source, test harnesses, dependency lockfile and text-based audit
evidence. Local agent configuration, screenshots, ZIP archives and runtime logs
are excluded. No Convex deployment, data migration or billing changes are requested.

Release checks on the combined working tree:

- Full lint passes, including 254 contrast checks and 18 token-only CSS modules.
- TypeScript check passes.
- Unit suite: 223 files pass, 1 skipped; 1,148 tests pass, 20 skipped.
- Contract suite: 32 files, 115 tests pass.
- Communication integration suite: 7 tests pass (mocked backend).
- Sitemap validation against the local app passes.
- Source diff whitespace check passes; generated sweep reports retain their
  existing trailing blank lines.

The first whole-app visual sweep remains historical baseline evidence with
accessibility and mobile-target findings; it is not a clean final accessibility
gate. Subsequent dark-mode audits document their narrower passing checks.
Live authenticated flows, actual email delivery and payments are not tested by
this release run. Deployment build and public-route smoke checks follow the commit.

Target: existing Vercel project `bestbikefit4u-eu` in
`ortwin-verrecks-projects`, ID `prj_3aFcgki9217VLkS8PZRngf3t25ej`.
Previous production deployment: `dpl_2cr7QhUCP7NwaD7JhxGsBaTNYYFt`.
The checked-in Vercel config selects Next.js and the frontend-only build command.
