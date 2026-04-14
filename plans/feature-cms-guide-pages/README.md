# Plan: Lightweight CMS Extension for Guide Pages

**Version**: 2.0  
**Date**: 2026-04-11  
**Status**: Updated — batch import, standard page template, and conversion strategy added  

---

## Executive Summary

BestBikeFit4U.eu currently maintains 52+ guide pages as hardcoded TypeScript files in `src/lib/guides/`. This is not sustainable. A content editor cannot update a guide without touching source code, triggering a build, and deploying. That is a developer bottleneck, not a content workflow.

This plan defines a lightweight, database-backed CMS extension that allows non-technical editors to create, edit, preview, and publish guide pages from a web-based admin panel — with full SEO field control and bilingual (EN/NL) support — without changing any application code.

The CMS is not a separate product. It is an extension of the existing admin panel, backed by the existing Convex database. No new infrastructure is required.

**v2 additions (this revision):**
1. **Batch JSON import** — 62 production-ready guide JSON files in `docs/cms-import/` (31 EN + 31 NL) can be imported in one operation into the Convex database, seeding all guides with full bilingual content and SEO metadata.
2. **Standard guide page template** — a redesigned, opinionated page template using existing component primitives with structured conversion zones: hero, quick answer cards, Markdown body, mid-page tool CTA, FAQ, related guides, and a closing CTA band.
3. **Visitor-to-account conversion strategy** — a funnel-aware CTA and content strategy that uses guide pages as acquisition assets, guiding readers from problem-awareness toward account creation through contextual, non-intrusive conversion touchpoints.

## Implementation Gap Checklist

Status checked against the live repo on 2026-04-14.

| Capability | Plan status | Repo status |
|---|---|---|
| Guide create/edit/publish workflow | Must have | Implemented |
| Redirect manager and slug redirects | Must have | Implemented |
| Audit log | Must have | Implemented |
| Admin JSON import inside CMS | Must have in practice | Implemented on `2026-04-14` via `/admin/guides/import` |
| Author assignment in create/edit UI | Must have | Implemented on `2026-04-14` |
| Quick-answer editing in create/edit UI | Planned content model | Implemented on `2026-04-14` |
| Revision restore | Must have | Implemented on `2026-04-14` |
| Soft delete | Must have | Implemented on `2026-04-14` |
| Guide list author/locale/search filters | Should have | Implemented on `2026-04-14` |
| Guide list preview/delete/import actions | Planned | Implemented on `2026-04-14` |
| `/admin/guides/new` create-flow validation hardening | Required by QA | Implemented on `2026-04-14` |

Validation notes:
- Focused TypeScript checks for the guides CMS files pass after the 2026-04-14 implementation sweep.
- Focused tests now cover guide delete/restore mutations and guide-create form submission.
- Full repo `tsc --noEmit` still has unrelated non-guides issues outside this plan area.

---

## Product Goal and Scope

### Problem this solves

| Problem | Impact |
|---|---|
| Guide content is hardcoded in TypeScript | Every content edit requires a developer and a deployment |
| Non-technical editors cannot manage content | Content operations are blocked on engineering capacity |
| No preview workflow | Editors cannot review content before it goes live |
| No SEO field control for editors | SEO titles, meta descriptions, OG fields must be changed in code |
| No audit trail | No visibility into who changed what and when |
| Slug changes break URLs without redirects | SEO equity is lost when guides are restructured |

### Who uses this

| Role | What they do |
|---|---|
| Content editor | Creates drafts, writes content, fills SEO fields, previews, submits for review |
| Admin | Reviews drafts, publishes, unpublishes, manages redirects, manages users |
| Developer | Maintains schema, templates, and rendering logic — not content |

### In scope for v1

- Guide page CRUD (create, edit, save as draft, publish, unpublish)
- Full bilingual content editing (EN + NL per field where applicable)
- All core SEO fields per guide page
- Draft → review → published status workflow
- Preview mode (renders live Next.js page with draft data)
- Slug management with redirect creation on slug change
- FAQ block management (add, edit, reorder, delete FAQ items)
- Table of contents toggle
- Internal linking suggestions (related guides)
- Image alt text management
- Basic SEO validation (warnings for missing required fields)
- Audit log (who changed what and when)
- Role-based access (editor, admin)
- Admin panel integration (extends existing `convex/admin/` pattern)

### Out of scope for v1

- Rich text / WYSIWYG editor (plain textarea + Markdown; WYSIWYG in v2)
- Multi-language auto-translation
- AI-assisted content suggestions
- Custom content blocks beyond guide pages (blog posts, case studies)
- External media library / CDN asset manager
- Workflow approval chains (more than editor → admin)
- Content scheduling (publish at future date)
- A/B testing of guide variants
- Webhook or API integrations with external SEO tools
- Analytics-inside-CMS dashboards

---

## Functional Requirements

### Core CMS features

| Feature | Description | Priority |
|---|---|---|
| Guide list view | Paginated list of all guides with status, locale, last updated, author | Must have |
| Create guide | New guide form with all fields | Must have |
| Edit guide | Full form edit of any existing guide | Must have |
| Save as draft | Save without publishing | Must have |
| Preview | Renders the live page template with draft data in a new tab | Must have |
| Publish | Makes content live, updates `publishedAt` timestamp | Must have |
| Unpublish | Reverts to draft, keeps content, removes from public listing | Must have |
| Delete | Soft delete with confirmation, admin only | Must have |
| Slug management | Editable slug with slug-format validation and uniqueness check | Must have |
| Redirect on slug change | Auto-creates a redirect record when slug is changed for a published guide | Must have |
| Redirect manager | Admin view to list, add, edit, delete redirects | Must have |
| Status badge | Visual indicator: draft, in review, published, unpublished | Must have |
| Bilingual fields | EN and NL tabs for all content fields | Must have |
| FAQ block | Add, edit, reorder, remove FAQ Q+A pairs | Must have |
| Table of contents | Toggle to enable/disable ToC on the page | Must have |
| Related guides | Multi-select picker for internal linking | Must have |
| Author field | Assignable author from user list | Must have |
| Category / cluster | Assign to one of the existing guide clusters | Must have |
| Tags | Free-form tag input with autocomplete | Should have |
| Featured image | URL field + alt text | Should have |
| Last updated display | Auto-set on publish, manually overridable | Must have |
| Search/filter | Filter by status, cluster, locale, author | Should have |
| Audit log | Per-record history: who changed what fields and when | Must have |
| SEO field validation | Inline warnings for missing title, meta description, H1 | Must have |

---

## SEO Requirements

The CMS must treat SEO fields as first-class citizens. Each guide page must support:

