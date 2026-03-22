export type ReleaseType = "app" | "fit_engine" | "geometry_data" | "content" | "integration" | "internal";
export type ReleaseStatus = "draft" | "in_qa" | "approved" | "scheduled" | "rolling_out" | "live" | "rolled_back";

export type ReleaseRecord = {
  id: string;
  name: string;
  type: ReleaseType;
  versionLabel: string;
  status: ReleaseStatus;
  owner: string;
  rolloutDate: string;
  liveAt?: string;
  linkedItems: number;
  bugs: number;
  features: number;
  supportTickets: number;
  releaseNotes: string[];
  summary: string;
  qaStatus: "pending" | "passed" | "failed";
  rollbackPlan: string;
  rolloutHealth: string;
};

export type ReleaseCalendarEntry = {
  date: string;
  releases: ReleaseRecord[];
};

export const releases: ReleaseRecord[] = [
  {
    id: "rel-2603",
    name: "Fit Engine v2.6.0",
    type: "fit_engine",
    versionLabel: "v2.6.0",
    status: "live",
    owner: "Mila Vermeer",
    rolloutDate: "2026-03-18",
    liveAt: "2026-03-18 09:20",
    linkedItems: 12,
    bugs: 9,
    features: 3,
    supportTickets: 4,
    releaseNotes: [
      "Reduced low-confidence fit output for compact road frames.",
      "Improved warning propagation for flexibility outliers.",
      "Updated trace viewer terminology for clarity.",
    ],
    summary: "Stable production rollout with low support volume.",
    qaStatus: "passed",
    rollbackPlan: "Rollback to v2.5.2 using feature gate and release pin.",
    rolloutHealth: "Positive trend in fit confidence and fewer manual reviews.",
  },
  {
    id: "rel-2602",
    name: "Geometry data refresh",
    type: "geometry_data",
    versionLabel: "2026.03",
    status: "rolling_out",
    owner: "Jonas Klein",
    rolloutDate: "2026-03-22",
    linkedItems: 7,
    bugs: 2,
    features: 5,
    supportTickets: 1,
    releaseNotes: [
      "Added brand/model coverage for several gravel and endurance frames.",
      "Normalized stack and reach values for imported records.",
    ],
    summary: "Currently rolling out to review queues and admin views.",
    qaStatus: "passed",
    rollbackPlan: "Deactivate import batch and restore prior geometry snapshot.",
    rolloutHealth: "Need to monitor linked fit runs for a week after publish.",
  },
  {
    id: "rel-2601",
    name: "Dashboard content refresh",
    type: "content",
    versionLabel: "2026.02",
    status: "scheduled",
    owner: "Mila Vermeer",
    rolloutDate: "2026-03-24",
    linkedItems: 4,
    bugs: 1,
    features: 3,
    supportTickets: 0,
    releaseNotes: [
      "New support copy on the dashboard and fit results pages.",
      "Reworked onboarding prompts for low-confidence runs.",
    ],
    summary: "Scheduled for a low-risk content-only deployment.",
    qaStatus: "passed",
    rollbackPlan: "Restore previous markdown content bundle.",
    rolloutHealth: "No expected engine impact.",
  },
  {
    id: "rel-2599",
    name: "Billing rules patch",
    type: "integration",
    versionLabel: "2026.02.4",
    status: "draft",
    owner: "Alyssa de Jong",
    rolloutDate: "2026-03-27",
    linkedItems: 2,
    bugs: 1,
    features: 1,
    supportTickets: 0,
    releaseNotes: [
      "Patch for entitlement calculation edge cases.",
      "Adds explicit notes for the billing support team.",
    ],
    summary: "Draft only, awaiting QA.",
    qaStatus: "pending",
    rollbackPlan: "Revert entitlement rules to prior stable snapshot.",
    rolloutHealth: "N/A until QA passes.",
  },
];

export const releaseCalendar: ReleaseCalendarEntry[] = [
  {
    date: "Mon 18 Mar",
    releases: [releases[0]],
  },
  {
    date: "Tue 19 Mar",
    releases: [],
  },
  {
    date: "Wed 20 Mar",
    releases: [],
  },
  {
    date: "Thu 21 Mar",
    releases: [releases[1]],
  },
  {
    date: "Fri 22 Mar",
    releases: [releases[1]],
  },
  {
    date: "Mon 24 Mar",
    releases: [releases[2]],
  },
];
