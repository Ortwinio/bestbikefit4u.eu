import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

const DAY = 86_400_000;
const CALCULATORS = [
  "bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width", "tire-pressure",
  "gearing", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration",
] as const;
const PROFILE_FIELDS = [
  "heightCm", "inseamCm", "armLengthCm", "torsoLengthCm", "shoulderWidthCm", "femurLengthCm",
  "footLengthCm", "handSpanCm", "sitBoneWidthMm", "hipCircumferenceCm", "flexibilityScore",
  "coreStabilityScore", "age", "weightKg", "experienceLevel", "weeklyHours", "typicalRideLength",
  "hasPain", "positionPriority",
] as const;

type User = { _id: string; _creationTime: number; createdAt?: number; lastLoginAt?: number };
type Profile = { userId: string; [key: string]: unknown };
type Event = { eventType: string; sourceTag?: string; occurredAt: number };
type State = { userId: string; updatedAt: number };
type Recommendation = { sessionId: string; createdAt: number };
type Feedback = { sessionId: string; createdAt: number };
export interface BaselineData {
  users: User[];
  profiles: Profile[];
  events: Event[];
  states: State[];
  recommendations: Recommendation[];
  feedback: Feedback[];
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : null;
const created = (user: User) => user.createdAt ?? user._creationTime;

/** Never return input records, identifiers, arbitrary source tags, or body/fitness values. */
export function aggregateRiderProfileBaseline(data: BaselineData, from: number, to: number, observedAt: number) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0 || from >= to
    || !Number.isFinite(observedAt) || to > observedAt) throw new Error("Invalid baseline date range");
  const inWindow = (timestamp: number) => timestamp >= from && timestamp < to;
  const events = data.events.filter((event) => inWindow(event.occurredAt));
  const cohort = data.users.filter((user) => inWindow(created(user)));
  const publicCalculators = CALCULATORS.map((calculator) => {
    const matching = events.filter((event) => event.sourceTag === calculator);
    const resultViews = matching.filter((event) => event.eventType === "calculator_result_view").length;
    const loginCtaClicks = matching.filter((event) => event.eventType === "calculator_login_cta_click").length;
    const verifiedLogins = matching.filter((event) => event.eventType === "login_verified").length;
    return { calculator, resultViews, loginCtaClicks, verifiedLogins,
      loginClicksPerResultView: ratio(loginCtaClicks, resultViews) };
  });
  const profiles = new Map(data.profiles.map((profile) => [profile.userId, profile]));
  const profileAtAge = (days: number) => {
    const mature = cohort.filter((user) => created(user) + days * DAY <= observedAt);
    const currentCounts = mature.map((user) => {
      const profile = profiles.get(user._id);
      return PROFILE_FIELDS.filter((field) => {
        const value = profile?.[field];
        return typeof value === "number" ? Number.isFinite(value) && value > 0
          : typeof value === "string" && value.trim().length > 0;
      }).length;
    });
    return {
      days, eligibleUsers: mature.length, medianFilledFieldsAtAge: null,
      currentMedianFilledFieldsForEligibleUsers: median(currentCounts),
      status: "historical_snapshots_unavailable" as const,
    };
  };
  const months = new Map<string, State[]>();
  // Include zero-activity months. Boundary months reflect only the requested interval.
  const month = new Date(from);
  month.setUTCDate(1);
  month.setUTCHours(0, 0, 0, 0);
  while (month.getTime() < to) {
    months.set(month.toISOString().slice(0, 7), []);
    month.setUTCMonth(month.getUTCMonth() + 1);
  }
  data.states.filter((state) => inWindow(state.updatedAt)).forEach((state) => {
    months.get(new Date(state.updatedAt).toISOString().slice(0, 7))?.push(state);
  });
  const accountCalculatorUse = Array.from(months, ([month, states]) => {
    const byUser = new Map<string, number>();
    states.forEach((state) => byUser.set(state.userId, (byUser.get(state.userId) ?? 0) + 1));
    return {
      month, activeUpdatingUsers: byUser.size, latestUpdatedStateRows: states.length,
      rowsPerActiveUpdatingUser: ratio(states.length, byUser.size),
      medianRowsPerActiveUpdatingUser: median([...byUser.values()]),
    };
  });
  const recommendations = data.recommendations.filter((recommendation) => inWindow(recommendation.createdAt));
  const withFeedback = recommendations.filter((recommendation) => data.feedback.some((feedback) =>
    feedback.sessionId === recommendation.sessionId && feedback.createdAt >= recommendation.createdAt
    && feedback.createdAt <= observedAt)).length;
  const mature30 = cohort.filter((user) => created(user) + 30 * DAY <= observedAt);
  const returned = mature30.filter((user) => user.lastLoginAt !== undefined
    && user.lastLoginAt >= created(user) + DAY && user.lastLoginAt <= created(user) + 30 * DAY).length;
  const unknown = mature30.filter((user) => user.lastLoginAt === undefined
    || user.lastLoginAt > created(user) + 30 * DAY).length;
  return {
    version: 1,
    range: { from, to, observedAt, convention: "from_inclusive_to_exclusive" },
    newUsers: cohort.length,
    publicCalculators,
    verifiedLoginsFromCalculators: publicCalculators.reduce((sum, row) => sum + row.verifiedLogins, 0),
    profileCompleteness: { countedFieldCount: PROFILE_FIELDS.length, at7Days: profileAtAge(7), at30Days: profileAtAge(30) },
    accountCalculatorUse,
    recommendationFeedback: {
      recommendations: recommendations.length, withRideFeedback: withFeedback,
      share: ratio(withFeedback, recommendations.length),
    },
    returnWithin30Days: {
      eligibleUsers: mature30.length, observedReturns: returned, unknownUsers: unknown,
      observedLowerBoundShare: ratio(returned, mature30.length),
    },
    limitations: [
      "Events require consent and are counts, not unique visitors or linked conversion cohorts. Attribution uses src only.",
      "Historical profile snapshots do not exist: day-7/day-30 medians are null; current medians are a separate proxy.",
      "Missing profiles count as zero current filled fields. Conditional pain-detail fields and free text are excluded.",
      "calculatorStates retains only the latest update per saved state; monthly rows are not edits or historical usage.",
      "Active updating users means users with a latest calculatorStates update in that month, not all logged-in users.",
      "Feedback is matched by fit session and observed through report time, not necessarily inside the cohort window.",
      "lastLoginAt retains only the latest login: later logins or missing timestamps make 30-day return unknown.",
      "Observed return requires a login at least 24 hours after creation; same-day repeat visits are not measurable.",
      "Current data is read in full without sampling; database read limits may reject large reports rather than truncate.",
    ],
  };
}

export const riderProfileBaseline = internalQuery({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, { from, to }) => {
    const observedAt = Date.now();
    // Validate before any potentially expensive table reads.
    if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0 || from >= to || to > observedAt) {
      throw new Error("Invalid baseline date range");
    }
    const [users, profiles, events, states, recommendations, feedback] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("profiles").collect(),
      ctx.db.query("marketingEvents").withIndex("by_occurred_at", (q) =>
        q.gte("occurredAt", from).lt("occurredAt", to)).collect(),
      ctx.db.query("calculatorStates").collect(),
      ctx.db.query("recommendations").collect(),
      ctx.db.query("rideFeedbackEntries").collect(),
    ]);
    return aggregateRiderProfileBaseline({ users, profiles, events, states, recommendations, feedback }, from, to, observedAt);
  },
});
