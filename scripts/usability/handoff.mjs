const firstFields = {
  "saddle-height": "heightCm", "frame-size": "heightCm", "crank-length": "heightCm",
  "saddle-width": "heightCm", "bike-fit": "heightCm", "tire-pressure": "weightKg",
  gearing: "innerChainringTeeth", "climb-planner": "distanceKm", "power-speed": "powerWatts",
  "ftp-wkg": "twentyMinuteWatts", "fuel-hydration": "durationMinutes",
};
const strongerFields = { gearing: "gradientPercent", "climb-planner": "weightKg", "power-speed": "weightKg" };
const sliderSelector = 'input[type="range"], [role="slider"]';
const consumedFields = {
  "saddle-height": ["heightCm"], "frame-size": ["heightCm"], "crank-length": ["heightCm"],
  "saddle-width": ["heightCm"], "bike-fit": ["heightCm"], "tire-pressure": ["weightKg"],
  gearing: ["weightKg", "gradientPercent"], "climb-planner": ["weightKg", "gradientPercent"],
  "power-speed": ["weightKg"], "ftp-wkg": ["weightKg"], "fuel-hydration": [],
};

async function readEntry(page, field) {
  return page.evaluate(selected => {
    const raw = sessionStorage.getItem("bbf.handoff");
    const record = raw ? JSON.parse(raw) : null;
    return record?.version === 1 && Array.isArray(record.entries)
      ? record.entries.find(entry => entry.field === selected) ?? null : null;
  }, field);
}

function assertEntry(entry, field, calculator) {
  if (!entry || entry.field !== field || entry.calculator !== calculator
    || typeof entry.value !== "number" || !Number.isFinite(entry.value)
    || typeof entry.unit !== "string" || typeof entry.method !== "string"
    || !Number.isSafeInteger(entry.touchedAt) || entry.touchedAt <= 0) {
    throw new Error(`Missing actual user-edited ${calculator}.${field} handoff entry`);
  }
}

export async function verifyEditedHandoff(page, descriptor, next, locale, localizedPath) {
  const calculator = descriptor.calculator ?? descriptor.id;
  const destination = next?.calculator ?? next?.id;
  const firstField = firstFields[calculator];
  if (!firstField || !destination || !consumedFields[destination]) throw new Error("Unknown handoff route edge");
  const initial = await readEntry(page, firstField);
  assertEntry(initial, firstField, calculator);
  const field = strongerFields[calculator] ?? firstField;
  if (field !== firstField) {
    const slider = page.locator(`#${calculator}-${field}`).locator(sliderSelector);
    if (await slider.count() !== 1) throw new Error(`Missing source slider ${calculator}.${field}`);
    const before = Number(await slider.getAttribute("aria-valuenow") ?? await slider.inputValue());
    const maximum = Number(await slider.getAttribute("aria-valuemax") ?? await slider.getAttribute("max"));
    if (!Number.isFinite(before) || !Number.isFinite(maximum)) throw new Error("Source slider has no numeric range");
    await slider.focus();
    await slider.press(before < maximum ? "ArrowRight" : "ArrowLeft");
    await page.waitForFunction(({ selected, source, previous }) => {
      const entry = JSON.parse(sessionStorage.getItem("bbf.handoff") ?? "null")?.entries?.find(item => item.field === selected);
      return entry?.calculator === source && typeof entry.value === "number" && entry.value !== previous;
    }, { selected: field, source: calculator, previous: before }, { timeout: 5000 });
  }
  const expected = await readEntry(page, field);
  assertEntry(expected, field, calculator);
  const path = typeof localizedPath === "function" ? localizedPath(next, locale) : localizedPath;
  const sourceUrl = new URL(page.url());
  if (typeof path !== "string") throw new Error("Missing localized next path");
  const expectedUrl = new URL(path, sourceUrl);
  if (expectedUrl.origin !== sourceUrl.origin) throw new Error("Cross-origin next step rejected");
  const links = page.locator('[data-usability="next-step"] a[href]');
  let link;
  for (let index = 0; index < await links.count(); index += 1) {
    const candidate = links.nth(index);
    const href = await candidate.getAttribute("href");
    if (href && new URL(href, sourceUrl).href === expectedUrl.href) { link = candidate; break; }
  }
  if (!link) throw new Error(`No actual next-step link to ${expectedUrl.pathname}`);
  await link.click();
  await page.waitForURL(expectedUrl.href, { timeout: 10000 });
  await page.locator("h1").first().waitFor({ state: "visible", timeout: 10000 });
  const consumed = consumedFields[destination].includes(field);
  let displayed = null;
  let known = null;
  if (consumed) {
    const slider = field === "heightCm" ? page.getByRole("slider").first()
      : page.locator(`#${destination}-${field}`).locator(sliderSelector);
    await slider.waitFor({ state: "visible", timeout: 10000 });
    await page.waitForFunction(({ selected, value, selector }) => {
      const slider = selected === "heightCm" ? document.querySelector(selector)
        : document.querySelector(selected);
      return slider && Number(slider.getAttribute("aria-valuenow") ?? slider.value) === value;
    }, { selected: field === "heightCm" ? field : `#${destination}-${field} :is(${sliderSelector})`,
      value: expected.value, selector: sliderSelector }, { timeout: 5000 });
    displayed = Number(await slider.getAttribute("aria-valuenow") ?? await slider.inputValue());
    const strip = page.locator('[data-usability="known-values"]');
    await strip.waitFor({ state: "visible", timeout: 5000 });
    known = await strip.innerText();
    const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(expected.value);
    if (!known.includes(`${formatted} ${expected.unit}`)) throw new Error(`Known-values strip omits ${field} value/unit`);
  }
  const actual = await readEntry(page, field);
  const preserved = actual && Object.keys(expected).every(key => actual[key] === expected[key]);
  return { passed: Boolean(preserved && (!consumed || displayed === expected.value)), field,
    firstEditedField: firstField, expected, actual, displayed, known,
    mode: consumed ? "applied-input" : "retained-only", path: new URL(page.url()).pathname,
    source: calculator, destination };
}
