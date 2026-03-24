# Panel Surface Inventory

## Shared Primitive Surfaces

### Prototyper dialog

- file: [dialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/prototyper-ui/ui/dialog.tsx)
- current owner: shared primitive
- remediation status: fixed
- reason:
  - dialog overlay now uses a dedicated `panel-backdrop`
  - dialog content now uses the shared opaque panel contract:
    - `panel-surface-base`
    - `panel-theme-context`

### Accessible dialog

- file: [AccessibleDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/ui/AccessibleDialog.tsx)
- current owner: shared wrapper
- remediation status: fixed
- reason:
  - SSR fallback and client path now both use the shared opaque panel contract

## Feedback Surfaces

### Feedback submission panel

- file: [FeedbackDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/FeedbackDialog.tsx)
- current owner: feedback feature
- remediation status: fixed
- reason:
  - right-side sheet now inherits the shared opaque panel contract
  - local content cards and action rows were adjusted to match the new high-contrast panel context

### Feedback detail dialog

- file: [FeedbackDetailDialog.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/feedback/FeedbackDetailDialog.tsx)
- current owner: feedback feature
- remediation status: fixed through shared wrapper
- reason:
  - this surface uses `AccessibleDialog`, so it inherits the remediation

## Dashboard Surfaces

### Mobile dashboard header

- file: [layout.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/layout.tsx)
- current owner: dashboard layout
- remediation status: fixed
- reason:
  - removed translucent `bg-card/90` and `backdrop-blur`
  - header is now opaque

### Mobile dashboard overlay and slide-over menu

- file: [layout.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/layout.tsx)
- current owner: dashboard layout
- remediation status: fixed
- reason:
  - overlay now uses `panel-backdrop`
  - slide-over menu now uses:
    - `panel-surface-base`
    - `panel-theme-context`

## Other Popup-Style Surfaces

### Cookie consent banner

- file: [CookieConsentBanner.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/CookieConsentBanner.tsx)
- current owner: layout/shared UX
- remediation status: fixed
- reason:
  - removed translucent panel body
  - banner now uses the shared opaque panel contract

### Admin and rider confirmation dialogs

- examples:
  - [BillingViews.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/admin/billing/BillingViews.tsx)
  - [MessageViews.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/admin/messages/MessageViews.tsx)
  - [settings/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/settings/page.tsx)
  - [results/page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/fit/[sessionId]/results/page.tsx)
- current owner: shared wrapper plus local feature owners
- remediation status: fixed through shared wrapper
- reason:
  - these surfaces use `AccessibleDialog` or the shared dialog primitive and inherit the shared fix
