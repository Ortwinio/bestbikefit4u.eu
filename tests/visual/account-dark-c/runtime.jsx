import { getFunctionName } from "convex/server";

const params = new URLSearchParams(window.location.search);
export const fixture = params.get("fixture") || "filled";
export const locale = window.location.pathname.startsWith("/en/") ? "en" : "nl";
const loading = fixture === "loading";
const empty = fixture === "empty";
const profile = {
  _id: "visual-profile",
  userId: "visual-user",
  heightCm: 180,
  inseamCm: 84,
  weightKg: 75,
  hipCircumferenceCm: 100,
  sitBoneWidthMm: 125,
  flexibilityScore: "good",
  coreStabilityScore: 3,
};
const user = {
  _id: "visual-user",
  name: "Sanne [VOORBEELD]",
  displayName: "Sanne [VOORBEELD]",
  email: "visual@example.invalid",
  tier: "free",
  theme_preference: params.get("theme") || "light",
  _creationTime: 1780000000000,
};
const bike = {
  _id: "bike1",
  name: "Canyon Endurace [VOORBEELD]",
  brand: "Canyon",
  model: "CF7",
  bikeType: "road",
  discipline: "road",
  bikeWeightKg: 8.5,
  gearing: {
    drivetrainType: "2x",
    chainrings: [50, 34],
    cassetteTeeth: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30],
    wheelCircumferenceMm: 2105,
  },
  currentSetup: { crankLengthMm: 172.5 },
};
const pressure = {
  _id: "calc1",
  recommendedFrontBar: 5.2,
  recommendedRearBar: 5.6,
  createdAt: 1780000000000,
  userNotes:
    locale === "nl"
      ? "Voorbeeldnotitie: test tijdens een rustige rit."
      : "Example note: test on an easy ride.",
};
const feedback = {
  _id: "feedback1",
  type: "feature_request",
  status: "planned",
  upvoteCount: 12,
  hasUpvoted: false,
  title: locale === "nl" ? "Voorbeeld: instellingen vergelijken" : "Example: compare settings",
  description:
    locale === "nl"
      ? "Een voorbeeld van een suggestie op het ideeënbord."
      : "An example suggestion for the feature board.",
  createdAt: 1780000000000,
};
const values = {
  "sessions/queries:listByUser": [],
  "users/queries:getCurrentUser": user,
  "profiles/queries:getMyProfile": loading ? undefined : empty ? null : profile,
  "bikes/queries:list": loading ? undefined : empty ? [] : [bike],
  "bikes/queries:listByUser": loading ? undefined : empty ? [] : [bike],
  "bikes/queries:get": empty ? null : bike,
  "pressureCalculations/queries:getLatestByBikeForUser": loading
    ? undefined
    : empty
      ? []
      : [{ bikeId: "bike1", latestCalculation: pressure }],
  "wheelsets/queries:listForBike": [],
  "tireSetups/queries:listForWheelset": [],
  "tireSetups/queries:get": null,
  "gearing/queries:listGearingSessions": loading ? undefined : [],
  "saddleWidth/queries:listSaddleWidthSessions": loading
    ? undefined
    : empty
      ? []
      : [
          {
            _id: "history1",
            createdAt: 1700000000000,
            widthRangeMinMm: 142,
            widthRangeMaxMm: 152,
            saddleFamily: "endurance_allroad",
            confidenceLevel: "high",
          },
        ],
  "feedback/queries:getMyFeedback": loading ? undefined : empty ? [] : [feedback],
  "feedback/queries:getFeatureBoard": loading ? undefined : empty ? [] : [feedback],
  "releases/queries:getPublicReleases": loading
    ? undefined
    : empty
      ? []
      : [
          {
            _id: "release1",
            name: locale === "nl" ? "Voorbeeldupdate" : "Example update",
            versionLabel: "1.0",
            type: "app",
            status: "live",
            releaseNotes: locale === "nl" ? "Voorbeeldnotities bij een update." : "Example release notes.",
            liveAt: 1780000000000,
            items: [],
          },
        ],
  "feedback/queries:getPublicFeedbackDetail": { item: { ...feedback, comments: [] } },
  "messages/queries:getMyMessages": [],
  "integrations/queries:getStravaStatus": { accessStatus: "disconnected" },
  "integrations/queries:getStravaBikeOverview": [],
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

const action = async (...args) => {
  window.__visualActions.push(args);
  if (fixture === "save-error") throw new Error("Visual fixture save failure");
  return null;
};
export const useMutation =
  (reference) =>
  async (...args) => {
    const name = getFunctionName(reference);
    window.__visualActions.push({ name, args });
    if (name.includes("createDashboardGearingSession")) return "session1";
    return { hasUpvoted: true, upvoteCount: 13 };
  };
export const useFeedbackPanel = () => ({ openPanel: action, closePanel: action });
export const useAction = () => action;
export const useConvex = () => ({
  query: async (reference, args) => readFixture(reference, args),
  mutation: action,
  action,
});
export const useConvexAuth = () => ({
  isLoading: false,
  isAuthenticated: !window.location.pathname.endsWith("/login"),
});
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
