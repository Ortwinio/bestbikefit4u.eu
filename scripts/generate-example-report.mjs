import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outPath = path.resolve("BestBikeFit4U_ExampleReport_EN_v2.pdf");

// Example data (based on your current report)
const data = {
  sessionId: "jh74v8r7ykqypbzx69d67abvqn8161hw",
  createdDate: "2026-02-15",
  bikeType: "Road",
  goal: "Performance",
  algorithmVersion: "2.0.0",
  confidence: 90,

  cleatOffset: 3,

  saddleHeight: 754,
  saddleHeightMin: 731,
  saddleHeightMax: 774,

  saddleSetback: 49,
  saddleSetbackMin: 39,
  saddleSetbackMax: 59,

  barDrop: 98,
  barDropMin: 85,
  barDropMax: 110,

  barReach: 538,
  barReachMin: 525,
  barReachMax: 555,

  stemLen: 100,
  stemAngle: -6,

  crankLen: 172.5,
  barWidth: 420,

  frameSize: "XL (59-62 cm equivalent)",
  frameStack: 626,
  effectiveTopTube: 588,
};

// IMPORTANT: replace these with your real asset paths or URLs
const assets = {
  logo: "file://" + path.resolve("assets/bestbikefit4u-logo.png"),
  hero: "file://" + path.resolve("assets/bbf4u_sample-hero.png"),
  iconCockpit: "file://" + path.resolve("assets/icon-cockpit.png"),
  iconSteps: "file://" + path.resolve("assets/icon-steps.png"),
  iconOrder: "file://" + path.resolve("assets/icon-order.png"),
  iconWarning: "file://" + path.resolve("assets/icon-warning.png"),
  measurement4panel: "file://" + path.resolve("assets/measurement-4panel.png"),
};

function tpl(s, m) {
  return s.replace(/\{\{(\w+)\}\}/g, (_, k) => (m[k] ?? ""));
}

