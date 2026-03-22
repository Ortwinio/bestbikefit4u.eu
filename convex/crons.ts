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

export default crons;
