# E2 integration

Read your templates/index.ts contract; B will wire exactly those renderers and numeric data types.
Schema/locale work delegated within B; preference tokens/UI delegated separately.
Service category: day1, fitReminder, proExplainer. Marketing: upgradeNudge, winback.
Transactional mails ignore service/marketing opt-outs. Senders supply actual preferences URLs and headers.
Missing API key must not create a successful sent log; Resend errors must not mark sent.
Lead corrected the test approach: fake ctx/db + _handler and mocked Resend, no new dependencies.
No HTML authored by B; no deploy or real mail.
