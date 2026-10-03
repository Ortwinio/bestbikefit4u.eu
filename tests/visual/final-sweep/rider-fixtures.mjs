const timestamp = 1790985600000;
export const riderFixtureQueries = [
  "profiles/queries:getMyProvenance", "profiles/provenance:getMyProvenance",
  "profiles/queries:getHandoffContext", "profiles/queries:nextPrompts",
  "advice/queries:listAdviceGroups", "calculatorChain/queries:getContext",
  "emails/preferences:get",
];

export function readRiderFixture(name, args, { profile, bike, fixture = "filled" }) {
  if (!riderFixtureQueries.includes(name)) return { handled: false };
  if (args === "skip" || fixture === "loading") return { handled: true, value: undefined };
  if (name === "emails/preferences:get") return { handled: true,
    value: { service: true, marketing: false, newsletter: false } };
  const rider = fixture === "empty" || fixture === "missing-profile" ? null :
    { ...profile, _creationTime: timestamp, updatedAt: timestamp };
  const observations = rider ? ["heightCm", "inseamCm", "weightKg"].filter(field => typeof rider[field] === "number")
    .map(field => ({ _id: `visual-observation-${field}`, userId: rider.userId, field, value: rider[field],
      unit: field === "weightKg" ? "kg" : "cm", kind: "measured", method: "single_measurement",
      source: "profile_edit", recordedAt: timestamp, status: "current" })) : [];
  const context = { profile: rider, observations };
  if (name.includes("getMyProvenance") || name.endsWith(":getHandoffContext")) return { handled: true, value: context };
  if (name.endsWith(":nextPrompts")) return { handled: true, value: {
    cardId: "visual-prompt-card", shownAt: timestamp, hiddenUntil: null,
    questions: [{ key: "armLengthCm", field: "armLengthCm", value: rider?.armLengthCm ?? null,
      unit: "cm", kind: "measured", range: [40, 100], effects: ["reach"], gain: rider?.armLengthCm ? 1.2 : 8,
      completenessGain: rider?.armLengthCm ? 0 : 8, effort: "measure", stale: false, status: "pending" }],
  } };
  if (name.endsWith(":listAdviceGroups")) return { handled: true, value:
    ["seating", "contact", "cockpit", "drivetrain", "tires", "performance", "frame"].map(key =>
      ({ key, titleKey: key, items: [], improvements: [] })) };
  const bikes = fixture === "empty" || fixture === "no-bikes" ? [] : [{ ...bike,
    userId: rider?.userId ?? "visual-user", _creationTime: timestamp, createdAt: timestamp, updatedAt: timestamp }];
  if (args?.bikeId && !bikes.some(item => item._id === args.bikeId)) throw new Error(`Unknown rider fixture bike ${args.bikeId}`);
  return { handled: true, value: { ...context, bikes, bikeObservations: [], recentCalculators: [],
    activeWheelset: null, activeTireSetup: null, advice: [] } };
}

export function extendRiderRuntime(contents, importPath) {
  if (!contents.includes("function readFixture(reference, args)")) throw new Error("Unsupported account fixture runtime");
  const marker = "if (!(name in values)) {";
  if (!contents.includes(marker)) throw new Error("Account fixture must retain unknown-query checks");
  const localized = contents.replaceAll('name: "Endurance racefiets"', 'name: locale === "nl" ? "Duurracefiets" : "Endurance road bike"');
  return `import { readRiderFixture } from ${JSON.stringify(importPath)};\n` + localized.replace(marker,
    `const riderResult = readRiderFixture(name, args, { profile, bike, fixture });
  if (riderResult.handled) return riderResult.value;
  ${marker}`);
}
