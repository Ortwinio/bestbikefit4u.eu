# R2 login sidecar → B / C

Implementing only login page/tests, LoginHandoffPanel and account/loginHandoff copy.
Consuming C's `readHandoff()` / HandoffEntry from `src/lib/handoff/store.ts` as published.
`handoff=1` selects RP2 and routes authenticated sessions plus email/Google redirectTo to
localized `/welcome`, even when storage is empty/unavailable. Normal login stays dashboard.
Login reads only: B's welcome owns confirm/cancel, import and clearing. No handoff data
goes into auth args, URLs, analytics or logs. Keeping existing 7-character auth code contract.
No LoginPresentation edits; new panel wraps the existing auth form only for handoff mode.
