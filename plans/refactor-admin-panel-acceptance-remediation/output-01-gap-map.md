# Admin Route Gap Map

Status legend:
- `live`: route primarily renders from Convex-backed data and real mutations/actions
- `partially_live`: route has some live data or writes, but still depends on fixture props or incomplete contracts
- `fixture_driven`: route primarily renders local arrays/contracts/static view models
- `shell_only`: route exists mostly as routing/auth chrome with little domain completion

## Route Matrix

| Route | Status | Current source of truth | Current writes | Auth boundary | UI state support | Acceptance gap |
| --- | --- | --- | --- | --- | --- | --- |
| `/admin` | `live` | redirect only | none | protected layout | n/a | none |
| `/admin/login` | `partially_live` | auth session + client magic-code form | shared auth sign-in | public page, now server-redirects admin and non-admin sessions away | success/error in form | still uses shared rider auth provider rather than isolated admin-specific provider |
| `/admin/overview` | `partially_live` | fixture KPIs from `src/components/admin/fit/data.ts` | none | protected layout, any-admin + role map | basic shell state only | replace with `convex/admin/queries.getOverviewStats` |
| `/admin/users` | `fixture_driven` | `src/components/admin/users/admin-users-data.ts` | placeholder dialogs only | protected layout, role-mapped | empty/filter UI present | replace with `listUsers` pagination/search |
| `/admin/users/[userId]` | `fixture_driven` | `src/components/admin/users/admin-users-data.ts` | placeholder quick actions | protected layout, role-mapped | tabs present, no live pending/error handling | replace with `getUserDetail`, live mutations/actions |
| `/admin/organizations` | `fixture_driven` | `src/components/admin/organizations/admin-organizations-data.ts` | none | protected layout, role-mapped | basic empty state only | replace with `listOrganizations` |
| `/admin/organizations/[orgId]` | `fixture_driven` | `src/components/admin/organizations/admin-organizations-data.ts` | placeholder membership/org actions | protected layout, role-mapped | no live loading/error states | replace with `getOrganizationDetail`, `listOrgMembers`, member mutations |
| `/admin/rider-data` | `fixture_driven` | `src/components/admin/contracts.ts` | none | protected layout, role-mapped | basic empty messaging | needs live rider review queue query |
| `/admin/rider-data/[userId]` | `fixture_driven` | `src/components/admin/contracts.ts` | placeholder moderation notes | protected layout, role-mapped | contract messaging only | needs live rider detail + moderation writes |
| `/admin/bikes` | `fixture_driven` | `src/components/admin/contracts.ts` | none | protected layout, role-mapped | basic filters only | replace with live bike list query |
| `/admin/bikes/[bikeId]` | `fixture_driven` | `src/components/admin/contracts.ts` | geometry-link is preview only | protected layout, role-mapped | no live mutation feedback | replace with `getAdminBikeDetail`, `linkBikeToGeometry` |
| `/admin/geometry` | `fixture_driven` | `src/components/admin/contracts.ts` | none | protected layout, role-mapped | basic cards only | live counts/list summaries missing |
| `/admin/geometry/brands` | `fixture_driven` | `src/components/admin/contracts.ts` | none | protected layout, role-mapped | minimal empty state | replace with `listGeometryBrands` |
| `/admin/geometry/brands/[brandId]` | `fixture_driven` | `src/components/admin/contracts.ts` | placeholder create/edit flows | protected layout, role-mapped | limited empty state | replace with live brand/model queries |
| `/admin/geometry/brands/[brandId]/models/[modelId]` | `fixture_driven` | `src/components/admin/contracts.ts` | placeholder record creation/versioning | protected layout, role-mapped | contract-only dialogs | replace with live model/record queries and mutations |
| `/admin/geometry/[recordId]` | `fixture_driven` | `src/components/admin/contracts.ts` | placeholder approve/reject/version actions | protected layout, role-mapped | no live error/reason handling | replace with `getGeometryRecordDetail`, approval/version writes |
| `/admin/geometry/import` | `fixture_driven` | local preview UI | preview-only CSV action concept | protected layout, role-mapped | validation copy only | real import job/action missing |
| `/admin/fit-engine` | `fixture_driven` | `src/components/admin/fit/data.ts` | none | protected layout, role-mapped | basic filters | replace with `listEngineVersions` |
| `/admin/fit-engine/[versionId]` | `fixture_driven` | `src/components/admin/fit/data.ts` | placeholder status actions | protected layout, role-mapped | no live pending/error states | replace with `getEngineVersionDetail`, status mutations |
| `/admin/fit-runs` | `fixture_driven` | `src/components/admin/fit/data.ts` | none | protected layout, role-mapped | basic filter UI | replace with `listFitRuns` |
| `/admin/fit-runs/[sessionId]` | `fixture_driven` | `src/components/admin/fit/data.ts` | placeholder review flow | protected layout, role-mapped | trace contract only | replace with `getFitRunTrace`, review mutations |
| `/admin/releases` | `fixture_driven` | `src/components/admin/releases/data.ts` | none | protected layout, role-mapped | basic filters | replace with `listReleases` |
| `/admin/releases/[releaseId]` | `fixture_driven` | `src/components/admin/releases/data.ts` | placeholder status controls | protected layout, role-mapped | live linking/status feedback missing | replace with `getReleaseDetail`, status writes |
| `/admin/releases/calendar` | `fixture_driven` | `src/components/admin/releases/data.ts` | none | protected layout, role-mapped | calendar only | replace with live release calendar projection |
| `/admin/licenses` | `fixture_driven` | inline arrays in `BillingViews.tsx` | placeholder dialogs | protected layout, role-mapped | no live loading/error states | billing/plan backend incomplete |
| `/admin/licenses/plans/new` | `fixture_driven` | inline arrays in `BillingViews.tsx` | shell-only create plan flow | protected layout, role-mapped | basic form only | plan CRUD backend missing |
| `/admin/licenses/plans/[planId]/edit` | `fixture_driven` | inline arrays in `BillingViews.tsx` | shell-only edit plan flow | protected layout, role-mapped | basic form only | plan CRUD backend missing |
| `/admin/subscriptions` | `fixture_driven` | inline arrays in `BillingViews.tsx` | shell-only subscription actions | protected layout, role-mapped | filter UI only | subscription backend missing |
| `/admin/subscriptions/events` | `fixture_driven` | inline arrays in `BillingViews.tsx` | none | protected layout, role-mapped | table only | billing event backend missing |
| `/admin/feedback` | `fixture_driven` | inline arrays in `FeedbackViews.tsx` | placeholder triage actions | protected layout, role-mapped | partial | replace with `listFeedbackItems` |
| `/admin/feedback/[itemId]` | `fixture_driven` | inline arrays in `FeedbackViews.tsx` | placeholder comment/assignment/linking | protected layout, role-mapped | partial | replace with `getFeedbackDetail`, real mutations |
| `/admin/feedback/feature-requests` | `fixture_driven` | inline arrays in `FeedbackViews.tsx` | none | protected layout, role-mapped | partial | replace with filtered feedback query |
| `/admin/messages` | `fixture_driven` | inline arrays in `MessageViews.tsx` | placeholder targeting/status | protected layout, role-mapped | partial | replace with `listDashboardMessages` |
| `/admin/messages/new` | `fixture_driven` | inline arrays in `MessageViews.tsx` | form shell over planned contract | protected layout, role-mapped | basic form errors only | wire create/publish/pause lifecycle |
| `/admin/messages/[messageId]` | `fixture_driven` | inline arrays in `MessageViews.tsx` | placeholder publish actions | protected layout, role-mapped | partial | replace with `getDashboardMessageDetail` |
| `/admin/messages/[messageId]/edit` | `fixture_driven` | inline arrays in `MessageViews.tsx` | shell-only update flow | protected layout, role-mapped | partial | update/pause/expire backend missing |
| `/admin/audit` | `fixture_driven` | inline rows in `AuditLogPage.tsx` | export shell only | protected layout, any-admin | filters/details UI present | replace with `listAuditLogs`, export action |
| `/admin/settings` | `fixture_driven` | inline arrays in `SettingsViews.tsx` | feature flag/settings shells | protected layout, ops/super only | partial | replace with live flags/GDPR/system queries/mutations |

