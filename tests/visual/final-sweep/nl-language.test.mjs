import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeDutchText } from "./nl-language.mjs";

test("Dutch detector catches untranslated UI and English embedded in Dutch copy", () => {
  for (const text of [
    "Save", "Your bikes", "No results found", "Create new bike", "Required", "Select your bike",
    "Je fiets is saved", "Choose je fiets", "Bike measurements", "Please fill out this field.",
    "Exercise and Fluid Replacement", "Upload failed", "Body measurements", "View details",
    "Settings", "Profile", "Report", "Billing", "Notifications",
    "Toggle theme", "Toggle sidebar", "Increase", "Decrease", "Breadcrumb", "Breadcrumbs",
    "Last updated", "Your feedback", "Export your data", "Beginner rider",
    "Your comfort", "View details", "Complete your profile", "Download your report",
  ]) {
    assert.ok(analyzeDutchText(text), text);
  }
});

test("Dutch detector protects Dutch homographs and accepted technical/brand terms", () => {
  for (const text of [
    "Je fiets opslaan", "Geen fietsen gevonden", "Kies je fiets", "Vul dit veld in",
    "Stack, reach, drop, cleat en gravel", "BestBikeFit4U | Shimano SRAM Garmin Strava",
    "Je account is online", "De beste fiets voor je lichaam", "20–30 mmol/L · FTP · W/kg",
    "Dit was je eerste fiets", "Informatie over je fiets", "Wil je opslaan of annuleren?",
    "Bekijk je gegevens", "Instellingen en voorkeuren", "De fiets staat op je naam",
    "Meer comfort en bekijk de details", "Een complete gids", "Dit antwoord is incorrect",
    "Meet in millimeters of centimeters", "Heb je last van je knie?", "Voor de beginner",
    "Geef je feedback", "Export van je gegevens",
    "Bekijk de items", "Blijf fit", "Download je rapport", "Van start tot finish",
    "Een persoonlijk record", "Een ontspannen en relaxed gevoel", "Upgrade je account",
    "https://example.com/your-bike", "support@example.com", "", "123 mm",
  ]) {
    assert.equal(analyzeDutchText(text), null, text);
  }
});

test("Dutch detector uses whole words and exposes auditable ratio evidence", () => {
  assert.equal(analyzeDutchText("saveknop jeugdrijder settingsful"), null);
  const result = analyzeDutchText("Your bike is ready");
  assert.deepEqual(result.englishWords, ["your", "ready"]);
  assert.equal(result.ratio, 0.667);
  assert.equal(result.wordCount, 4);
  assert.equal(result.reason, "unambiguous-english-word");
});

test("English ratio catches common words even without a strong UI token", () => {
  const result = analyzeDutchText("activity analysis");
  assert.equal(result.reason, "english-word-ratio");
  assert.equal(result.ratio, 1);
  assert.equal(analyzeDutchText("Je activity staat tussen alle andere gegevens"), null);
});

test("exact Dutch tier comparisons and pricing plan headings do not erase generic English free", () => {
  assert.equal(analyzeDutchText("Vergelijk Free en Pro"), null);
  assert.equal(analyzeDutchText("E-mailrapporten zijn beschikbaar in zowel Free als Pro."), null);
  const heading = { kind: "visible-text", pathname: "/nl/pricing", selector: "body > article:nth-of-type(1) > h2:nth-of-type(1)" };
  assert.equal(analyzeDutchText("Free", heading), null);
  assert.ok(analyzeDutchText("Free"));
  assert.ok(analyzeDutchText("Free", { ...heading, pathname: "/nl/contact" }));
  assert.ok(analyzeDutchText("Get free advice"));
  assert.ok(analyzeDutchText("Vergelijk Free en Pro. Save your results."));
});

test("original bibliography titles are preserved while surrounding English remains detectable", () => {
  for (const title of ["Training and Racing with a Power Meter",
    "A Step Towards Personalized Sports Nutrition: Carbohydrate Intake During Exercise",
    "American College of Sports Medicine position stand. Exercise and fluid replacement"]) {
    assert.equal(analyzeDutchText(`${title}. Zie pagina 20.`), null);
    assert.ok(analyzeDutchText(`${title}. Save your results.`));
  }
  assert.ok(analyzeDutchText("Exercise and Fluid Replacement"));
});

test("only confirmed browser-generated validation is classified as an environment diagnostic", () => {
  const text = "Please fill out this field.";
  assert.equal(analyzeDutchText(text, { kind: "validation-message", browserGenerated: true }), null);
  assert.ok(analyzeDutchText(text, { kind: "validation-message", browserGenerated: false }));
  assert.ok(analyzeDutchText(text, { kind: "validation-message" }));
  assert.ok(analyzeDutchText(text, { kind: "visible-text", browserGenerated: true }));
});
