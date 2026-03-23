import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "strava low-use bike reminders",
  {
    dayOfWeek: "monday",
    hourUTC: 6,
    minuteUTC: 0,
  },
  internal.integrations.actions.scanLowUseBikes
);

crons.interval(
  "strava login-triggered bike auto-import",
  { minutes: 10 },
  internal.integrations.actions.scanStravaAutoImportCandidates
);

export default crons;
