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

// Daily: fit reminder for users who signed up but haven't started a fit (48h+ ago)
crons.daily(
  "fit reminder emails",
  { hourUTC: 7, minuteUTC: 0 },
  internal.emails.lifecycle.runFitReminderBatch
);

// Daily: upgrade nudge for free users who viewed results 72h+ ago
crons.daily(
  "upgrade nudge emails",
  { hourUTC: 8, minuteUTC: 0 },
  internal.emails.lifecycle.runUpgradeNudgeBatch
);

// Weekly: win-back for dormant users (21+ days inactive)
crons.weekly(
  "win-back emails",
  { dayOfWeek: "wednesday", hourUTC: 9, minuteUTC: 0 },
  internal.emails.lifecycle.runWinbackBatch
);

export default crons;
