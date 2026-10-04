import { getFunctionName } from "convex/server";
import { getAllQuestions } from "../../../convex/questionnaire/questions";

const params = new URLSearchParams(window.location.search);
export const fixture = params.get("fixture") || "filled";
export const locale = window.location.pathname.startsWith("/en/") ? "en" : "nl";
const profile = {
  _id: "visual-profile", userId: "visual-user", heightCm: 178, inseamCm: 83,
  weightKg: 74, torsoLengthCm: 59, armLengthCm: 61, shoulderWidthCm: 40,
  femurLengthCm: 43, flexibilityScore: "average", coreStabilityScore: 3,
  hasPain: "yes", painSeverity: 2, painAreas: ["lower_back"],
  experienceLevel: "intermediate", weeklyHours: "3-6", typicalRideLength: "medium", positionPriority: "balanced", longestRideKm: 85,
  ridingGoal: "balanced", age: 36, sex: "female", ftpWatts: 210,
};
const user = {
  _id: "visual-user", name: "Sanne", displayName: "Sanne", email: "visual@example.invalid",
  tier: "free",
  theme: "light", _creationTime: 1780000000000,
};
const bike = {
  _id: "visual-bike", name: "Endurance racefiets", brand: "Trek", model: "Domane",
  bikeType: "road", ridingStyle: "sportive", primaryGoal: "comfort",
  advisedPressureSummary: {
    createdAt: 1780000000000, recommendedFrontBar: 4.2, recommendedRearBar: 4.5,
    recommendedFrontPsi: 61, recommendedRearPsi: 65, currentFrontBar: 4.2, currentRearBar: 4.5,
  },
  pressureStateSummary: { isStale: false, hasCurrentPressure: true },
};
const empty = [];
const session = {
  _id: "visual-session", userId: user._id, bikeId: bike._id, status: "completed",
  ridingStyle: "sportive", primaryGoal: "comfort", bikeType: "road",
  _creationTime: 1780000000000, createdAt: 1780000000000, completedAt: 1780000000000, engineVersion: "v2",
};
const fit = {
  session, bike,
  recommendation: {
    _id: "visual-recommendation", sessionId: session._id, confidenceScore: 88, engineVersion: "v2", algorithmVersion: "2.0.0",
    calculatedFit: { saddleHeightMm: 733, saddleSetbackMm: 53, saddleHeightRange: { min: 727, max: 739 }, handlebarDropMm: 55, handlebarReachMm: 480, recommendedStackMm: 605, recommendedReachMm: 395, effectiveTopTubeMm: 560, stemLengthMm: 100, stemAngleRecommendation: "-6°", crankLengthMm: 172.5, handlebarWidthMm: 400 },
    fitNotes: [], frameSizeRecommendations: [], recommendationItems: [{ parameter: "saddleHeightMm", target: 733, rangeLow: 727, rangeHigh: 739, confidence: 0.88, feasibility: "direct" }],
  },
  responses: { experience_level: "intermediate", weekly_hours: "3-6", typical_ride_length: "medium", position_priority: "balanced", road_riding_type: "group", has_pain: "yes", pain_areas: ["lower_back"] },
};
const report = { session, recommendation: fit.recommendation, bike: { ...bike, bikeWeightKg: 8.4, currentSetup: { saddleHeightMm: 725, saddleSetbackMm: 50, stemLengthMm: 110, handlebarWidthMm: 400, crankLengthMm: 172.5 } }, bikeProfile: null, profile, user, latestPressureCalculation: null, questionnaireResponses: Object.entries(fit.responses).map(([questionId, response], questionOrder) => ({ questionId, response, questionOrder })) };
const liveSession = { ...session, status: fixture === "incomplete" || window.location.pathname.endsWith("/questionnaire") ? "in_progress" : fixture === "processing" || fixture === "generate-error" ? "questionnaire_complete" : "completed" };
const values = {
  "bikes/queries:listByUser": fixture === "loading" ? undefined : fixture === "empty" ? empty : [bike],
  "sessions/queries:getById": fixture === "loading" ? undefined : fixture === "missing" ? null : liveSession,
  "questionnaire/queries:getQuestions": fixture === "loading" ? undefined : getAllQuestions(),
  "questionnaire/queries:getResponses": fixture === "loading" ? undefined : fixture === "intro" ? empty : [{ questionId: "current_position_feeling", response: ["too_stretched"], questionOrder: 1 }],
  "recommendations/queries:getReportV2": fixture === "loading" ? undefined : fixture === "missing" ? null : { ...report, session: liveSession, recommendation: ["incomplete", "processing", "generate-error"].includes(fixture) ? null : { ...fit.recommendation, ...(fixture === "climbing" ? { climbingCalculatedFit: { ...fit.recommendation.calculatedFit, saddleHeightMm: 729, handlebarDropMm: 45 } } : {}) } },
  "fitPass/queries:getSessionAccess": { hasAccess: true, reason: "fixture" },
  "users/queries:getCurrentUser": user,
  "profiles/queries:getMyProfile": fixture === "loading" ? undefined : fixture === "missing-profile" ? null : fixture === "missing-weight" ? { ...profile, weightKg: undefined } : profile,
  "bikes/queries:listSummariesByUser": fixture === "loading" ? undefined : fixture === "empty" || fixture === "no-bikes" ? empty : [bike],
  "sessions/queries:getAllSessionsWithBikes": fixture === "loading" ? undefined : fixture === "empty" || fixture === "no-fit" ? empty : [fit],
  "sessions/queries:listByUser": fixture === "loading" ? undefined : fixture === "empty" || fixture === "no-fit" ? empty : [session],
  "pressureCalculations/queries:getRecalculableBikeCount": 1,
  "messages/queries:getMyMessages": empty,
};