| SEO Capability | Field(s) | Notes |
|---|---|---|
| Page title | `metaTitle` (EN + NL) | Shown in `<title>` tag |
| Meta description | `metaDescription` (EN + NL) | 50–160 character range with character counter |
| H1 | `h1` (EN + NL) | Must differ from metaTitle; required |
| SEO-friendly slug | `slug` | URL-safe, lowercase, hyphens only, uniqueness enforced |
| Canonical URL | `canonicalUrl` | Override field; defaults to computed canonical |
| Open Graph title | `ogTitle` (EN + NL) | Falls back to `metaTitle` if empty |
| Open Graph description | `ogDescription` (EN + NL) | Falls back to `metaDescription` if empty |
| Open Graph image | `ogImageUrl` + `ogImageAlt` | Recommended 1200×630px |
| Index control | `robotsIndex` (boolean) | Generates `<meta name="robots" content="noindex">` when false |
| Structured data — Article | Auto-generated from title, author, dates | Schema.org Article |
| Structured data — FAQ | Auto-generated from FAQ block | Schema.org FAQPage |
| Structured data — Breadcrumb | Auto-generated from path + cluster | Schema.org BreadcrumbList |
| XML sitemap | Auto-included when published | `lastmod` = `publishedAt` |
| Robots meta | Controlled by `robotsIndex` toggle | |
| Image alt text | `featuredImageAlt` | Required when image is set |
| Internal linking | Related guides field surfaces links in page template | |
| Heading structure | H1 managed in CMS; H2+ in body content | |
| SEO warnings | Missing H1, missing meta description, duplicate slug | Inline, non-blocking |

### SEO validation rules (inline, non-blocking)

