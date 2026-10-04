import { getFunctionName } from "convex/server";
import { fitResultsSource } from "../../../src/app/(dashboard)/fit/[sessionId]/results/fixture.test-support";

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
  currentGeometry: { frameSize: "56" },
  activeWheelsetSummary: null,
  activeTireSetupSummary: { widthFrontMm: 28, widthRearMm: 28, tubeType: "tubeless" },
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
  _creationTime: 1780000000000, createdAt: 1780000000000,
};
const fit = {
  session, bike,
  recommendation: { _id: "visual-recommendation", sessionId: session._id, calculatedFit: { saddleHeightMm: 733, handlebarDropMm: 55, handlebarReachMm: 480 } },
  responses: { experience_level: "intermediate", weekly_hours: "3-6", typical_ride_length: "medium", position_priority: "balanced", road_riding_type: "group", has_pain: "yes", pain_areas: ["lower_back"] },
};
const values = {
  "recommendations/queries:getReportV2": fixture === "report-loading" ? undefined :
    fixture === "report-missing" ? null : {
      ...fitResultsSource, session, bike, profile, user,
      recommendation: { ...fitResultsSource.recommendation,
        calculatedFit: { ...fitResultsSource.recommendation.calculatedFit, ...fit.recommendation.calculatedFit,
          saddleHeightRange: { min: 727, max: 739 } },
        recommendationItems: [] },
      questionnaireResponses: Object.entries(fit.responses).map(([questionId, response]) => ({ questionId, response })),
      latestPressureCalculation: fixture === "no-pressure" ? null : {
        ...fitResultsSource.latestPressureCalculation, ...bike.advisedPressureSummary },
    },
  "users/queries:getCurrentUser": user,
  "profiles/queries:getMyProfile": fixture === "loading" ? undefined :
    fixture === "empty" || fixture === "missing-profile" ? null :
      fixture === "missing-weight" ? { ...profile, weightKg: undefined } :
        fixture === "missing-extra" ? { ...profile, torsoLengthCm: undefined, armLengthCm: undefined } : profile,
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
  if (fixture === "saving") await new Promise((resolve) => setTimeout(resolve, 3000));
  return null;
};
export const useMutation = () => action;
export const useAction = () => action;
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
