# 05 — PDF Template: Bike Section

## Goal
Add a "Your bike" section that shows the bike photo, name, type, riding style, primary goal, questionnaire-derived riding context, and an AI-generated or generic model description — matching the information available on the Bike page.

## Data available (from `report.bike`)
- `name`: string
- `bikeType`: string
- `brand`: string | null
- `model`: string | null
- `ridingStyle`: string | null
- `goal`: string | null
- `description`: string | null — AI-generated bike description (may be null)
- `imageUrl`: string | null
- `questionnaire.experienceLevel`: string | null
- `questionnaire.weeklyHours`: string | null
- `questionnaire.rideLength`: string | null
- `questionnaire.positionPriority`: string | null
- `questionnaire.typeOfRiding`: string | null

## New CSS

```css
/* Bike section */
.bike-section {
  margin-bottom: 12px;
}
.bike-image-wrap {
  width: 100%;
  max-height: 200px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bike-image-wrap img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  display: block;
}
.bike-image-placeholder {
  padding: 32px;
  font-size: 48px;
  color: #bae6fd;
}

/* Bike meta row */
.bike-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.bike-meta-tile {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
}
.bike-meta-tile .label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 2px;
}
.bike-meta-tile .value {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

/* Riding context rows */
.riding-context {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.riding-context-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 11.5px;
}
.riding-context-row:last-child {
  border-bottom: none;
}
.riding-context-row .rc-label {
  color: #64748b;
}
.riding-context-row .rc-value {
  font-weight: 600;
  color: #0f172a;
}

/* Bike description */
.bike-description {
  font-size: 11.5px;
  color: #374151;
  line-height: 1.6;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 12px 14px;
}
```

## New HTML render function

```typescript
function renderBikeSection(bike: ReportBikeSection, copy: ReportV2Copy): string {
  // Photo or placeholder
  const imageHtml = bike.imageUrl
    ? `<div class="bike-image-wrap">
        <img src="${escapeHtml(bike.imageUrl)}" alt="${escapeHtml(bike.name)}" />
      </div>`
    : `<div class="bike-image-wrap">
        <div class="bike-image-placeholder">🚲</div>
      </div>`;

  // Meta tiles — only non-null values
  const metaTiles = [
    { label: copy.bike.bikeType,     value: bike.bikeType },
    { label: copy.bike.brand,        value: bike.brand },
    { label: copy.bike.model,        value: bike.model },
    { label: copy.bike.ridingStyle,  value: bike.ridingStyle },
    { label: copy.bike.goal,         value: bike.goal },
  ]
    .filter((t) => t.value)
    .map(
      (t) => `<div class="bike-meta-tile">
        <div class="label">${escapeHtml(t.label)}</div>
        <div class="value">${escapeHtml(t.value!)}</div>
      </div>`
    )
    .join("\n");

  // Riding context rows — only non-null values
  const contextRows = [
    { label: copy.bike.experienceLevel,  value: bike.questionnaire.experienceLevel },
    { label: copy.bike.weeklyHours,      value: bike.questionnaire.weeklyHours },
    { label: copy.bike.rideLength,       value: bike.questionnaire.rideLength },
    { label: copy.bike.positionPriority, value: bike.questionnaire.positionPriority },
    { label: copy.bike.typeOfRiding,     value: bike.questionnaire.typeOfRiding },
  ]
    .filter((r) => r.value)
    .map(
      (r) => `<div class="riding-context-row">
        <span class="rc-label">${escapeHtml(r.label)}</span>
        <span class="rc-value">${escapeHtml(r.value!)}</span>
      </div>`
    )
    .join("\n");

  const contextHtml = contextRows
    ? `<div class="riding-context">${contextRows}</div>`
    : "";

  // AI or generic description
  const descriptionHtml = bike.description
    ? `<div class="bike-description">${escapeHtml(bike.description)}</div>`
    : "";

  return `
    <h2 class="section-title">${escapeHtml(copy.sections.yourBike)}</h2>
    <div class="bike-section">
      <div class="rider-name" style="margin-bottom:10px">${escapeHtml(bike.name)}</div>
      ${imageHtml}
      <div class="bike-meta-grid">${metaTiles}</div>
      ${contextHtml}
      ${descriptionHtml}
    </div>
  `;
}
```

## Copy to add under `reportV2` messages

```typescript
sections: {
  // ...existing sections...
  yourBike: "Your bike",
},
bike: {
  bikeType: "Bike type",
  brand: "Brand",
  model: "Model",
  ridingStyle: "Riding style",
  goal: "Primary goal",
  experienceLevel: "Experience level",
  weeklyHours: "Weekly hours",
  rideLength: "Typical ride length",
  positionPriority: "Position priority",
  typeOfRiding: "Type of riding",
},
```

Same structure added to `nl.ts` in Dutch.

## Acceptance criteria
- Bike name shown as a title above the photo
- Photo displayed full-width (capped at 200 px height) if available; placeholder icon shown otherwise
- Bike type, brand, model, riding style, and goal shown as compact tiles (tiles hidden when null)
- Riding context rows (experience, hours, ride length, position priority, type of riding) shown as a key-value list; rows hidden when null
- AI description shown in a light-blue box if present; section omitted when null
- Section immediately precedes the existing fit sections