- `metaTitle` missing → warning
- `metaDescription` missing → warning
- `metaDescription` > 160 chars → warning
- `h1` missing → warning (blocks publish)
- `slug` conflicts with existing slug → error (blocks save)
- `featuredImage` set but `featuredImageAlt` empty → warning
- No FAQs set → info nudge (FAQ schema won't be generated)

---

## Content Model

### Guide page content model

| Field | Type | Required | Bilingual | Notes |
|---|---|---|---|---|
| `_id` | Convex ID | Auto | No | Primary key |
| `slug` | string | Yes | No | URL-safe, unique, e.g. `saddle-height-setup` |
| `path` | string | Computed | No | Derived: `/guides/{cluster}/{slug}` |
| `cluster` | string | Yes | No | One of: pain-discomfort, ride-types, geometry, setup, performance, maintenance, equipment, training, nutrition |
| `status` | enum | Yes | No | `draft` | `in_review` | `published` | `unpublished` |
| `pageTitle` | string | Yes | Yes | Internal title shown in CMS list |
| `h1` | string | Yes | Yes | Page heading |
| `metaTitle` | string | Yes | Yes | `<title>` tag |
| `metaDescription` | string | Yes | Yes | Meta description |
| `pageBrief` | string | Yes | Yes | Short intro / summary (used in listing cards) |
| `body` | GuideSection[] | Yes | Yes | Array of content sections (title, type, items) |
| `faqs` | GuideFaq[] | No | Yes | Array of FAQ Q+A pairs |
| `quickAnswer` | GuideQuickAnswer | No | Yes | keyTakeaway, commonMistake, payAttention |
| `featuredImageUrl` | string | No | No | Absolute URL |
| `featuredImageAlt` | string | No | Yes | Alt text |
| `canonicalUrl` | string | No | No | Override; computed if empty |
| `ogTitle` | string | No | Yes | Fallback to `metaTitle` |
| `ogDescription` | string | No | Yes | Fallback to `metaDescription` |
| `ogImageUrl` | string | No | No | OG image URL |
| `ogImageAlt` | string | No | Yes | OG image alt |
| `robotsIndex` | boolean | Yes | No | Default: `true` |
| `author` | string (userId) | No | No | Reference to user |
| `tags` | string[] | No | No | Free-form tags |
| `relatedGuides` | string[] | No | No | Array of guide slugs |
| `primaryCtaTarget` | string | No | No | Route or external URL for CTA |
| `primaryCtaLabel` | string | No | Yes | CTA button label |
| `tableOfContents` | boolean | Yes | No | Default: `false` |
| `publishedAt` | number (timestamp) | No | No | Set on first publish |
| `lastUpdatedAt` | number (timestamp) | No | No | Set on each publish; manual override |
| `createdAt` | number (timestamp) | Auto | No | |
| `updatedAt` | number (timestamp) | Auto | No | |
| `createdBy` | string (userId) | Auto | No | |
| `updatedBy` | string (userId) | Auto | No | |
| `version` | number | Auto | No | Incremented on each save |

### Section model (body content)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | Section heading (H2) |
| `type` | enum | Yes | `prose` | `steps` | `cards` | `table` |
| `items` | string[] | Yes | Content lines, prose paragraphs, or step descriptions |
| `tableHeaders` | string[] | No | Only for `type: table` |
| `tableRows` | string[][] | No | Only for `type: table` |

### Redirect model

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | Convex ID | Auto | |
| `from` | string | Yes | Old path, e.g. `/guides/saddle/old-slug` |
| `to` | string | Yes | New path |
| `statusCode` | number | Yes | `301` (permanent) or `302` (temporary) |
| `createdAt` | timestamp | Auto | |
| `createdBy` | string (userId) | Auto | |
| `reason` | string | No | Notes on why redirect was created |

### Versioning

- Every save increments `version` field
- A `guideRevisions` table stores snapshots: `{ guideId, version, snapshot, savedBy, savedAt }`
- Revisions are kept for 90 days then pruned
- Editors can view revision history; admins can restore a previous version
- No branching or complex merge — single linear history per guide

---

## UX / Editor Workflow

### Guide creation flow

```
1. Click "New Guide" in admin panel
2. Enter internal title and cluster → slug auto-generated from title (editable)
3. Choose content locale (EN | NL | Both)
4. Fill content fields in tabbed form (Content tab → SEO tab → Settings tab)
5. Save as draft (always available)
6. Preview opens live page in new tab with ?preview=true&draftId={id}
7. Submit for review (changes status to "in_review")
8. Admin reviews → Publish or Request changes
9. Published → live on site immediately
```

### Draft → review → publish flow

```
[Draft] → editor fills content → [In Review] → admin approves → [Published]
                                              → admin requests changes → [Draft]
[Published] → editor edits → auto-saves as draft version → re-publish updates live page
[Published] → admin clicks Unpublish → [Unpublished] (hidden from public, content kept)
```

### SEO checklist (inline in CMS form)

Shown in the SEO tab as a live checklist. Each item has a pass/warn/fail badge:

- H1 filled
- Meta title filled and under 60 chars
- Meta description filled and 50–160 chars
- Slug set and unique
- At least one FAQ (for FAQ schema generation)
- Featured image has alt text (if image is set)
- robotsIndex is true (warning if false on a guide that should be indexed)
- Canonical URL valid format (if overridden)

### Preview experience

- "Preview" button opens `/api/preview?secret={token}&slug={slug}` in new tab
- Next.js draft mode (`draftMode()`) renders the guide page using Convex draft data
- No deployment required
- Preview token is user-session-scoped and expires after 1 hour

### Validation logic

| Rule | When triggered | Severity | Blocks save? |
|---|---|---|---|
| `h1` missing | On publish attempt | Error | Yes |
| `slug` conflicts | On save | Error | Yes |
| `slug` format invalid | On input | Error | Yes |
| `metaDescription` > 160 chars | On input | Warning | No |
| `featuredImageAlt` missing | On save | Warning | No |
| `metaTitle` missing | On publish attempt | Warning | No (nudge only) |

### Interface principles for non-technical users

- Three-tab layout per guide: **Content** | **SEO** | **Settings**
- Bilingual fields use EN/NL tab switcher within each tab (not page reload)
- No JSON editor, no code, no Markdown syntax knowledge required
- Slug field shows the full URL preview: `bestbikefit4u.eu/guides/{cluster}/{slug}`
- Character counters on metaTitle and metaDescription
- Section body uses a simple textarea per section item (not a rich text editor in v1)
- "Add section" and "Add FAQ" use append-to-list UI with drag-to-reorder
- All destructive actions (delete, unpublish) require a confirmation dialog

---

## Admin and Governance

### Roles and permissions

| Capability | Editor | Admin |
|---|---|---|
| View all guides | Yes | Yes |
| Create / edit guides | Yes | Yes |
| Save as draft | Yes | Yes |
| Preview | Yes | Yes |
| Submit for review | Yes | Yes |
| Publish / unpublish | No | Yes |
| Delete (soft) | No | Yes |
| Manage redirects | No | Yes |
| Restore revisions | No | Yes |
| View audit log | Own records | All records |
| Manage users / roles | No | Yes |

Roles map to the existing admin RBAC pattern in `convex/admin/authz.ts`.

### Audit log

- Every state-changing operation (create, update, status change, delete, redirect creation) writes an audit record
- Record: `{ action, resourceType, resourceId, fieldChanges, userId, timestamp }`
- `fieldChanges` stores `{ field, oldValue, newValue }` for each changed field
- Audit log is readable by admins in the admin panel
- Audit log is never deleted (compliance requirement)

### Publishing controls

- Only admins can publish or unpublish
- Publishing sets `publishedAt` (if first publish) and `lastUpdatedAt`
- Unpublishing does not delete content; the public route returns 404 for unpublished slugs
- A guide cannot be published if `h1` is missing (hard block)

### Redirect approval

- When an admin changes a published guide's slug, the system shows a confirmation:
  *"This guide is published. Changing the slug will create a 301 redirect from the old URL. Confirm?"*
- On confirm: redirect record is created, old slug is freed, new slug is set
- Editors cannot change slugs of published guides (admin only)

### Content quality guardrails

- SEO checklist is always visible in the SEO tab
- Publish is blocked if `h1` is missing
- Character counters enforce soft limits on title and meta fields
- Duplicate slug detection is real-time (debounced Convex query)

---

## Technical Architecture Recommendation

### Current state

Guide content lives in TypeScript files:
- `src/lib/guides/backlog.ts` — guide metadata, SEO fields, slugs
- `src/lib/guides/guide-content.ts` — section and FAQ content
- `src/lib/guides/quick-answers.ts` — quick answer blocks

These files are read at build time (or request time via server components). There is no database-backed content store and no admin editing UI for guides.

### Architecture options

#### Option A — Convex-backed admin panel (recommended)

Store guide content in Convex tables. Build a CMS admin panel inside the existing Next.js app, extending the existing `convex/admin/` pattern.

**How it works:**

```
Editor → Admin Panel (Next.js /admin/guides route)
       → Convex mutations (create, update, status change)
       → Convex guidePages table

Public site → Next.js server component
           → Convex query (getPublishedGuide)
           → renders guide page template (unchanged)

Preview → Next.js draft mode API route (/api/preview)
        → Convex query with draft flag
        → renders guide page template with draft data
```

**Advantages:**
- No new infrastructure or services
- Consistent with existing Convex RBAC, auth, and audit patterns
- Type-safe end-to-end via Convex codegen
- Zero additional cost
- Preview works via Next.js draft mode without a separate preview service
- Migration path: existing TypeScript content can be seeded into Convex

**Disadvantages:**
- No out-of-the-box rich text editor (mitigated: use Markdown in v1, add editor in v2)
- Admin panel UI must be built (mitigated: extends existing admin panel pattern)

#### Option B — Headless CMS (Sanity.io or Payload CMS)

Use an external or self-hosted headless CMS. Store content there. Fetch at build time or request time via CMS API.

**Advantages:**
- Rich editing experience out of the box (WYSIWYG, image uploads, real-time preview)
- No need to build admin UI

**Disadvantages:**
- Adds a new infrastructure dependency (Sanity CDN or self-hosted Payload)
- Adds monthly cost (Sanity free tier has limits)
- Breaks the Convex-first architecture principle
- Auth and RBAC must be managed in two systems
- Content APIs require a data fetching layer that bypasses Convex
- More complex deployment and maintenance surface

### Recommendation: Option A

Option A fits the existing stack exactly. The project is already Convex-first with a custom admin panel. Extending it with a `guidePages` table and a `/admin/guides` section is a natural, zero-infrastructure extension. The only capability gap is a rich text editor — which is not needed in v1 (structured sections + simple textareas is sufficient) and can be added in v2 using a library like TipTap without architectural changes.

### API and delivery

- All mutations go through Convex typed RPCs (no REST)
- Public pages use `ctx.db.query("guidePages").withIndex("by_slug", ...)` — same pattern as other public data
- SEO fields are returned from the same query and consumed by `generateMetadata()` in the Next.js route
- Structured data (JSON-LD) is generated at render time from the CMS content fields
- XML sitemap generation queries all published guides from Convex
- Redirects table is read by the Next.js middleware (`src/proxy.ts`) for `next/server` redirects

### Migration path

The existing TypeScript guide content must be seeded into Convex on first deploy. A one-time migration script reads `src/lib/guides/backlog.ts` and `guide-content.ts`, maps fields to the new schema, and inserts them as published records. After seeding, the TypeScript files become the fallback (for slugs not yet in DB) and are gradually deprecated.

Fallback logic:

```
getGuideContent(slug) → 
  1. Check Convex guidePages for published record with slug
  2. If found: return DB content
  3. If not found: fall back to existing TypeScript content modules
  4. If not found there: return 404
```

This allows a zero-risk migration: nothing breaks until content is explicitly migrated.

---

## MVP Phased Roadmap

### Phase 1 — Essential CMS and SEO features (v1)

**Objective:** Allow non-technical editors to create, edit, preview, and publish guide pages from the admin panel with full SEO field control.

**Main features:**
- Convex `guidePages` table and `guideRevisions` table
- Convex `redirects` table
- Admin panel guide list, create, edit, publish, unpublish
- Bilingual (EN/NL) field editing
- Draft → in review → published workflow
- Preview via Next.js draft mode
- Slug management + automatic redirect on slug change
- SEO fields (all fields in content model)
- FAQ block editor
- SEO checklist panel with inline warnings
- Audit log writes
- Role-based access (editor / admin)
- Public guide pages served from Convex (fallback to TypeScript)
- XML sitemap updated from Convex
- Redirects served from Next.js middleware

**Dependencies:**
- Existing admin panel auth (`convex/admin/authz.ts`)
- Existing guide page template (`src/app/(public)/guides/[slug]/page.tsx`)
- Next.js draft mode support

**Risks:**
- Migration seeding script must be validated before switching public routing to DB-first
- Preview mode requires a secure secret token; must not leak draft content
- Redirect middleware performance: query must be cached or indexed efficiently

**Acceptance criteria:**
- An editor with no coding knowledge can create, edit, preview, and publish a guide end-to-end
- SEO checklist shows accurate warnings for missing fields
- Published guide renders correctly on the public site
- Slug change on a published guide creates a 301 redirect
- All field changes are recorded in the audit log
- `npx tsc --noEmit` passes
- All existing guide pages continue to load correctly during migration

---

### Phase 2 — Editorial improvements (v2)

**Objective:** Make the CMS faster, richer, and less error-prone for editors working on 50+ guides.

**Main features:**
- Rich text editor (TipTap or Lexical) for body sections — replaces plain textarea
- Drag-and-drop reordering of sections and FAQ items
- Bulk status actions (publish/unpublish multiple guides)
- Content revision history UI with restore
- Related guides picker with live search
- Tag autocomplete from existing tag corpus
- Guide duplication (clone an existing guide as starting point)
- Image upload to Convex file storage (replaces URL-only field)
- SEO score indicator (Flesch reading ease, keyword density hints)
- Last-published-diff view (what changed since last publish)

**Dependencies:** Phase 1 complete

**Risks:** Rich text editor choice affects long-term serialization; content stored as structured JSON (ProseMirror/Lexical AST) may require a migration if editor is swapped

---

### Phase 3 — Scale and automation features (v3)

**Objective:** Support high-volume content operations, internal workflow efficiency, and SEO at scale.

**Main features:**
- Content scheduling (publish at future date/time)
- AI-assisted meta title and meta description suggestions (Claude API)
- AI-assisted FAQ generation from body content
- Internal linking recommendations (ML-based related guide suggestions)
- Broken internal link detection
- Bulk import from CSV or Markdown files
- External SEO tool integration (Google Search Console data inline)
- Multi-step approval workflow (editor → reviewer → admin)
- Content calendar view
- Guide performance analytics inline (impressions, clicks, CTR from GSC)

**Dependencies:** Phase 2 complete, Claude API access, GSC API integration

---

## Prioritized Backlog

### Epic 1: Content storage and API layer

| Story | Priority | Why it matters | Acceptance criteria |
|---|---|---|---|
| Define `guidePages` Convex schema | P0 | Foundation for everything | Schema validates, `npx tsc --noEmit` passes |
| Define `guideRevisions` schema | P0 | Revision history requirement | Schema validates |
| Define `redirects` schema | P0 | Required for slug changes | Schema validates |
| Implement `createGuide` mutation | P0 | CMS create flow | Creates record in DB with all fields |
| Implement `updateGuide` mutation | P0 | CMS edit flow | Updates record, increments version, writes revision |
| Implement `publishGuide` mutation | P0 | Publishing flow | Sets status to published, sets timestamps |
| Implement `unpublishGuide` mutation | P0 | Unpublish flow | Sets status to unpublished |
| Implement `getPublishedGuide` query | P0 | Public page rendering | Returns guide or null for draft/unpublished |
| Implement `getDraftGuide` query (admin) | P0 | Preview + admin edit | Returns any status, auth-gated to admin |
| Implement `listGuides` query (admin) | P0 | Admin list view | Returns paginated list with filters |
| Implement `createRedirect` mutation | P0 | Slug change flow | Creates redirect record |
| Seed migration script | P0 | Zero-risk migration | All existing guides seeded, public routes unbroken |
| Fallback routing (DB → TypeScript) | P0 | Migration safety | Falls back cleanly for unseeded slugs |

### Epic 2: Admin panel UI

| Story | Priority | Why it matters | Acceptance criteria |
|---|---|---|---|
| `/admin/guides` list page | P0 | Entry point for editors | Shows all guides with status, filters |
| Create guide form | P0 | Content creation | All fields present; saves as draft |
| Edit guide form | P0 | Content editing | All fields editable; saves, publishes |
| EN/NL tab switcher | P0 | Bilingual support | Each localized field has EN+NL tabs |
| SEO tab with checklist panel | P0 | SEO quality control | Shows pass/warn/fail per SEO rule |
| Preview button | P0 | Editor confidence | Opens live page with draft data |
| Publish / unpublish controls | P0 | Publishing workflow | Admin-only; confirms before unpublish |
| FAQ block editor | P0 | FAQ content | Add, edit, remove FAQ items |
| Status workflow buttons | P1 | Review flow | Submit for review, request changes |
| Redirect management UI | P1 | Slug change flow | Admin can view and manage redirects |
| Audit log view | P1 | Governance | Admin sees field-level change history |
| Guide search and filter | P1 | Scale | Filter by status, cluster, locale, author |

### Epic 3: Public site integration

| Story | Priority | Why it matters | Acceptance criteria |
|---|---|---|---|
| Guide page template reads from Convex | P0 | Content live on site | Published guide renders correctly |
| `generateMetadata` uses CMS SEO fields | P0 | SEO delivery | Title, meta, OG fields from DB |
| JSON-LD structured data from CMS fields | P0 | Structured data SEO | Article, FAQ, Breadcrumb schemas generated |
| XML sitemap includes published guides | P0 | Crawlability | All published guides appear with `lastmod` |
| Redirects served from middleware | P0 | URL hygiene | 301 redirects work for changed slugs |
| Guide listing page reads from Convex | P1 | Content freshness | Hub pages show DB-managed guides |
| Preview API route | P1 | Editor workflow | Draft mode renders draft content only |

---

## Acceptance Criteria for v1

### CMS core (admin panel + database)

| ID | Criterion | Blocking? | How to verify |
|---|---|---|---|
| AC-01 | Editor creates a guide, fills all fields, saves as draft — no code changes required | Yes | Manual: create end-to-end in browser |
| AC-02 | Editor previews a draft guide before publishing | Yes | Manual: preview opens correct page with draft data |
| AC-03 | Admin publishes a guide; it appears on the public site immediately | Yes | Manual: publish → load public URL → 200 |
| AC-04 | Admin unpublishes a guide; the public URL returns 404 | Yes | Manual: unpublish → load public URL → 404 |
| AC-05 | Changing a published guide's slug creates a 301 redirect from old URL to new URL | Yes | `curl -I {oldUrl}` → 301 → newUrl |
| AC-06 | SEO checklist in admin panel shows inline warnings for missing H1 and missing meta description | Yes | Manual: leave fields empty, observe checklist |
| AC-07 | Publishing is hard-blocked if H1 is missing | Yes | Manual: attempt publish without H1 → error shown, not published |
| AC-08 | Editors cannot publish or unpublish; those buttons are invisible or disabled for editor role | Yes | Manual: log in as editor, verify no publish button |
| AC-09 | All field changes on a guide are recorded in the audit log with user, timestamp, and changed fields | Yes | Manual: edit guide fields → open audit log → entries present |
| AC-10 | Slug conflict is caught in real time before save; save is blocked if slug is already taken | Yes | Manual: create two guides with same slug → error on second |

### SEO delivery

| ID | Criterion | Blocking? | How to verify |
|---|---|---|---|
| AC-11 | `<title>`, `<meta name="description">`, and OG tags are rendered from CMS fields on the public guide page | Yes | `curl {guideUrl}` → inspect HTML `<head>` |
| AC-12 | JSON-LD Article schema is present on every published guide page | Yes | HTML `<head>`: valid Article JSON-LD |
| AC-13 | JSON-LD FAQPage schema is present when the guide has at least one FAQ | Yes | HTML `<head>`: valid FAQPage JSON-LD |
| AC-14 | JSON-LD BreadcrumbList schema is present on every guide page | Yes | HTML `<head>`: valid BreadcrumbList JSON-LD |
| AC-15 | All published guides appear in `/sitemap.xml` with correct `lastmod` value | Yes | Load sitemap, verify guide entries and dates |
| AC-16 | Guides with `robotsIndex: false` emit `<meta name="robots" content="noindex">` | Yes | Set field → inspect HTML `<head>` |

### Migration safety

| ID | Criterion | Blocking? | How to verify |
|---|---|---|---|
| AC-17 | All 52+ existing guide pages continue to load and render correctly after Convex schema is added | Yes | Smoke test: load all guide URLs, expect 200 with content |
| AC-18 | Guide pages not yet in the DB fall back cleanly to the TypeScript content | Yes | Query for non-existent slug in DB → page still renders from TypeScript |
| AC-19 | `npx tsc --noEmit` passes with zero errors | Yes | Run in CI after every task |
| AC-20 | All pre-existing tests pass with no regressions | Yes | Run test suite after every task |

### Batch JSON import

| ID | Criterion | Blocking? | How to verify |
|---|---|---|---|
| AC-21 | Import script reads all 31 EN + 31 NL files and creates 31 paired bilingual records | Yes | Run script → `imported: 31, skipped: 0, errors: 0` |
| AC-22 | Import script is idempotent: re-running without `--overwrite` skips all existing records | Yes | Run twice → second run: `imported: 0, skipped: 31` |
| AC-23 | `libraryBody.en` and `libraryBody.nl` are stored as complete Markdown strings (not truncated or corrupted) | Yes | Query `bike-fitting-for-knee-pain` → verify `libraryBody.en` length > 5000 chars |
| AC-24 | All SEO fields (`metaTitle`, `metaDescription`, `h1`) are populated for both locales after import | Yes | Query any imported guide → all bilingual SEO fields non-empty |
| AC-25 | Hero images are served correctly from `public/guides/media/` after `--copy-images` | Yes | `curl /guides/media/003--guides--bike-fitting-for-knee-pain-hero.png` → 200 |
| AC-26 | Imported guides are immediately accessible as published pages on the public site without a deployment | Yes | Import → load `/guides/bike-fitting-for-knee-pain` → 200 with content |

### Standard page template

| ID | Criterion | Blocking? | How to verify |
|---|---|---|---|
| AC-27 | Hero image renders above the H1 on all imported guides that have `heroImagePublicPath` | Yes | Visual check: load guide page, image visible above heading |
| AC-28 | Quick Answer 3-card block renders correctly with extracted `keyTakeaway`, `commonMistake`, `payAttention` | Yes | Visual check: knee pain guide → 3 cards with correct content |
| AC-29 | Markdown body renders tables, numbered lists, h2/h3 headings, bold, and internal links correctly | Yes | Visual check on a guide with a symptom matrix table |
| AC-30 | Internal links in Markdown body use Next.js `Link` (client-side navigation, not full reload) | Yes | Click an internal link → browser does client navigation |
| AC-31 | FAQ accordion renders extracted FAQ items in collapsed state by default | Yes | Visual check: FAQ items visible but not expanded |
| AC-32 | Related guides section shows `internalLinkTargets` as linked cards | Yes | Visual check: related links visible at bottom of guide |

### Conversion zones

| ID | Criterion | Blocking? | How to verify |
|---|---|---|---|
| AC-33 | CTA Zone A (soft tool CTA) appears on the saddle height guide and knee pain guide; does not appear on hub pages | Yes | Visual check: tool CTA visible on leaf guides, absent on hub |
| AC-34 | CTA Zone B (mid-page) renders with funnel-appropriate copy (MOFU copy for knee pain, TOFU copy for ride-types hub) | Yes | Visual check: inspect mid-page CTA text on both guide types |
| AC-35 | CTA Zone C (closing band) "Start Free Fit" link includes `?from=guide&slug={slug}` query parameter | Yes | Inspect `href` of closing CTA button |
| AC-36 | All three CTA zones fire `TrackedCtaLink` events with correct `section` values | Yes | Check browser network/analytics events when clicking each CTA |
| AC-37 | A guide with no matching tool (e.g. a nutrition guide) shows no CTA Zone A | Yes | Visual check on nutrition cluster guide |

---

## Success Metrics

### Editorial efficiency

| Metric | Target | How to measure |
|---|---|---|
| Time to publish a new guide | < 30 min for a prepared content piece | Editor session timing |
| Developer involvement in content updates | Zero deploys triggered by content-only changes | Count deploys with no code changes |
| Draft-to-published cycle time | < 24 hours | Audit log: time between `create` and `publish` events |
| Editor error rate on publish | < 10% of attempts blocked by missing fields | Audit log: blocked publish attempts |
| Guides requiring re-edit after first publish | < 20% within 48 hours | Compare `createdAt` vs next `update` event |

### SEO quality

| Metric | Target | How to measure |
|---|---|---|
| Published guides missing `metaDescription` | 0 | CMS admin query: filter `status=published, metaDescription.en=null` |
| Published guides missing `h1` | 0 | Hard-blocked by publish validation |
| Published guides in XML sitemap | 100% | Compare sitemap entry count vs `listGuides(published)` count |
| Structured data validation errors | 0 critical | Google Rich Results Test on 5 sampled guides |
| Broken internal links on imported guides | 0 | Internal link checker script after import |
| Canonical URL present and correct | 100% of published guides | Crawl `<link rel="canonical">` tag |

### Import quality

| Metric | Target | How to measure |
|---|---|---|
| Import success rate | 31/31 pairs with no errors | Script output summary |
| Bilingual field coverage after import | 100% of bilingual fields populated for both locales | Query all imported guides: count nulls |
| Hero images accessible after import | 31/31 | HTTP check on all `heroImagePublicPath` values |
| `npx tsc --noEmit` after import | Pass | Run after import script completes |

### Page template quality

| Metric | Target | How to measure |
|---|---|---|
| Guide pages rendering hero image | 31/31 imported guides | Visual spot-check + automated path check |
| Guide pages with Quick Answer cards | 31/31 leaf guides | Visual spot-check (Quick Answer section in Markdown) |
| Guide pages with FAQ accordion | ≥ 28/31 (guides with FAQ section) | Visual spot-check |
| Markdown table rendering correctly | 100% of guides with tables | Visual spot-check on knee pain, saddle height, main hub |
| Page load time on guide pages | Core Web Vitals LCP < 2.5s | Lighthouse on 3 sampled guides |

### Conversion performance

| Metric | Baseline target | How to measure |
|---|---|---|
| CTA Zone A click-through rate | ≥ 3% of page views | `guide_soft_tool_cta` events / pageviews |
| CTA Zone B click-through rate | ≥ 2% of page views | `guide_mid_page_cta` events / pageviews |
| CTA Zone C click-through rate | ≥ 4% of page views | `guide_closing_cta` events / pageviews |
| Guide → account creation conversion | ≥ 1% of guide pageviews | Guide pageview → account created in same session |
| Guide → tool usage (post-login) | ≥ 40% of conversions from guides | Convex: user created via guide slug → first action = tool |
| Scroll depth ≥ 75% on leaf guides | ≥ 50% of sessions | GA4 scroll depth events |

### Organic traffic support

| Metric | How to track | Direction |
|---|---|---|
| Guides indexed in Google Search | GSC Coverage report | Upward (target: 31/31 after import) |
| Impressions from guide pages | GSC Performance report | Upward MoM |
| Clicks from guide pages | GSC Performance report | Upward MoM |
| Rich result eligibility (Article + FAQ) | GSC Rich Results report | All 31 guides eligible |
| Core Web Vitals on guide pages | CrUX via GSC | LCP < 2.5s, CLS < 0.1 |

---

## Batch JSON Import

### Source files

62 production-ready guide JSON files live in `docs/cms-import/`:
- `docs/cms-import/en/` — 31 English guides
- `docs/cms-import/nl/` — 31 Dutch guides
- `docs/cms-import/images/` — hero images (PNG, filename matches `heroImageFileName` field)

Files are named `{order}--{path-slug}.json`. EN and NL files share the same slug and are paired on import.

### JSON field map

Each file contains these fields:

| JSON field | Target in Convex schema | Notes |
|---|---|---|
| `backlogOrder` | `backlogOrder` | Integer, used for ordering in list views |
| `slug` | `slug` | Includes cluster prefix, e.g. `guides/bike-fitting-for-knee-pain` |
| `path` | derived | Strip locale prefix; becomes `path` |
| `locale` | (merge key) | Used to split EN/NL during merge |
| `cluster` | `cluster` | Maps to cluster name string |
| `status` | `importStatus` | Source status (`Existing`, `Existing + expand`, etc.) — not the CMS publish status |
| `pageTitle` | `pageTitle.{locale}` | Bilingual |
| `metaTitle` | `metaTitle.{locale}` | Bilingual |
| `h1` | `h1.{locale}` | Bilingual |
| `pageBrief` | `pageBrief.{locale}` | Bilingual |
| `primaryCtaLabel` | `primaryCtaLabel.{locale}` | Bilingual |
| `primaryCtaTarget` | `primaryCtaTarget` | Strip locale prefix — store as `/login` |
| `internalLinkTargets` | `relatedGuidePaths` | Array of path strings |
| `notesOrRedirects` | `importNotes` | Informational only |
| `libraryBody` | `libraryBody.{locale}` | Full Markdown string — bilingual |
| `metaDescription` | `metaDescription.{locale}` | Bilingual |
| `relatedKeywords` | `relatedKeywords` | Array of strings (not locale-specific — EN drives) |
| `alternateLocalePath` | derived | Used to build `hreflang` alternates |
| `backlogSeoHints` | `seoHints` | Stored as JSON object — for editor reference |
| `heroImageFileName` | `heroImageFileName` | Filename, e.g. `003--guides--bike-fitting-for-knee-pain-hero.png` |
| `heroImagePublicPath` | `heroImagePublicPath` | Public path, e.g. `/guides/media/003--guides--bike-fitting-for-knee-pain-hero.png` |

### Content storage: Markdown-first

The `libraryBody` field is a rich, well-structured Markdown string. It contains:
- `## Quick answer` section — extracted for structured quick-answer cards
- `## FAQ` section — extracted for FAQ accordion and JSON-LD FAQPage schema
- All other sections — rendered as prose Markdown

**Decision: store `libraryBody` as a Markdown string, not as structured sections.**

Rationale:
- Converting Markdown → structured sections loses fidelity (tables, inline links, emphasis all degrade)
- The existing TypeScript content system used structured sections; those will be migrated to Markdown in v1 or kept as legacy fallback
- Markdown is human-readable and editable in the CMS textarea; it does not require a rich-text editor in v1
- Extraction of quick-answer and FAQ blocks happens at render time using a lightweight parser — not at storage time

**Extraction logic (render time):**
```
extractQuickAnswer(libraryBody) →
  finds "## Quick answer" section
  parses "**Key takeaway:**", "**Most common mistake:**", and "**Who should pay extra attention:**" lines
  returns GuideQuickAnswer { keyTakeaway, commonMistake, payAttention }

extractFaqs(libraryBody) →
  finds "## FAQ" section
  parses "### {question}" + following paragraph as answer
  returns GuideFaq[]
```

The full Markdown body (including the Quick answer and FAQ sections) is rendered in the body region. The extracted quick-answer and FAQ are also rendered in their dedicated structured components (3-card block and FAQ accordion). This means they appear twice: once in the structured component and once inline in the body. This is intentional — the structured block appears above the fold, the inline section provides depth later.

### Import script (`scripts/import-guide-json.ts`)

A Node.js script that:
1. Reads all files from `docs/cms-import/en/` and `docs/cms-import/nl/`
2. Pairs EN and NL files by slug
3. Merges bilingual fields into the schema format: `{ en: string, nl: string }`
4. Strips locale prefix from `primaryCtaTarget` (e.g. `/en/login` → `/login`)
5. Strips locale prefix from `internalLinkTargets` paths
6. Sets `status: "published"` for all imports (source files are production content)
7. Sets `publishedAt` and `lastUpdatedAt` to current timestamp
8. Sets `createdBy: "import"` to distinguish from human-created records
9. Checks for existing records by slug — skips duplicates (idempotent)
10. Prints summary: `{ total, imported, skipped, errors }`

**Script invocation:**
```bash
npx tsx scripts/import-guide-json.ts
# Options:
# --dry-run        — log what would be imported without writing to DB
# --locale en      — import only one locale pair (still merges both files)
# --slug guides/bike-fitting-for-knee-pain   — import single guide
# --overwrite      — overwrite existing records (use carefully)
```

### Image serving

Hero images are currently PNG files in `docs/cms-import/images/`. They must be copied to a publicly accessible location:
- Copy to `public/guides/media/` to match the `heroImagePublicPath` field
- The import script accepts a `--copy-images` flag to copy all images automatically
- After copy, images are served at `/guides/media/{filename}` via Next.js static serving

---

## Standard Guide Page Template

### Design principles

1. **Structured conversion zones** — the page has four intentional CTA positions, not one at the bottom
2. **Content-first** — the CTA never interrupts the reading flow; it appears at natural pause points
3. **Funnel-aware** — the language and urgency of each CTA scales with the guide's funnel position (TOFU / MOFU / BOFU)
4. **Consistent layout** — every guide follows the same zone order; editors never need to think about page structure
5. **Markdown rendering** — `libraryBody` is rendered as styled Markdown, not converted to components

### Page template anatomy

```
┌─────────────────────────────────────────────────┐
│  ZONE 1: HERO                                   │
│  Hero image (full-width, contained)             │
│  Eyebrow (Guide / Hub)                          │
│  H1                                             │
│  pageBrief                                      │
│  chips: cluster + sections count + locale flag  │
│  back-to-guides link                            │
├─────────────────────────────────────────────────┤
│  ZONE 2: QUICK ANSWER (3 cards)                 │
│  Extracted from ## Quick answer section         │
│  Card 1: Key takeaway                           │
│  Card 2: Most common mistake                    │
│  Card 3: Who should pay extra attention         │
├─────────────────────────────────────────────────┤
│  CTA ZONE A: SOFT TOOL CTA                      │
│  Inline, low-friction                           │
│  "While you read — try the [tool] for this"     │
│  Only shown if guide has a relevant tool        │
├─────────────────────────────────────────────────┤
│  ZONE 3: MARKDOWN BODY                          │
│  Full libraryBody rendered as Markdown          │
│  Styled prose: headings, paragraphs, tables,    │
│  inline links, bold/italic, ordered lists       │
│  Disclaimer banner (if cluster = pain)          │
├─────────────────────────────────────────────────┤
│  CTA ZONE B: MID-PAGE CONVERSION CTA            │
│  Appears after the body, before FAQ             │
│  "Your fit picture is becoming clearer.         │
│   Start your free fit to get a full assessment" │
│  Primary: "Start Free Fit" → /login             │
│  Secondary: related calculator link             │
├─────────────────────────────────────────────────┤
│  ZONE 4: FAQ ACCORDION                          │
│  Extracted from ## FAQ section                  │
│  Accordion-style (collapsed by default)         │
│  Renders FAQ JSON-LD                            │
├─────────────────────────────────────────────────┤
│  ZONE 5: RELATED GUIDES                         │
│  internalLinkTargets as cards                   │
│  Card: title + pageBrief + arrow link           │
│  max 4 guides shown                             │
├─────────────────────────────────────────────────┤
│  CTA ZONE C: CLOSING CTA BAND (PublicCtaBand)  │
│  Full-width                                     │
│  Funnel-aware title + description               │
│  Primary: "Start Free Fit" → /login             │
└─────────────────────────────────────────────────┘
```

### Hero image

- Render above the text hero using `<Image>` (Next.js)
- Source: `heroImagePublicPath` (from CMS record or JSON import)
- Aspect ratio: 16:9, max-width 5xl, rounded corners
- Alt text: `{h1} — BestBikeFit4U guide`
- Lazy loading: `priority={false}` (below fold on mobile)

### Markdown rendering

Use `react-markdown` with `remark-gfm` (GitHub Flavored Markdown for tables, strikethrough, task lists):

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-6 mb-2">{children}</h3>,
    p: ({ children }) => <p className="text-sm leading-7 text-muted-foreground mb-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mb-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground mb-4">{children}</ol>,
    table: ({ children }) => (
      <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border/70 bg-card mb-4">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="px-4 py-3 text-left font-semibold text-foreground">{children}</th>,
    td: ({ children }) => <td className="px-4 py-3 text-muted-foreground">{children}</td>,
    a: ({ href, children }) => (
      <Link href={href ?? "#"} className="text-primary underline underline-offset-2 hover:no-underline">{children}</Link>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 italic text-sm text-muted-foreground mb-4">{children}</blockquote>
    ),
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  }}
>
  {libraryBody}