window.__visualQueries = [];
window.__visualActions = [];
window.__visualUnknownQueries = [];

function readFixture(reference, args) {
  if (args === "skip") return undefined;
  const name = getFunctionName(reference);
  if (!window.__visualQueries.includes(name)) window.__visualQueries.push(name);
  if (name === "calculatorStates/queries:get") {
    return JSON.parse(localStorage.getItem(`calculator-${args.calculator}-${args.bikeId ?? "rider"}`) ?? "null");
  }
  if (!(name in values)) {
    if (!window.__visualUnknownQueries.includes(name)) window.__visualUnknownQueries.push(name);
    throw new Error(`Missing visual fixture for ${name}`);
  }
  return values[name];
}
export const useQuery = (reference, args) => readFixture(reference, args);
export const usePaginatedQuery = (reference, args) => ({
  results: args === "skip" ? [] : readFixture(reference, args),
  status: "Exhausted",
  loadMore: () => {},
});

const action = async (...args) => {
  window.__visualActions.push(args);
  if (fixture === "save-error") throw new Error("Visual fixture save failure");
  return null;
};
const handlers = new Map();
function fixtureHandler(reference) {
  const name = getFunctionName(reference);
  if (!handlers.has(name)) handlers.set(name, async (args) => {
    window.__visualActions.push({ name, args });
    if (name === "recommendations/mutations:generate" && fixture === "processing") return new Promise(() => {});
    if (["create-error", "save-error", "generate-error", "email-error", "delete-error"].includes(fixture) && !name.includes("marketing")) throw new Error("Visual fixture operation failed");
    return name === "sessions/mutations:create" ? session._id : null;
  });
  return handlers.get(name);
}
export const useMutation = (reference) => fixtureHandler(reference);
export const useAction = (reference) => fixtureHandler(reference);
export const useConvex = () => ({ query: async (reference, args) => readFixture(reference, args), mutation: action, action });
export const useConvexAuth = () => ({ isLoading: false, isAuthenticated: !window.location.pathname.endsWith("/login") });
const signIn = async (provider, args) => {
  window.__visualActions.push({ provider, args });
  if (fixture === "error") throw new Error("Visual fixture authentication failure");
  return { signingIn: false };
};
export const useAuthActions = () => ({ signIn, signOut: action });
const router = {
  push: (href) => window.location.assign(href),
  replace: (href) => window.location.replace(href),
  refresh: () => window.location.reload(),
  prefetch: () => {},
};
export const useRouter = () => router;
export const usePathname = () => window.location.pathname;
export const useSearchParams = () => params;
export const getRequestLocale = async () => locale;
export const captureException = () => {};
