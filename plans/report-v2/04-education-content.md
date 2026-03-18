# Step 04 — Education Content

## Objective

Write the "why it matters" and adjustment guidance copy for every fit parameter in both English and Dutch, and add a brief "why bike fitting matters" intro. Replace the placeholder strings from Step 03 with final, rider-friendly copy.

## Background

Read:
- `plans/report-v2/bestbikefit4u_v2_report_and_migration_plan (1).docx.md` — Part A section 2 (priority summary) and section 3 (detailed fit table) for reference content and tone
- `src/i18n/messages/en.ts` — the `results` namespace added in Step 03

## Content to Write

### 1. "Why Bike Fitting Matters" intro (short version for report header)

Two sentences max. Used in: in-app results page intro banner and PDF cover section.

**EN example:**
> A correct bike fit reduces injury risk, improves power transfer, and makes long rides comfortable. These recommendations are based on your body measurements and riding goals.

Provide EN and NL versions.

### 2. Per-parameter "Why it matters" (one sentence each)

For each parameter below, write:
- `whyItMatters`: one sentence, rider-facing, explains the functional impact
- `riderValidationCue`: what the rider should feel or observe when the setting is correct
- `feelDescription`: 1–2 sentences describing the physical sensation of a correct setting
- `watchOuts`: too high / too low consequences (can be two short bullets)
- `methodLabel`: name of the fitting method or reference used

Parameters:
| Parameter key | EN name |
|--------------|---------|
| `cleatPosition` | Cleat position |
| `saddleHeight` | Saddle height |
| `saddleSetback` | Saddle setback |
| `handlebarDrop` | Handlebar drop |
| `handlebarReach` | Handlebar reach |
| `stem` | Stem |
| `crankLength` | Crank length |
| `handlebarWidth` | Handlebar width |

### 3. Method labels

| Parameter | Method label |
|-----------|-------------|
| `saddleHeight` | LeMond baseline + Holmes validation band |
| `saddleSetback` | KOPS-informed starting point + stability correction |
| `handlebarDrop` | Terrain/goal correction for riding style |
| `handlebarReach` | Stack/reach and contact-point model |
| `stem` | Fine-tuned after saddle is locked |
| `crankLength` | Standard proportional baseline |
| `handlebarWidth` | Shoulder-width alignment |

Translate method labels to NL.

### 4. Adjustment sequence explanations

For each adjustment step in the sequence:
- `measurementReference`: exact physical reference point for measuring this parameter
- `sequenceNote`: why this step comes before the next one

### 5. 14-day validation plan copy

Translate the 14-day plan table from the spec into structured i18n keys:
- 4 day blocks: days 1–3, 4–7, 8–10, 11–14
- For each: `dayBlock`, `change`, `rideDuration`, `whatToScore`

## Implementation

Add all copy to `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts` under the `results` namespace established in Step 03. Structure:

```
results.education.intro
results.education.whyFittingMatters
results.parameters.[paramKey].whyItMatters
results.parameters.[paramKey].riderValidationCue
results.parameters.[paramKey].feelDescription
results.parameters.[paramKey].watchOutHigh
results.parameters.[paramKey].watchOutLow
results.parameters.[paramKey].methodLabel
results.adjustmentSequence.[paramKey].measurementReference
results.adjustmentSequence.[paramKey].sequenceNote
results.validationPlan.day[1-4].dayBlock
results.validationPlan.day[1-4].change
results.validationPlan.day[1-4].rideDuration
results.validationPlan.day[1-4].whatToScore
```

## Quality

- NL copy must use cycling-specific Dutch terminology (not literal translations)
- Run `npm run test:i18n` to verify EN/NL key parity after adding all strings
- If Dutch cycling terminology is uncertain, note it in the output document instead of leaving code comments in the translation dictionaries

## Output

Write `output-04-education-content.md`:
- Final EN/NL copy for all parameters
- Any terminology notes or uncertainties flagged
- `npm run test:i18n` result