</ReactMarkdown>
```

The `libraryBody` is rendered inside a `<article className="prose-guide">` wrapper within a `PublicSection`.

### FAQ accordion

FAQs are extracted from the `## FAQ` section of `libraryBody` at render time. They are rendered in a dedicated accordion section (collapsed by default) using `PublicSurfaceCard` or a simple `<details>`/`<summary>` pattern. This is a separate render from the inline Markdown — the Markdown body renders the FAQ inline as prose; the accordion section renders them structured.

The FAQ section also generates the `FAQPage` JSON-LD schema.

### Hub pages vs leaf pages

The template serves both hub pages (cluster index, like `/guides/pain-and-discomfort`) and leaf pages (individual guides like `/guides/bike-fitting-for-knee-pain`). Distinguish via `childPages.length > 0`:

- **Hub pages**: Zone 2 shows child guide cards instead of quick-answer cards; no body Markdown; no FAQ; CTA Zone A not shown
- **Leaf pages**: full template as above

---

## Visitor-to-Account Conversion Strategy

### The opportunity

Guide pages are pure-organic, high-intent traffic. A rider searching "bike fit for knee pain" or "saddle height setup" has a concrete problem. The strategy is to be the best resource for that problem — and then make the path from "I understand my issue" to "I want help with my fit" as natural as possible.

