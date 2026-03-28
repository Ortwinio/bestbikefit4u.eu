# 04 — PDF Template: Physical Scores Sections

## Goal
Add three new sections after the Rider profile section: **Flexibility**, **Core Stability**, and **Comfort & Discomfort** — each with a visual indicator matching the style of the My Profile page cards.

## Data available (from `report.rider`)
- `flexibilityScore`: 1–5 (numeric) | null
- `flexibilityLabel`: string | null  — e.g. "Very Limited", "Average", "Excellent"
- `coreStabilityScore`: 1–5 | null
- `comfortScore`: 1–5 | null

The score-to-label/description mapping is embedded in the render functions below (mirrors `flexibilityTests`, `coreStabilityTests`, and `comfortLevels` in `src/lib/validations/profile.ts`).

## New CSS

```css
/* Physical score section */
.score-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 10px;
}

/* Score header row */
.score-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.score-label {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
.score-badge {
  font-size: 11px;
  font-weight: 600;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 10px;
  border-radius: 999px;
}

/* Flexibility: single progress bar */
.flex-bar-track {
  width: 100%;
  height: 10px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}
.flex-bar-fill {
  height: 100%;
  border-radius: 999px;
}

/* Core stability / comfort: segmented bar (5 segments) */
.segment-bar {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
}
.segment-bar .seg {
  flex: 1;
  height: 10px;
  border-radius: 999px;
}

/* Score description */
.score-description {
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
}
```

## Colour helper

Score colours mirror the app's danger/warning/success palette:

| Score | Colour |
|-------|--------|
| 1 | `#ef4444` (red) |
| 2 | `#f97316` (orange) |
| 3 | `#f97316` (orange) |
| 4 | `#22c55e` (green) |
| 5 | `#22c55e` (green) |

Flexibility uses a string score; map it to a number first:
```
very_limited → 1, limited → 2, average → 3, good → 4, excellent → 5
```

## New HTML render functions

```typescript
const SCORE_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f97316",
  4: "#22c55e",
  5: "#22c55e",
};

const FLEXIBILITY_META: Record<string, { numericScore: number; label: string; description: string }> = {
  very_limited: { numericScore: 1, label: "Very Limited", description: "Cannot reach knees when seated with legs straight" },
  limited:      { numericScore: 2, label: "Limited",      description: "Can reach mid-shin when seated" },
  average:      { numericScore: 3, label: "Average",      description: "Can reach ankles when seated" },
  good:         { numericScore: 4, label: "Good",         description: "Can reach toes when seated" },
  excellent:    { numericScore: 5, label: "Excellent",    description: "Can reach past toes when seated" },
};

const CORE_META: Record<number, { label: string; description: string }> = {
  1: { label: "Very Low",  description: "Plank hold less than 20 seconds" },
  2: { label: "Low",       description: "Plank hold 20–40 seconds" },
  3: { label: "Average",   description: "Plank hold 40–60 seconds" },
  4: { label: "Good",      description: "Plank hold 60–90 seconds" },
  5: { label: "Excellent", description: "Plank hold 90+ seconds with perfect form" },
};

const COMFORT_META: Record<number, { label: string; description: string }> = {
  1: { label: "Severe discomfort",    description: "Significant pain that limits or prevents riding" },
  2: { label: "Significant discomfort", description: "Recurring pain that affects your riding regularly" },
  3: { label: "Moderate discomfort",  description: "Noticeable discomfort on longer or harder rides" },
  4: { label: "Mild discomfort",      description: "Occasional minor discomfort, manageable" },
  5: { label: "Comfortable",          description: "No pain or discomfort while cycling" },
};

function renderProgressBar(score: number, maxScore = 5): string {
  const pct = (score / maxScore) * 100;
  const color = SCORE_COLORS[score] ?? "#64748b";
  return `<div class="flex-bar-track">
    <div class="flex-bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div>
  </div>`;
}

function renderSegmentBar(score: number): string {
  const color = SCORE_COLORS[score] ?? "#64748b";
  const segs = [1, 2, 3, 4, 5]
    .map(
      (i) =>
        `<div class="seg" style="background:${i <= score ? color : "#e2e8f0"}"></div>`
    )
    .join("");
  return `<div class="segment-bar">${segs}</div>`;
}

function renderFlexibilitySection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  if (!rider.flexibilityScore || !rider.flexibilityLabel) return "";
  const meta = FLEXIBILITY_META[
    Object.keys(FLEXIBILITY_META).find(
      (k) => FLEXIBILITY_META[k].numericScore === rider.flexibilityScore
    ) ?? "average"
  ] ?? FLEXIBILITY_META["average"];
  const score = rider.flexibilityScore;

  return `
    <h2 class="section-title">${escapeHtml(copy.sections.flexibility)}</h2>
    <div class="score-section">
      <div class="score-header">
        <span class="score-label">${escapeHtml(rider.flexibilityLabel)}</span>
        <span class="score-badge">${score}/5</span>
      </div>
      ${renderProgressBar(score)}
      <p class="score-description">${escapeHtml(meta.description)}</p>
    </div>
  `;
}

function renderCoreStabilitySection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  if (!rider.coreStabilityScore) return "";
  const score = Math.max(1, Math.min(5, rider.coreStabilityScore));
  const meta = CORE_META[score];

  return `
    <h2 class="section-title">${escapeHtml(copy.sections.coreStability)}</h2>
    <div class="score-section">
      <div class="score-header">
        <span class="score-label">${escapeHtml(meta.label)}</span>
        <span class="score-badge">${score}/5</span>
      </div>
      ${renderSegmentBar(score)}
      <p class="score-description">${escapeHtml(meta.description)}</p>
    </div>
  `;
}

function renderComfortSection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  if (!rider.comfortScore) return "";
  const score = Math.max(1, Math.min(5, rider.comfortScore));
  const meta = COMFORT_META[score];

  return `
    <h2 class="section-title">${escapeHtml(copy.sections.comfort)}</h2>
    <div class="score-section">
      <div class="score-header">
        <span class="score-label">${escapeHtml(meta.label)}</span>
        <span class="score-badge">${score}/5</span>
      </div>
      ${renderSegmentBar(score)}
      <p class="score-description">${escapeHtml(meta.description)}</p>
    </div>
    <p class="about-intro" style="margin-top:10px">${escapeHtml(copy.comfort.impactText)}</p>
  `;
}
```

## Copy to add under `reportV2` messages

```typescript
sections: {
  // ...existing sections...
  flexibility: "Flexibility",
  coreStability: "Core stability",
  comfort: "Comfort & discomfort",
},
comfort: {
  impactText: "Discomfort on a bike is rarely just a feeling — it is your body signalling misalignment. Knee pain, back pain, and numbness are among the most common reasons cyclists quit long rides early or skip training days. A correctly fitted bike transfers power efficiently and keeps your body in a position it can sustain for hours without pain.",
},
```

Same structure added to `nl.ts` in Dutch.

## Acceptance criteria
- Flexibility section shows label, numeric score badge (x/5), filled progress bar in the correct colour, and description text
- Core stability and comfort sections show label, score badge, 5-segment bar with filled segments in the correct colour, and description text
- All three sections are hidden (return empty string) when the score is null
- Colours: score 1 = red, 2–3 = orange, 4–5 = green
- Comfort section includes one paragraph of static copy about the impact of discomfort
