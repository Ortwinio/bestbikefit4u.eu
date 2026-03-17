import { action } from "../_generated/server";

// Required env vars (set in Convex dashboard):
// STRAVA_CLIENT_ID
// STRAVA_CLIENT_SECRET
// SITE_URL

export const importRecentRides = action({
  args: {},
  handler: async () => {
    throw new Error(
      "Strava sync requires a configured Strava app and is not available in this local environment."
    );
  },
});