This is not a hard-sell strategy. Forced CTAs on educational content create bounce. The strategy is to:
1. Give the rider more than they expected
2. Position the tool as the logical next step for their specific problem
3. Create momentum through context: "you now understand the problem, here is where you go to solve it"

### Funnel levels in the JSON

Each guide has `backlogSeoHints.funnel`:
- `TOFU` — cluster hubs (pain-and-discomfort, ride-types); broad informational intent; visitors are exploring
- `MOFU` — specific symptom and setup guides (knee pain, saddle height); riders with a real problem
- `BOFU` — parameter and technical guides (cleat position, crank length); riders ready to act

CTA language scales with funnel level:

| Funnel | CTA Zone A (soft) | CTA Zone B (mid-page) | CTA Zone C (closing) |
|---|---|---|---|
| TOFU | "Not sure where to start? Use the free fit tool to find your issue." | "The right guide is only useful if your setup is measured first." | "Start with a free fit — understand your position before adjusting." |
| MOFU | "Try our [specific calculator] for this exact problem." | "You now understand why this happens. Let's check your numbers." | "Get your personal setup checked — free, 10 minutes." |
| BOFU | "Use the [specific tool] to apply this to your bike." | "Your measurements + these principles = a complete fit picture." | "Start Free Fit — enter your measurements and get your fit report." |

