# Output 02: Tooltip Primitives And API

## Date

2026-02-15

## Implemented

1. Added shared tooltip primitive:
   - `src/components/ui/Tooltip.tsx`
2. Added reusable field-label helper for native and shared controls:
   - `src/components/ui/FieldLabel.tsx`
3. Extended shared input API:
   - `src/components/ui/Input.tsx`
4. Extended shared select API:
   - `src/components/ui/Select.tsx`
5. Exported new primitives:
   - `src/components/ui/index.ts`

## New API Surface

### `Tooltip`

Props:
- `content: string` (required)
- `label?: string` (screen-reader label for trigger)
- `descriptionId?: string` (for deterministic `aria-describedby`)
- `className?: string`

Behavior:
- Opens on hover and focus.
- Toggles on click/tap.
- Closes on blur/mouse leave.
- Closes on `Escape` key.
- Uses `role="tooltip"` and accessible trigger description.

### `FieldLabel`

Props:
- `label: string` (required)
- `htmlFor?: string`
- `tooltip?: string`
- `tooltipLabel?: string`
- `tooltipDescriptionId?: string`
- `className?: string`

Pattern:
- Standardized label row with optional tooltip trigger.
- Designed for native `input/select/textarea` and custom controls.

### `Input` additions

New optional props:
- `tooltip?: string`
- `tooltipLabel?: string`

Accessibility updates:
- Adds `aria-describedby` chaining for tooltip description + helper + error.
- Helper/error text now have deterministic IDs.

### `Select` additions

New optional props:
- `tooltip?: string`
- `tooltipLabel?: string`

Accessibility updates:
- Adds `aria-describedby` chaining for tooltip description + helper + error.
- Helper/error text now have deterministic IDs.

## Usage Guidance

### Shared control usage

```tsx
<Input
  label="Inseam (cm)"
  tooltip="Floor-to-crotch distance used for saddle-height calculations."
  tooltipLabel="Inseam help"
  type="number"
/>
```

```tsx
<Select
  label="Bike Type"
  tooltip="Choose the category that best matches this bike."
  options={options}
/>
```

### Native field pattern (textarea/plain HTML)

Use `FieldLabel` with a native control when `Input`/`Select` are not used:

```tsx
<div>
  <FieldLabel
    label="Message"
    htmlFor="message"
    tooltip="Describe your question and riding context."
  />
  <textarea id="message" name="message" />
</div>
```

## Validation

- Typecheck: pass
- Lint: pass
- Tests: pass (`62/62`)
