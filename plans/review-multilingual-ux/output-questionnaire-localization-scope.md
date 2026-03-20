# Output: Questionnaire Localization Scope Assessment

**Date**: 2026-03-18
**Status**: Assessment only — no implementation

---

## Current State

### Where question text comes from

Question text is defined entirely in **`convex/questionnaire/questions.ts`** as a static TypeScript array (`QUESTIONNAIRE_QUESTIONS`). This is a module-level constant — not database seed data, not a Convex table, and not dynamically fetched from any external source. Every field that a user reads (`questionText`, `helpText`, option `label` values, `scaleConfig.minLabel`/`maxLabel`) is hardcoded in English inside this file.

The Convex query `api.questionnaire.queries.getQuestions` (`convex/questionnaire/queries.ts`) simply calls `getAllQuestions()`, which returns the array as-is with no locale parameter.

The frontend page (`src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx`) calls `useQuery(api.questionnaire.queries.getQuestions)` with no arguments — no locale is passed to the backend, and no post-processing of question text occurs on the client before rendering.

### Does locale-variant data exist?

No. The `QuestionDefinition` interface has no locale/i18n fields. There is no `translations` map, no `questionText_nl` variant, and no concept of locale in the questionnaire data model.

### Scope of English-only content

All of the following are English-only:

- `questionText` — the main question prompt (15 questions)
- `helpText` — contextual hints shown below the prompt (4 questions)
- Option `label` — answer option text (~60 option labels across all questions)
- `scaleConfig.minLabel` / `maxLabel` — endpoints of scale questions (1 question)

---

## What Would Be Required to Localize

### 1. Extend the data model

The `QuestionDefinition` interface in `convex/questionnaire/questions.ts` must be extended to support locale variants. Two viable approaches exist:

**Option A — Locale map on text fields** (recommended): Replace `questionText: string` with `questionText: Record<string, string>` (e.g., `{ en: "...", nl: "..." }`). Same treatment for `helpText`, option `label`, and scale labels. The query resolves to the correct locale's string before returning, so the returned shape remains `string` to callers.

**Option B — Separate locale files**: Keep the current English array and add a `questions.nl.ts` that overrides text fields by `questionId`. The query merges them. More maintainable if the question set grows substantially.

### 2. Pass locale through the query

`api.questionnaire.queries.getQuestions` must accept a `locale` argument (e.g., `v.union(v.literal("en"), v.literal("nl"))`). The handler resolves locale-specific text before returning.

### 3. Update the frontend call site

`page.tsx` must pass the current locale to the query:
```ts
const questions = useQuery(api.questionnaire.queries.getQuestions, { locale });
```
`locale` is already available via `useDashboardMessages()`.

### 4. Translate all question content

Someone must write Dutch translations for:
- 15 question texts
- 4 help texts
- ~60 option labels
- 2 scale endpoint labels

This is the largest effort item and requires domain knowledge (cycling terminology in Dutch).

### 5. Update `QuestionDefinition` interface consumers

`convex/questionnaire/responseValidation.ts`, `convex/recommendations/inputMapping.ts`, and any test files that reference `QuestionDefinition` or construct mock questions must be audited for compatibility with the revised shape. The internal structural change (locale map → resolved string at the query boundary) should be transparent to consumers if Option A is implemented cleanly.

---

## Effort Estimate

**Medium** (estimated 1–2 days of engineering + translation time)

| Part | Effort |
|------|--------|
| Extend `QuestionDefinition` interface + locale map | ~1h |
| Add locale arg to `getQuestions` query | ~30min |
| Update frontend call site | ~15min |
| Update/fix consumers and tests | ~1–2h |
| Write Dutch translations (requires domain knowledge) | ~2–4h |
| QA (verify NL questionnaire renders correctly) | ~1h |

The code changes are straightforward. The bottleneck is producing accurate Dutch translations for cycling-specific terminology (e.g., "enduro", "time trials", "hot foot", "saddle area").

---

## Recommended Approach

1. **Adopt Option A** (locale map on text fields): add `questionText: Record<string, string>` internally, resolve to a plain `string` at the query boundary. This is consistent with how the rest of the app handles i18n (dictionary objects keyed by locale) and keeps the returned `QuestionDefinition` shape unchanged for the frontend.

2. **Keep questions as static TypeScript** — do not move them into a Convex database table. The question set is stable and small; a DB table would add unnecessary complexity and require a migration.

3. **Add a locale fallback**: if a locale key is missing, fall back to `"en"`. This prevents runtime errors if a new question is added before its translation is ready.

4. **Sequence**: implement the code changes first with English-only content (the `Record<"en", string>` shape), then fill in NL translations. This lets the structural change ship independently of the translation work.

5. **Do not localize `questionId`, `value`, or `showCondition` fields** — these are internal identifiers used for response storage and conditional logic, not user-visible text.

---

## Related Issues (from output-04-ux-flow-review.md)

- `NumericQuestion` inline validation messages may be hardcoded in English — needs a separate audit.
- No locale parameter is passed to `getNextQuestion` either; that query returns a full `QuestionDefinition` object whose text fields would also need locale resolution.