### CTA Zone A — soft tool CTA

A subtle, inline card that appears after the Quick Answer block (before the body). It is only shown when the guide has a matching tool.

**Tool matching logic** (`resolveSoftCtaTool(cluster, slug)`):
| Guide slug / cluster | Tool link |
|---|---|
| `saddle-height-guide` | `/calculators/saddle-height` |
| `saddle-width-*` | `/calculators/saddle-width` |
| `reach-and-stem-guide` | `/calculators/bike-fit` |
| `crank-length-guide` | `/calculators/bike-fit` |
| `frame-size` / `bike-size` | `/calculators/frame-size` |
| cluster: `Pain & Discomfort` | `/calculators/bike-fit` |
| `ride-types/*` | `/calculators/bike-fit` |
| fallback | null (Zone A not shown) |

**Component:**
```
┌─────────────────────────────────────────────────┐
│  [Calculator icon]  While you read               │
│  Try the [saddle height calculator] — get your  │
│  starting point in under 2 minutes.              │
│  [Open calculator →]                             │
└─────────────────────────────────────────────────┘
```
Design: subtle `bg-muted/50` card, not a full CTA band. Should feel like a resource suggestion, not an advertisement.

### CTA Zone B — mid-page conversion CTA

A medium-weight CTA that appears after the body content and before the FAQ. Uses `PublicCtaBand` or an inline banner.

