# 02 — PDF Template: Cover Header and About Section

## Goal
Add a branded cover header and an "About Bestbikefit4u" section as the first two visible elements of the PDF, replacing the current plain `<h1>` title.

## Changes — `src/lib/reports/pdfLayoutTemplate.ts`

### New CSS to add to `<style>`

```css
/* Brand colours */
:root {
  --brand: #0ea5e9;
  --brand-dark: #0369a1;
  --brand-light: #e0f2fe;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --muted-bg: #f8fafc;
  --border: #e2e8f0;
}

/* Cover header */
.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 3px solid #0ea5e9;
  margin-bottom: 20px;
}
.report-header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.report-header-logo svg { width: 32px; height: 32px; }
.report-header-title {
  font-size: 20px;
  font-weight: 700;
  color: #0369a1;
  letter-spacing: -0.02em;
}
.report-header-meta {
  text-align: right;
  font-size: 11px;
  color: #64748b;
}

/* Section headers */
h2.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0369a1;
  border-left: 4px solid #0ea5e9;
  padding-left: 10px;
  margin: 28px 0 12px;
}

/* About section */
.about-intro {
  font-size: 12px;
  color: #374151;
  margin-bottom: 12px;
  line-height: 1.6;
}
.about-bullets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.about-bullets li {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 11.5px;
  color: #0c4a6e;
  line-height: 1.5;
}
.about-bullets li::before {
  content: "✓ ";
  color: #0ea5e9;
  font-weight: 700;
}
```

### New HTML to replace the current `<h1>` / `<p class="muted">` opening

```html
<!-- Cover header -->
<div class="report-header">
  <div class="report-header-logo">
    <!-- Inline SVG bike-fit icon -->
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="22" r="5" stroke="#0ea5e9" stroke-width="2"/>
      <circle cx="24" cy="22" r="5" stroke="#0ea5e9" stroke-width="2"/>
      <path d="M8 22 L14 10 L20 14 L24 22" stroke="#0369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="8" r="2" fill="#0ea5e9"/>
    </svg>
    <span class="report-header-title">Bestbikefit4u</span>
  </div>
  <div class="report-header-meta">
    <div style="font-weight:600;color:#0369a1">${escapeHtml(copy.introTitle)}</div>
    <div>${escapeHtml(reportDate)}</div>
  </div>
</div>

<!-- Section 1: About -->
<h2 class="section-title">${escapeHtml(copy.sections.about)}</h2>
<p class="about-intro">${escapeHtml(copy.about.intro)}</p>
<ul class="about-bullets">
  ${copy.about.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n")}
</ul>
```

### New copy to add to `src/i18n/messages/en.ts` under `dashboard.results.reportV2`

```typescript
about: {
  intro: "A professional bike fit is one of the highest-impact investments you can make as a cyclist. Small misalignments between your body and your bike compound over thousands of pedal strokes, causing discomfort, injury, and lost power. Bestbikefit4u uses your body measurements, riding goals, and physical profile to calculate a personalised setup — grounded in established biomechanical methods.",
  bullets: [
    "Reduces knee, back, and neck pain caused by poor position",
    "Improves pedalling efficiency and power transfer",
    "Optimises comfort on long rides and extended efforts",
    "Matches your saddle height precisely to your inseam and flexibility",
    "Tailors reach and handlebar drop to your riding style and goals",
    "Provides a step-by-step adjustment sequence to reach your target",
  ],
},
sections: {
  ...existing sections,
  about: "About Bestbikefit4u",
},
```

Same structure added to `nl.ts` in Dutch.

### Update `renderPdfReportHtml` signature

```typescript
export function renderPdfReportHtml(params: {
  report: ReportV2Payload;
  copy: ReportV2Copy;
}): string {
  const { report, copy } = params;
  const reportDate = new Date(report.reportDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  // ...
}
```

## Acceptance criteria
- PDF opens with a horizontal header: bike icon + "Bestbikefit4u" wordmark on the left, report title + date on the right, separated by a blue bottom border
- First content section is "About Bestbikefit4u" with intro paragraph and 6 bullet points in a 2-column grid
- Bullet points have a light-blue background with a ✓ prefix
- All existing sections follow unchanged
