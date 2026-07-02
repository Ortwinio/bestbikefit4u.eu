# Prompt 03 — Admin UI

## Prerequisites

Prompts 01 and 02 must be complete: Convex schema and backend are live.

## Context

The admin panel lives under `src/app/(dashboard)/admin/`. Auth is handled by `requireAdminSession()` from `@/components/admin/auth/admin-session`. Data is fetched using `fetchAdminQuery` and `getAdminQueryToken`.

The closest reference is the guides admin module:
- `src/app/(dashboard)/admin/guides/page.tsx` — list page (server component)
- `src/app/(dashboard)/admin/guides/new/page.tsx` — create page
- `src/app/(dashboard)/admin/guides/[id]/edit/page.tsx` — edit page
- `src/components/admin/guides/GuideCreateView.tsx` — create form (client component)
- `src/components/admin/guides/GuideEditView.tsx` — edit form (client component)
- `src/components/admin/guides/GuidesAdminListClient.tsx` — list client component

Use the same layout, table styling, and form patterns.

---

## App router pages to create

### `/admin/blog` — list
`src/app/(dashboard)/admin/blog/page.tsx`
- Server component, calls `requireAdminSession()`
- Renders `<BlogAdminListClient />` passing the admin token
- Shows: Title (EN), status badge (Draft/Published), category, publishedAt, updatedAt, edit link
- Filter tabs: All | Draft | Published

### `/admin/blog/new` — create
`src/app/(dashboard)/admin/blog/new/page.tsx`
- Server component, calls `requireAdminSession()`
- Renders `<BlogCreateView sessionRole={session.adminRole} />`

### `/admin/blog/[id]` — detail/preview
`src/app/(dashboard)/admin/blog/[id]/page.tsx`
- Server component, fetches post via `api.blog.queries.getDraftPost`
- Shows a read-only preview of the rendered article alongside the key fields
- Publish / Unpublish buttons (mutation calls from client)
- Link to edit page

### `/admin/blog/[id]/edit` — edit
`src/app/(dashboard)/admin/blog/[id]/edit/page.tsx`
- Server component, fetches post, renders `<BlogEditView />`

---

## Client components to create in `src/components/admin/blog/`

### `BlogAdminListClient.tsx`
- Table of posts with columns: Title, Category, Status, Published date, Last edited, Actions
- Status badge: green "Published" / grey "Draft"
- Row click navigates to `[id]` detail page
- "New post" button → `/admin/blog/new`

### `BlogCreateView.tsx`
A multi-field form using Convex mutation `api.blog.mutations.createPost`. On success, redirect to `/admin/blog/[newId]/edit`.

Required fields (step 1 — just the essentials, everything else editable later):
- **Title EN** (text input, required) — also auto-populates slug
- **Title NL** (text input, required)
- **Slug** (text input, auto-generated from Title EN but editable; show preview: `/blog/[slug]`)
- **Category** (select or text input: "bike-fitting", "training", "gear", "nutrition", "other")
- **Status** — always starts as draft, shown but not editable on create

### `BlogEditView.tsx`

The main editor. Tabs at the top: **Content** | **SEO** | **Publishing** | **History**

#### Content tab
- Title EN / NL (text inputs)
- H1 override EN / NL (text inputs, optional; placeholder: "Leave blank to use title")
- Category (select)
- Tags (tag input — comma-separated or tag chips)
- **Body EN** (markdown editor — see below)
- **Body NL** (markdown editor — see below)
- Excerpt EN / NL (textarea, ~160 chars; shown in listing cards)
- Featured image URL (text input) + alt text EN / NL
- Table of contents toggle (checkbox)
- Related post slugs (comma-separated text input)
- Related guide paths (comma-separated text input)

#### Markdown editor (for Body fields)
Non-technical users need a usable editor. Use a split-pane approach:
- Left: `<textarea>` with a simple formatting toolbar above it (bold `**`, italic `*`, H2 `##`, H3 `###`, unordered list, ordered list, link `[text](url)`)
- Right: live preview using `react-markdown` (already in `package.json`)
- The toolbar inserts markdown syntax at the cursor position

This avoids adding a heavy WYSIWYG library while still being accessible to non-developers.

#### SEO tab
- Meta title EN / NL (text input; character counter, target ≤60)
- Meta description EN / NL (textarea; character counter, target ≤160)
- Canonical URL override (text input; placeholder: auto — `/blog/[slug]`)
- OG title EN / NL (text input; optional — falls back to meta title)
- OG description EN / NL (textarea; optional)
- OG image URL (text input)
- OG image alt EN / NL (text input)
- Robots index toggle (checkbox, default on)

#### Publishing tab
- Slug (editable; shows live preview URL)
- Author name (text input, optional)
- Status: Draft / Published (toggle or select)
- Published at: shown (read-only if already set; set automatically on first publish)
- **Publish** button (calls `publishPost`) / **Unpublish** button (calls `unpublishPost`)
- **Delete** button (only enabled on drafts; confirmation dialog before delete)

#### History tab
- List of revisions from `api.blog.queries.listBlogRevisions`
- Columns: Version, Saved by, Saved at
- No restore functionality needed in this iteration

#### Save behaviour
- "Save draft" button always visible — calls `updatePost`
- Auto-save on blur (optional, nice to have but not required)
- Show success toast on save
- Show error toast on failure

---

## Navigation

Add "Blog" to the existing admin sidebar navigation, grouped with "Guides". Use the same sidebar pattern already in place.

---

## Acceptance criteria

- Admin can create a new post, fill in content and SEO fields, and save as draft
- Admin can publish and unpublish a post from the Publishing tab
- Markdown editor shows live preview of rendered body
- Character counters on meta title and description fields
- Slug auto-generates from EN title but remains manually editable
- All fields save correctly (verified by reading back via `getDraftPost`)
- Revision list shows after each save
- "Blog" link appears in admin sidebar