- For authenticated users: "Open your fit dashboard" → `/dashboard`
- For unauthenticated users: "Start Free Fit" → `/login` (which opens the fit questionnaire after signup)
- The description is guide-specific (configured per guide in the CMS `ctaDescription` field or derived from cluster)

**Guide-specific CTA descriptions** (defaults by cluster, overridable in CMS):
| Cluster | CTA Zone B description |
|---|---|
| Pain & Discomfort | "You now understand why this symptom happens. Use the free fit to check whether your numbers are in the right range." |
| Ride Types | "Your riding style shapes your fit priorities. Use the free fit to translate that into concrete numbers." |
| Setup Parameters | "Parameters make sense when they're connected to your anatomy. Start your fit to get the numbers that belong to you." |
| Shoe & Cleat | "Cleat and shoe setup interacts with every other fit variable. The dashboard shoe module gives you a guided setup process." |

### CTA Zone C — closing CTA band

`PublicCtaBand` at the bottom of every guide. This is the primary conversion point.

For accounts, the CTA should not always be "Start Free Fit" — it should be contextual:
- If user is logged out: "Start Free Fit" → `/login`
- If user is logged in: "Open your fit dashboard" → `/dashboard`

Use a server component that reads the auth state and renders the appropriate CTA.

### Conversion signals to track

