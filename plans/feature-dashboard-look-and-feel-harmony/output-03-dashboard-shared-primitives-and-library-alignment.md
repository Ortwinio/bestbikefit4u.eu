# Output 03: Dashboard Shared Primitives And Library Alignment

## Classification

### Approved Prototyper-backed wrappers used by the dashboard

- [Button.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Button.tsx)
- [Card.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Card.tsx)
- [Input.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Input.tsx)
- [Select.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Select.tsx)
- [Textarea.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Textarea.tsx)
- [Progress.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Progress.tsx)
- [NumberInput.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/NumberInput.tsx)
- [Slider.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Slider.tsx)
- [AccessibleDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/AccessibleDialog.tsx)

### Legacy/local helpers kept in scope for harmony, not primitive replacement

- [SectionHeader.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/SectionHeader.tsx)
- [InfoBox.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/InfoBox.tsx)
- [MeasurementTile.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/MeasurementTile.tsx)
- [StatRow.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/StatRow.tsx)
- [Selectable.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Selectable.tsx)
- [States.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/States.tsx)

### Slider exception surfaces preserved

- [Slider.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/Slider.tsx)
- [NumberSlider.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/measurements/NumberSlider.tsx)
- [RidingStyleCard.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/profile/RidingStyleCard.tsx)
- related profile/measurement wizard slider surfaces remain on that approved path

## Implemented Alignment

- [shared.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/dashboard-messages/shared.tsx) now maps dashboard message surfaces to the shared dashboard muted-card contract instead of older card-local `color-mix(...)` surfaces.
- [FitReportActionGroup.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/reports/FitReportActionGroup.tsx) now uses the shared dashboard card surface for the in-dialog report viewer, so the reporting chrome matches the rest of the authenticated environment.

## Out Of Scope Legacy Surfaces Still Explicitly Tracked

- admin-only message builders and release-targeting UIs
- profile workflow internals outside the touched dashboard surfaces
- broader feedback hub page composition
- bike-garage detail flows beyond the page-level harmony pass

## Conclusion

The dashboard does not need a wholesale primitive migration. The main reusable stack is already Prototyper-backed. This step keeps that wrapper model, preserves the slider exception, and moves the visible dashboard-owned shared surfaces toward the new dashboard token contract.

