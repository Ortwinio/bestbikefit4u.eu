# Prompt 01 — Fix Header CTA Duplication

## Context

Read `plans/design-language-v1/README.md` first.

**The problem**: The `CampaignAnnouncementBar` in the header renders a "Start gratis" primary button on the right. The `HeaderAuthActions` component (rendered in the same header) also renders a "Start gratis" ghost button. On every page load, two CTAs with the same label appear simultaneously in the top 154px of the page — one in the announcement bar, one in the nav.

This violates CTA hierarchy rule #4 and dilutes both buttons.

**Files to read before starting**:
- `src/components/campaign/CampaignAnnouncementBar.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/HeaderAuthActions.tsx`
- `src/components/layout/HeaderMobileMenu.tsx`

## Task

When the announcement bar is active (`isConsumerCampaignActive()` returns true), the nav should not show a competing "Start gratis" CTA. The bar already covers that conversion path. The nav "Start gratis" should be replaced with a "Doneer" outline link during campaign periods.

## Deliverables

### 1. Update `HeaderAuthActions.tsx`

The component already receives `locale`. It needs to know whether the campaign is active to decide which CTA to show in the nav.

**Add prop**:
```ts
type HeaderAuthActionsProps = {
  locale: Locale;
  loginLabel: string;
  getStartedLabel: string;
  dashboardLabel: string;
  campaignActive?: boolean;      // new
  donateLabel?: string;          // new
  donationUrl?: string;          // new
};
```

**Logged-out CTA logic**:
```
campaignActive = true  → show "Doneer" (outline) + "Inloggen" (outline)
campaignActive = false → show "Start gratis" (ghost, primary-colored) + "Inloggen" (outline)
```

"Doneer" links to `CONSUMER_CAMPAIGN_CONFIG.donationUrl` with `target="_blank" rel="noopener"`.

The "Start gratis" ghost button (`variant="ghost"` with `className="text-[color:var(--primary)]"`) stays exactly as-is for non-campaign periods.

### 2. Update `Header.tsx`

Pass `campaignActive` and `donateLabel` and `donationUrl` down to `HeaderAuthActions`:

```tsx
import { isConsumerCampaignActive, getConsumerCampaignCopy, CONSUMER_CAMPAIGN_CONFIG } from "@/config/commercial";

// inside Header:
const campaignActive = isConsumerCampaignActive();
const campaign = getConsumerCampaignCopy(locale);
```

Pass to `HeaderAuthActions`:
```tsx
<HeaderAuthActions
  ...existing props...
  campaignActive={campaignActive}
  donateLabel={campaign.donateCta}
  donationUrl={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
/>
```

### 3. Update `HeaderMobileMenu.tsx`

Apply the same logic in the mobile menu drawer. Read the current file first. The mobile logged-out CTA section should mirror the desktop rule: during campaign, show Doneer instead of Start gratis.

### 4. Update `HeaderAuthActions.test.tsx`

Read the existing test file. Add two test cases:
- `renders donate link when campaign is active`
- `renders start gratis when campaign is not active`

## Constraints

- `Header.tsx` is a server component — `isConsumerCampaignActive()` can be called directly there
- `HeaderAuthActions.tsx` is a client component (`"use client"`) — do not add server-only imports
- All new props are optional with safe defaults (`campaignActive = false`) so existing usages without the prop continue to work
- No new analytics event names — the "Doneer" link in the nav can reuse or omit event tracking

## Completion Checklist

- [ ] Two "Start gratis" buttons no longer appear simultaneously in the header
- [ ] During campaign: nav shows "Doneer" (outline) + "Inloggen"
- [ ] Outside campaign: nav shows "Start gratis" (ghost) + "Inloggen"
- [ ] Mobile menu matches desktop behaviour
- [ ] `HeaderAuthActions.test.tsx` has the two new cases
- [ ] `npm run typecheck` passes
