# Step 03 — Dashboard Import Flow

## Objective

Design the rider-facing flow that turns a pasted advert URL into a reviewable bike draft.

## Flow Requirements

1. Rider opens bike import from the dashboard.
2. Rider pastes a Marktplaats URL.
3. System fetches and parses the advert.
4. Rider sees a preview and can edit the draft.
5. Rider confirms and creates the bike.
6. Rider lands on the existing bike detail page.

## Tasks

1. Choose the entry surface:
   - inline on the bike garage page
   - right-side sheet
   - dedicated import page
2. Define the preview fields and editability:
   - bike name
   - brand
   - model
   - bike type
   - description
   - selected photos
3. Define clear fallback copy when parsing succeeds only partially.
4. Define error states for:
   - unsupported URL
   - advert no longer exists
   - rate-limited fetch
   - image import failure
5. Define final success behavior and landing location.

## Deliverable

Create `output-03-dashboard-flow.md` with:

- chosen flow shape
- form fields
- state diagram
- user-facing copy requirements
- acceptance mapping for the rider flow
