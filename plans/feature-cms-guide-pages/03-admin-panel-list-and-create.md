# Prompt 03 — Admin panel: guide list and create guide form

## Context

Prompts 01 and 02 delivered the backend and public route integration. This prompt builds the first half of the admin panel UI: the guide list page and the create guide form.

Read the plan README before starting. Complete Prompts 01 and 02 first.

Check the existing admin panel pattern by reading:
- `src/app/(dashboard)/` — dashboard layout conventions
- `convex/admin/` — authz, queries, mutations patterns

The admin panel is part of the existing authenticated `/dashboard` or `/admin` area. Follow the exact same layout, auth, and component patterns already used there.

## Goal

Build the admin guide list view and create guide form that allows an admin or editor to:
1. See all guides with status, cluster, locale, last updated
2. Filter and search guides
3. Create a new guide with all required fields
4. Save as draft

## What to implement

### 1. Admin guide list page

**Route:** `/admin/guides` (or `/dashboard/admin/guides` — match existing admin routing)

**Layout:**
- Page header: "Guide pages" + "New guide" button (admin + editor)
- Filter bar: status dropdown, cluster dropdown, search input
- Table/list of guides: columns = internal title, slug, cluster, status badge, last updated, author, actions (edit, preview, delete)
- Status badges: draft (gray), in_review (yellow), published (green), unpublished (red)
- Empty state with "Create your first guide" prompt
- Pagination (10 per page)

**Data:** uses `listGuides` Convex query from Prompt 01

**Auth:** only accessible to users with admin or editor role (use existing admin authz pattern)

### 2. Create guide form

**Route:** `/admin/guides/new`

**Form layout — three-tab structure:**

**Tab 1: Content**
- Internal title (single field, not bilingual — used in CMS list only)
- Cluster (select from predefined cluster list)
- Author (select from admin user list)
- EN/NL subtabs for localized fields:
  - Page title (maps to `pageTitle`)
  - H1 (maps to `h1`)
  - Page brief / summary (textarea, maps to `pageBrief`)
  - Body sections (see below)
  - FAQs (see below)
  - Quick answer fields (keyTakeaway, commonMistake, payAttention)
  - Primary CTA label
- Primary CTA target (route input, not localized)
- Tags (tag input with comma-separated or chip UI)
- Related guides (multi-select guide picker)
- Table of contents (checkbox toggle)

**Body sections editor:**
- List of sections, each with: title (text), type (select: prose / steps / cards / table), items (textarea, one item per line)
- "Add section" button appends a new blank section
- "Remove section" button per section
- Sections display in order; drag-to-reorder is v2

**FAQ editor:**
- List of FAQ items, each with: question (text input), answer (textarea)
- "Add FAQ" button appends a new blank Q+A pair
- "Remove FAQ" button per item

**Tab 2: SEO**
- EN/NL subtabs for:
  - Meta title (text input, character counter, 60 char soft limit)
  - Meta description (textarea, character counter, 160 char soft limit)
  - OG title (text input, optional — shows "falls back to meta title" hint when empty)
  - OG description (textarea, optional)
  - OG image alt
- OG image URL (not localized)
- Canonical URL override (not localized, optional)
- Index control (checkbox: "Include in search engine index", default checked)
- Featured image URL (not localized)
- Featured image alt (EN/NL)
- **SEO checklist panel** (always visible at bottom of SEO tab):
  - H1 filled: pass/warn
  - Meta title filled and ≤ 60 chars: pass/warn
  - Meta description filled and 50–160 chars: pass/warn
  - Slug set and unique: pass/fail
  - Featured image has alt text (if image set): pass/warn
  - robotsIndex is true: pass/warn (if false, show "this page will not be indexed" note)

**Tab 3: Settings**
- Slug field: text input with slug format validation (lowercase, hyphens, no spaces)
  - Shows full URL preview below field: `bestbikefit4u.eu/guides/{cluster}/{slug}`
  - Real-time uniqueness check (debounced Convex query)
- Status (read-only badge on create — always "draft" on create)
- Last updated date (auto-set; displayed only)
- Published at (auto-set; displayed only)

**Form actions:**
- "Save as draft" — always visible, always available
- "Submit for review" — changes status to `in_review`
- No publish button on the create form (publish is on the edit form, admin only)

### 3. Form validation

- Slug: required on save, URL-safe format enforced, uniqueness enforced
- H1: required to submit for review (soft warning on save as draft)
- All other validations as described in README

## Validation

- Create a new guide end-to-end in the browser
- Verify it appears in the guide list with correct status
- Verify draft guide does NOT appear on the public site
- Verify all form fields save correctly (query the DB record and compare)
- `npx tsc --noEmit` must pass
