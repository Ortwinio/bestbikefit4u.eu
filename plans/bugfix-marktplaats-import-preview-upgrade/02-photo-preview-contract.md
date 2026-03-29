# Step 02: Photo Preview Contract

## Objective

Turn the image area in the Marktplaats preview into a rider-verification step rather than a passive thumbnail list.

## Required UX

The preview must include:

- one large primary image
- a thumbnail strip
- a visible photo count
- clear selection state
- a warning when photo coverage is weak

## Required Behavior

- the first selected image becomes the primary preview by default
- selecting another thumbnail updates the large preview
- deselected images are visually distinct
- if fewer than 2 images are available, show a warning
- if no images are available, show a specific empty state with guidance

## Optional but Preferred UX

- a short rider-check prompt such as `Does this look like the bike you want to import?`
- light-quality hints like `Only one photo found`

## Acceptance Check

- a rider can identify the imported bike from the preview image area alone in normal cases
- the preview never renders a blank gallery area without explanation