// HTML template (trimmed to essentials; same structure as discussed)
const html = tpl(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>BestBikeFit4U - Fit Recommendation Report</title>
  <style>
    @page { size: A4; margin: 18mm 18mm 16mm 18mm; }
    body { font-family: Arial, sans-serif; color: #111827; font-size: 12px; line-height: 1.38; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #E5E7EB; padding-bottom:10px; }
    .logo { height: 26px; }
    .meta { color:#6B7280; font-size:11px; text-align:right; }
    h1 { font-size:22px; margin:16px 0 8px; color:#0B1E3B; }
    h2 { font-size:14px; margin:16px 0 8px; color:#0B1E3B; display:flex; gap:10px; align-items:center; }
    .icon { width:22px; height:22px; }
    .grid2 { display:grid; grid-template-columns: 1.35fr 0.65fr; gap:14px; align-items:start; }
    .cardRow { display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin:12px 0 14px; }
    .card { background:#0B1E3B; color:#fff; padding:12px; border-radius:10px; min-height:82px; }
    .card .k { font-size:11px; opacity:0.9; }
    .card .v { font-size:22px; font-weight:700; margin:6px 0; }
    .card .s { font-size:10px; opacity:0.9; }
    .callout { background:#EFF6FF; border:1px solid #60A5FA; border-radius:10px; padding:12px; }
    .warn { background:#FFF7ED; border:1px solid #FB923C; border-radius:10px; padding:12px; }
    table { width:100%; border-collapse:collapse; margin:8px 0 0; }
    th { background:#0B1E3B; color:#fff; text-align:left; padding:8px; font-size:11px; }
    td { border:1px solid #E5E7EB; padding:8px; vertical-align:top; }
    .muted { color:#6B7280; font-size:11px; }
    .imgRound { border-radius:12px; width:100%; }
    .pageBreak { page-break-before: always; }
  </style>
</head>
<body>

  <div class="header">
    <img class="logo" src="${assets.logo}" alt="BestBikeFit4U" />
    <div class="meta">
      Session: {{sessionId}}<br/>
      Created: {{createdDate}}<br/>
      Bike: {{bikeType}} • Goal: {{goal}}<br/>
      Algorithm: v{{algorithmVersion}} • Confidence: {{confidence}}%
    </div>
  </div>

  <h1>Fit Recommendation Report</h1>

  <div class="grid2">
    <div>
      <p>
        A good bike fit is not a luxury. It is a fast win: more comfort, fewer recurring pain patterns,
        and better control on longer rides.
      </p>
      <p>
        This report gives you clear, measurable setup targets. Small adjustments now can prevent
        compensations that otherwise become chronic discomfort.
      </p>
      <p class="muted">Best practice: apply one change at a time (2-5 mm), validate on easy rides, then continue.</p>
    </div>
    <img class="imgRound" src="${assets.hero}" alt="Hero" />
  </div>

  <div class="cardRow">
    <div class="card"><div class="k">Fit confidence</div><div class="v">{{confidence}}%</div><div class="s">based on completeness + plausibility</div></div>
    <div class="card"><div class="k">Saddle height</div><div class="v">{{saddleHeight}} mm</div><div class="s">range {{saddleHeightMin}}-{{saddleHeightMax}} mm</div></div>
    <div class="card"><div class="k">Handlebar drop</div><div class="v">{{barDrop}} mm</div><div class="s">range {{barDropMin}}-{{barDropMax}} mm</div></div>
  </div>

  <div class="callout">
    <b>Your 3 priority changes (start here)</b><br/>
    1) <b>Cleats:</b> {{cleatOffset}} mm behind ball of foot.<br/>
    2) <b>Saddle height:</b> {{saddleHeight}} mm ({{saddleHeightMin}}-{{saddleHeightMax}}).<br/>
    3) <b>Saddle setback:</b> {{saddleSetback}} mm behind BB ({{saddleSetbackMin}}-{{saddleSetbackMax}}).
  </div>

  <h2><img class="icon" src="${assets.iconCockpit}" alt=""/>Core fit targets</h2>
  <table>
    <thead><tr><th>Parameter</th><th>Target</th><th>Range</th><th>Why it matters</th></tr></thead>
    <tbody>
      <tr><td>Saddle height</td><td>{{saddleHeight}} mm</td><td>{{saddleHeightMin}}-{{saddleHeightMax}}</td><td>Knee stress + timing</td></tr>
      <tr><td>Saddle setback</td><td>{{saddleSetback}} mm</td><td>{{saddleSetbackMin}}-{{saddleSetbackMax}}</td><td>Hip stability + knee tracking</td></tr>
      <tr><td>Handlebar drop</td><td>{{barDrop}} mm</td><td>{{barDropMin}}-{{barDropMax}}</td><td>Aero vs neck/lumbar load</td></tr>
      <tr><td>Handlebar reach</td><td>{{barReach}} mm</td><td>{{barReachMin}}-{{barReachMax}}</td><td>Shoulder posture + hand pressure</td></tr>
      <tr><td>Stem</td><td>{{stemLen}} mm @ {{stemAngle}}°</td><td>90-110 / -6° to +6°</td><td>Fine tune after saddle</td></tr>
      <tr><td>Crank length</td><td>{{crankLen}} mm</td><td>170-172.5</td><td>Hip closure + knee load</td></tr>
      <tr><td>Handlebar width</td><td>{{barWidth}} mm</td><td>400-440</td><td>Breathing + shoulder comfort</td></tr>
      <tr><td>Frame guidance</td><td>{{frameSize}}</td><td>-</td><td>Compare brands via stack/reach</td></tr>
    </tbody>
  </table>

  <div class="pageBreak"></div>

  <h1>Implementation plan</h1>

  <h2><img class="icon" src="${assets.iconSteps}" alt=""/>14-day progressive plan</h2>
  <table>
    <thead><tr><th>Days</th><th>What to do</th><th>What to track</th></tr></thead>
    <tbody>
      <tr><td>1-3</td><td>Cleats only</td><td>Pain (0-10), hotspots, knee tracking</td></tr>
      <tr><td>4-7</td><td>Saddle height</td><td>Knee feel, saddle pressure</td></tr>
      <tr><td>8-14</td><td>Setback + cockpit</td><td>Hip stability, long ride comfort</td></tr>
    </tbody>
  </table>

  <h2><img class="icon" src="${assets.iconWarning}" alt=""/>If you feel this -> try this</h2>
  <div class="warn">
    • <b>Front knee pain:</b> raise saddle 3-5 mm.<br/>
    • <b>Back-of-knee tightness:</b> lower saddle 3-5 mm.<br/>
    • <b>Hand numbness / neck strain:</b> raise bars 10 mm or shorten reach ~10 mm.
  </div>

  <div class="pageBreak"></div>

  <h1>Measurement guide</h1>
  <p class="muted">Use consistent reference points. See definitions below.</p>
  <img class="imgRound" src="${assets.measurement4panel}" alt="Measurement guide" />

  <h2>Definitions</h2>
  <table>
    <thead><tr><th>Metric</th><th>How to measure</th><th>Tools</th></tr></thead>
    <tbody>
      <tr><td>Saddle height</td><td>BB center -> top of saddle along seat tube axis</td><td>Tape, level</td></tr>
      <tr><td>Saddle setback</td><td>BB vertical line -> saddle nose (horizontal)</td><td>Plumb line</td></tr>
      <tr><td>Bar drop</td><td>Saddle top minus bar reference point (tops or hoods)</td><td>Tape</td></tr>
      <tr><td>Bar reach</td><td>BB -> bar center (horizontal)</td><td>Tape</td></tr>
    </tbody>
  </table>

  <p class="muted">
    Safety: This report is guidance, not medical advice. Apply changes in 2-5 mm steps.
    Stop and consult a qualified fitter or clinician if pain persists.
  </p>

</body>
</html>`, data);

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", right: "18mm", bottom: "16mm", left: "18mm" },
  });
  await browser.close();
  await fs.writeFile(outPath, pdf);
  console.log("Saved:", outPath);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
