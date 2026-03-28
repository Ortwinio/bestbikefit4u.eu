# 03 — PDF Template: Rider Profile Section

## Goal
Add a "Rider profile" section that shows the rider's name, profile photo (if available), body measurements, and a colour-coded BMI bar — mirroring the body measurement card on the My Profile page.

## Data available (from `report.rider`)
- `name`: string | null
- `heightCm`, `weightKg`, `inseamCm`, `armLengthCm`, `torsoLengthCm`, `shoulderWidthCm`: number | null
- `bmi`: number | null
- `bmiCategory`: "underweight" | "normal" | "overweight" | "obese" | null

## New CSS

```css
/* Rider section layout */
.rider-section {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 16px;
  align-items: start;
  margin-bottom: 12px;
}
.rider-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #bae6fd;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.rider-name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}
.rider-subtitle {
  font-size: 11px;
  color: #64748b;
}

/* Measurements grid */
.measurements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.measurement-tile {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
}
.measurement-tile .label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}
.measurement-tile .value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 2px;
}
.measurement-tile .unit {
  font-size: 11px;
  color: #64748b;
  font-weight: 400;
}

/* BMI bar */
.bmi-bar-wrap {
  margin-top: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
}
.bmi-bar-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
}
.bmi-bar-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(to right, #60a5fa 0%, #4ade80 30%, #facc15 60%, #f87171 100%);
  position: relative;
}
.bmi-marker {
  position: absolute;
  top: -3px;
  width: 4px;
  height: 16px;
  background: #0f172a;
  border-radius: 2px;
  transform: translateX(-50%);
}
.bmi-value-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.bmi-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}
.bmi-category {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}
.bmi-category.normal { background: #dcfce7; color: #15803d; }
.bmi-category.underweight { background: #dbeafe; color: #1d4ed8; }
.bmi-category.overweight { background: #fef9c3; color: #a16207; }
.bmi-category.obese { background: #fee2e2; color: #b91c1c; }
```

## New HTML render function

```typescript
function renderRiderSection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  // BMI bar: scale 15–40, marker position as percentage
  const BMI_MIN = 15;
  const BMI_MAX = 40;
  const bmiPercent = rider.bmi
    ? Math.max(0, Math.min(100, ((rider.bmi - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100))
    : null;

  const bmiHtml = rider.bmi && bmiPercent !== null
    ? `<div class="bmi-bar-wrap">
        <div class="bmi-bar-label-row">
          <span>BMI</span>
          <span>${escapeHtml(copy.rider.bmiCategories[rider.bmiCategory ?? "normal"])}</span>
        </div>
        <div class="bmi-bar-track">
          <div class="bmi-marker" style="left:${bmiPercent.toFixed(1)}%"></div>
        </div>
        <div class="bmi-value-row">
          <span class="bmi-value">${rider.bmi.toFixed(1)}</span>
          <span class="bmi-category ${rider.bmiCategory ?? 'normal'}">
            ${escapeHtml(copy.rider.bmiCategories[rider.bmiCategory ?? "normal"])}
          </span>
        </div>
      </div>`
    : "";

  const measurements = [
    { label: copy.rider.height, value: rider.heightCm, unit: "cm" },
    { label: copy.rider.weight, value: rider.weightKg, unit: "kg" },
    { label: copy.rider.inseam, value: rider.inseamCm, unit: "cm" },
    { label: copy.rider.armLength, value: rider.armLengthCm, unit: "cm" },
    { label: copy.rider.torsoLength, value: rider.torsoLengthCm, unit: "cm" },
    { label: copy.rider.shoulderWidth, value: rider.shoulderWidthCm, unit: "cm" },
  ].filter((m) => m.value !== null);

  const tilesHtml = measurements
    .map(
      (m) => `<div class="measurement-tile">
        <div class="label">${escapeHtml(m.label)}</div>
        <div class="value">${m.value} <span class="unit">${m.unit}</span></div>
      </div>`
    )
    .join("\n");

  return `
    <div class="rider-section">
      <div class="rider-avatar">🚴</div>
      <div>
        <div class="rider-name">${escapeHtml(rider.name ?? copy.rider.anonymousRider)}</div>
        <div class="rider-subtitle">${escapeHtml(copy.rider.subtitle)}</div>
      </div>
    </div>
    <div class="measurements-grid">${tilesHtml}</div>
    ${bmiHtml}
  `;
}
```

## Copy to add under `reportV2` messages

```typescript
rider: {
  subtitle: "Rider measurements",
  anonymousRider: "Rider",
  height: "Height",
  weight: "Weight",
  inseam: "Inseam",
  armLength: "Arm length",
  torsoLength: "Torso length",
  shoulderWidth: "Shoulder width",
  bmiCategories: {
    underweight: "Underweight",
    normal: "Healthy weight",
    overweight: "Overweight",
    obese: "Obese",
  },
},
```

## Acceptance criteria
- Rider name is shown (or "Rider" if no name)
- Body measurements shown in a 3-column tile grid; tiles not shown when value is null
- BMI bar rendered as a gradient track with a dark marker at the correct position
- BMI category badge uses colour coding: green = normal, yellow = overweight, red = obese, blue = underweight
- Section only shows measurements that are present; no "null" text shown
