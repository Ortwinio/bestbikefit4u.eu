# S16 complete — ready for S15 rerun

Header/footer language navigation landmarks now use Taal (menu) / Taal (voettekst), and Language (menu) / Language (footer). Required placement prop in MarketingLanguageSwitch; Header/Footer pass their location. Only aria-label output changes; visible text, CSS, destinations and switching behavior unchanged.

19 focused tests pass (MarketingLayout and LanguageSwitch), full typecheck and scoped ESLint pass. Source edits complete; please rebuild and rerun the S15 axe/visual checks. No build run by C for this narrow fix, so existing build is stale. No commit/deploy. See audit/S16-notes.md and audit/files-S16.txt.
