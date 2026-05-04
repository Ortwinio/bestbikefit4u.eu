# Prompt 05 — Fix placeholder copy in DifferentiatorTriple

## Context

`src/components/home/homeRedesignContent.ts` contains the `HOME_DIFFERENTIATORS` content. The `description` field under both locales reads like internal notes, not product copy:

- NL: `"De homepage moet snel laten zien waar het platform sterk in is: data, volgorde en rijdergerichte begeleiding."`
- EN: `"The homepage should quickly show where the platform is strong: data, sequence, and rider-specific guidance."`

This text describes what the section should do, rather than being useful to the reader. It renders visibly on the live page below the section title.

## Task

In `src/components/home/homeRedesignContent.ts`, update the `description` field of `HOME_DIFFERENTIATORS` for both locales:

**NL:**
```
"Drie principes die elke fitbeslissing concreter en betrouwbaarder maken dan schatten of opnieuw beginnen."
```

**EN:**
```
"Three principles that make every fit decision more concrete and reliable than guessing or starting from scratch."
```

These stay focused on the rider benefit, match the title tone ("Less guesswork. Better next steps."), and do not reference internal page design intent.

## Verification

- DifferentiatorTriple section description no longer contains "De homepage moet" or "The homepage should".
- `npx tsc --noEmit` passes.