Each CTA zone must fire a `TrackedCtaLink` event with:
- `section`: `"guide_soft_tool_cta"` | `"guide_mid_page_cta"` | `"guide_closing_cta"`
- `ctaLabel`: the visible button label
- `pagePath`: the guide path

This allows funnel analysis: which guides and which CTA zones convert best.

### Account value proposition on guide pages

The guide pages should answer an implicit question readers have: "If I want more than this guide, what does the product offer?"

Add a small "What BestBikeFit4U gives you" info block (optional, configurable in CMS):

```
What you get with a free account:
✓  Your personal fit measurements stored
✓  Saddle height, reach, frame size — calculated for your body
✓  Connected to your bike — check fit for any bike you own
✓  Symptom tracking — monitor whether changes helped
Free. No credit card. Takes 10 minutes.
```

This block appears in CTA Zone B on MOFU/BOFU guides. It frames the account as a natural extension of the reading experience — not a paywall.

### URL and content alignment

The `primaryCtaTarget` in every JSON file is already `/[locale]/login`. On the login page, the product's value proposition must align with the guide the user came from. This is done via:
- `?from=guide&slug={slug}` query parameter on the CTA link
- Login/signup page reads `from` and `slug` parameters
- After auth, redirect to the guide's next logical tool (not just the dashboard)
- Example: knee pain guide → login → redirect to `/dashboard` with a prompt to fill saddle height and cleat data

This creates a coherent experience: guide → understand the problem → account → tool → result.

### Metrics

| Signal | What it means | How to track |
|---|---|---|
| CTA Zone A clicks | Reader engaged with specific tool | `guide_soft_tool_cta` event |
| CTA Zone B clicks | Reader is mid-funnel, ready to act | `guide_mid_page_cta` event |
| CTA Zone C clicks | Reader completed the guide | `guide_closing_cta` event |
| Guide → Login page → Account created | Full conversion from organic guide | GA4 / Convex user creation |
| Guide → Login → Tool used | Quality conversion (not just signup) | Convex action record |
| Scroll depth on guide pages | Content engagement | GA4 scroll events |
| Time on page vs CTA click | Are readers converting before or after reading? | GA4 timing + click events |
