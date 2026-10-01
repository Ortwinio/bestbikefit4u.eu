# 40e — Shared Dutch UI labels

Completed by Codex C. No commit or database write.

- Number-field steppers now say `Verhoog <label>` / `Verlaag <label>` in Dutch, with
  `Verhoog waarde` / `Verlaag waarde` when no field label is supplied.
- Dialog icon and footer close controls say `Sluiten`; AccessibleDialog says `Dialoog sluiten`
  in both browser and server-rendered branches.
- Locale uses the existing `useDashboardMessages` locale context through `useSharedUiMessages`.
  Shared copy stays in `src/i18n/account/sharedUi.ts`; English wording is unchanged.
- Both home comparison sources now say `Vergelijk Free en Pro`. The single change in the frozen
  `src/i18n/messages/nl.ts` was explicitly authorized by the lead for this task. No other root
  dictionary edits were made by C for40e. Concurrent edits in those files were preserved.
- Toast `Meldingen` was already handled in41a and remains covered by its existing tests.

Validation:28 focused tests pass; owned-file ESLint and full `npm run typecheck` pass.
Tests cover NL/EN labeled and fallback steppers, increment/decrement behavior, dialog icon/footer,
accessible dialog interaction and SSR, both home sources, unchanged English and existing wrappers.
`git diff --check` passes for owned changes. No visual/layout changes.

DONE 40e. Manifest: `files-40e.txt`. Next queued task:44b-C.
