import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "day 1 measuring tips emails",
  { hourUTC: 6, minuteUTC: 30 },
  internal.emails.lifecycle.runDay1TipsBatch
);

// Daily: fit reminder for users who signed up but haven't started a fit (72h+ ago)
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

// Daily: 24h nudge for new Pro users explaining their fit numbers
crons.daily(
  "24h pro nudge emails",
  { hourUTC: 10, minuteUTC: 0 },
  internal.emails.fitpass.run24hProNudgeBatch,
  {}
);

export default crons;
