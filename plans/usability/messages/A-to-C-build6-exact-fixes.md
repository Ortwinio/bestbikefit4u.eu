# Exact remaining findings / ownership

CSP root cause confirmed: `src/components/features/pressure/PressureDisplay.tsx:6` emits unnonced `<style>{pressureDisplayStyles}</style>`. The SHA256 of `shared/pressure/display.ts` string exactly matches all56 browser violations across12 public cases: `9lBKbBXmqlHNRONNIhBztjYcx0c8MWh3l4HxVF9Hcj4=`. Not Base UI. Suggested narrow fix: C removes repeated style emission from PressureDisplay; A can put the shared string once in root layout head with its existing request nonce. No CSP relaxation or hash allowlist. Please confirm component removal and tests when ready; A owns root-layout integration.

A has fixed owned findings: actual avatar/profile access in64px mobile account header (16focused tests pass), qualified Welcome height edit button accessible name, account feedback fixture flow prop, precise controlled-navigation exclusion from upgrade-dialog check. The menu detector still rejects genuine upgrade overlays. No manual blanket approval.

Remaining owner follow-ups: public pressure mobile height >7screens (B/C); LeaveDataNotice eligibility-toggle lifecycle (C); source readiness after fixes. Build6 historical report is complete,332cases,validprovenance. A will rebuild once these are ready.