## Fixture Sources To Eliminate

- `src/components/admin/contracts.ts`
- `src/components/admin/fit/data.ts`
- `src/components/admin/releases/data.ts`
- `src/components/admin/users/admin-users-data.ts`
- `src/components/admin/organizations/admin-organizations-data.ts`
- inline arrays in:
  - `src/components/admin/billing/BillingViews.tsx`
  - `src/components/admin/feedback/FeedbackViews.tsx`
  - `src/components/admin/messages/MessageViews.tsx`
  - `src/components/admin/settings/SettingsViews.tsx`
  - `src/components/admin/audit/AuditLogPage.tsx`

## Contract Replacement Map

- Overview: `convex/admin/queries.getOverviewStats`
- Users: `listUsers`, `getUserDetail`, `changeUserTier`, `suspendUser`, `restoreUser`, `setAdminRole`, `createDashboardMessage`, `startImpersonation`
- Organizations: `listOrganizations`, `getOrganizationDetail`, `listOrgMembers`, `createOrganization`, `updateOrganization`, `suspendOrganization`, `addOrgMember`, `removeOrgMember`
- Rider data: missing queue query, extend `getAdminRiderData`, add moderation writes
- Bikes: `listAllBikes`, `getAdminBikeDetail`, `linkBikeToGeometry`
- Geometry: `listGeometryBrands`, `listGeometryModels`, `listGeometryRecords`, `getGeometryRecordDetail`, `createGeometryBrand`, `createGeometryModel`, `createGeometryRecord`, `approveGeometryRecord`, `rejectGeometryRecord`, import action needs completion
- Fit engine/runs: `listEngineVersions`, `getEngineVersionDetail`, `listFitRuns`, `getFitRunTrace`, `reviewFitRun`, `createEngineVersion`, `updateEngineVersionStatus`
- Releases: `listReleases`, `getReleaseDetail`, `createRelease`, `updateReleaseStatus`, `linkFeedbackToRelease`, `notifyRelease` needs completion
- Billing: missing `listPlans`, `getPlanDetail`, `listSubscriptions`, `getSubscriptionDetail`, `listBillingEvents`, plan CRUD, subscription lifecycle
- Feedback: `listFeedbackItems`, `getFeedbackDetail`, `updateFeedbackItem`, `addFeedbackComment`
- Messages: `listDashboardMessages`, `getDashboardMessageDetail`, `createDashboardMessage`, `publishDashboardMessage`; update/pause/expire/delete still missing
- Audit/settings: `listAuditLogs`, `exportAuditLogsCsv`, `getFeatureFlags`, `setFeatureFlag`, GDPR/system queries still incomplete

## Data-Access Gaps

- Route props are still shaped around fixture-specific records in several slices, especially users, organizations, fit, releases, billing, messages, and settings.
- Most pages mix server rendering with client fixture state instead of a consistent `server query -> view model -> client action panel` pattern.
- Mutation success/error/audit feedback is not standardized across admin domains.
