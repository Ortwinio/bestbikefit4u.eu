export type AdminUserPlan = "free" | "pro" | "premium";

export type AdminUserRole =
  | "super_admin"
  | "ops_admin"
  | "support_admin"
  | "fit_specialist"
  | "geometry_manager"
  | "billing_admin"
  | "qa_manager"
  | "analyst";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  plan: AdminUserPlan;
  stravaConnected: boolean;
  bikesCount: number;
  fitRunsCount: number;
  joinedAt: string;
  adminRole?: AdminUserRole;
  suspendedAt?: string;
  suspendedReason?: string;
  lastLoginAt: string;
};

export type AdminUserDetail = {
  row: AdminUserRow;
  riderProfile: {
    heightCm: number;
    inseamCm: number;
    armLengthCm: number;
    torsoLengthCm: number;
    shoulderWidthCm: number;
    flexibility: string;
    coreStability: number;
    injuryHistory: string[];
  };
  bikes: Array<{
    id: string;
    name: string;
    category: string;
    size: string;
    geometryLinked: boolean;
  }>;
  fitHistory: Array<{
    id: string;
    bike: string;
    engineVersion: string;
    completedAt: string;
    confidence: string;
  }>;
  integrations: Array<{
    provider: string;
    status: string;
    lastSync: string;
    notes: string;
  }>;
  license: {
    currentPlan: AdminUserPlan;
    assignedAt: string;
    trialEndsAt?: string;
    history: Array<{
      time: string;
      action: string;
      reason: string;
      admin: string;
    }>;
  };
  feedback: Array<{
    id: string;
    title: string;
    type: "bug" | "feature_request" | "support";
    status: string;
    linkedRelease?: string;
  }>;
  messages: Array<{
    id: string;
    title: string;
    type: string;
    state: string;
    receivedAt: string;
  }>;
  auditTrail: Array<{
    time: string;
    action: string;
    target: string;
    admin: string;
    reason: string;
  }>;
};

export const adminUsers: AdminUserRow[] = [
  {
    id: "user_anna",
    name: "Anna Vermeer",
    email: "anna@bestbikefit4u.eu",
    plan: "premium",
    stravaConnected: true,
    bikesCount: 3,
    fitRunsCount: 12,
    joinedAt: "2024-02-18T09:00:00.000Z",
    adminRole: "support_admin",
    lastLoginAt: "2026-03-21T18:20:00.000Z",
  },
  {
    id: "user_bram",
    name: "Bram de Vries",
    email: "bram@bestbikefit4u.eu",
    plan: "pro",
    stravaConnected: false,
    bikesCount: 1,
    fitRunsCount: 4,
    joinedAt: "2024-10-01T10:00:00.000Z",
    suspendedAt: "2026-03-10T08:30:00.000Z",
    suspendedReason: "Repeated refund abuse",
    lastLoginAt: "2026-03-14T13:05:00.000Z",
  },
  {
    id: "user_celine",
    name: "Celine Jansen",
    email: "celine@shop-example.nl",
    plan: "free",
    stravaConnected: true,
    bikesCount: 2,
    fitRunsCount: 7,
    joinedAt: "2025-01-13T07:30:00.000Z",
    adminRole: "geometry_manager",
    lastLoginAt: "2026-03-22T08:45:00.000Z",
  },
  {
    id: "user_daan",
    name: "Daan Visser",
    email: "daan@bestbikefit4u.eu",
    plan: "premium",
    stravaConnected: true,
    bikesCount: 5,
    fitRunsCount: 18,
    joinedAt: "2023-11-04T16:10:00.000Z",
    adminRole: "analyst",
    lastLoginAt: "2026-03-20T11:10:00.000Z",
  },
  {
    id: "user_elsa",
    name: "Elsa Peters",
    email: "elsa@bestbikefit4u.eu",
    plan: "pro",
    stravaConnected: false,
    bikesCount: 2,
    fitRunsCount: 5,
    joinedAt: "2024-08-22T12:15:00.000Z",
    lastLoginAt: "2026-03-18T19:40:00.000Z",
  },
];

const sharedLicenseHistory = [
  {
    time: "2026-03-21T16:20:00.000Z",
    action: "user.tier_change",
    reason: "Downgraded after renewal request",
    admin: "Ops Team",
  },
  {
    time: "2026-03-20T14:50:00.000Z",
    action: "message.create",
    reason: "Responded to fit feedback",
    admin: "Support Team",
  },
];

const sharedAuditTrail = [
  {
    time: "2026-03-21T16:20:00.000Z",
    action: "user.tier_change",
    target: "Premium -> Pro",
    admin: "Ops Team",
    reason: "Downgraded after renewal request",
  },
  {
    time: "2026-03-20T14:50:00.000Z",
    action: "message.create",
    target: "Support reply",
    admin: "Support Team",
    reason: "Responded to fit feedback",
  },
];

export const adminUserDetails: Record<string, AdminUserDetail> = {
  user_anna: {
    row: adminUsers[0],
    riderProfile: {
      heightCm: 174,
      inseamCm: 81,
      armLengthCm: 62,
      torsoLengthCm: 59,
      shoulderWidthCm: 42,
      flexibility: "good",
      coreStability: 4,
      injuryHistory: ["Mild lower back tightness", "No active injuries"],
    },
    bikes: [
      {
        id: "bike_anna_1",
        name: "Road endurance build",
        category: "road",
        size: "54",
        geometryLinked: true,
      },
      {
        id: "bike_anna_2",
        name: "Gravel explorer",
        category: "gravel",
        size: "M",
        geometryLinked: false,
      },
    ],
    fitHistory: [
      {
        id: "fit_anna_1",
        bike: "Road endurance build",
        engineVersion: "v2.4.1",
        completedAt: "2026-03-20T10:00:00.000Z",
        confidence: "High",
      },
      {
        id: "fit_anna_2",
        bike: "Gravel explorer",
        engineVersion: "v2.4.0",
        completedAt: "2026-01-18T10:00:00.000Z",
        confidence: "Medium",
      },
    ],
    integrations: [
      {
        provider: "Strava",
        status: "active",
        lastSync: "2026-03-21T17:10:00.000Z",
        notes: "Synced 3 rides",
      },
    ],
    license: {
      currentPlan: "premium",
      assignedAt: "2025-11-12T09:00:00.000Z",
      trialEndsAt: "2025-11-26T09:00:00.000Z",
      history: sharedLicenseHistory,
    },
    feedback: [
      {
        id: "fb_1",
        title: "Fit feels too aggressive on long climbs",
        type: "support",
        status: "triaged",
      },
    ],
    messages: [
      {
        id: "msg_1",
        title: "New fit guide available",
        type: "banner",
        state: "read",
        receivedAt: "2026-03-21T16:00:00.000Z",
      },
    ],
    auditTrail: sharedAuditTrail,
  },
  user_bram: {
    row: adminUsers[1],
    riderProfile: {
      heightCm: 182,
      inseamCm: 86,
      armLengthCm: 64,
      torsoLengthCm: 61,
      shoulderWidthCm: 44,
      flexibility: "average",
      coreStability: 3,
      injuryHistory: ["Recovering from knee irritation"],
    },
    bikes: [
      {
        id: "bike_bram_1",
        name: "All-road setup",
        category: "gravel",
        size: "56",
        geometryLinked: true,
      },
    ],
    fitHistory: [
      {
        id: "fit_bram_1",
        bike: "All-road setup",
        engineVersion: "v2.4.1",
        completedAt: "2026-02-14T14:00:00.000Z",
        confidence: "Low",
      },
    ],
    integrations: [
      {
        provider: "Strava",
        status: "not_connected",
        lastSync: "Never",
        notes: "Connection missing",
      },
    ],
    license: {
      currentPlan: "pro",
      assignedAt: "2024-10-15T09:00:00.000Z",
      history: sharedLicenseHistory,
    },
    feedback: [],
    messages: [],
    auditTrail: [
      ...sharedAuditTrail,
      {
        time: "2026-03-10T08:30:00.000Z",
        action: "user.suspend",
        target: "Account",
        admin: "Billing Team",
        reason: "Suspension after refund abuse",
      },
    ],
  },
  user_celine: {
    row: adminUsers[2],
    riderProfile: {
      heightCm: 169,
      inseamCm: 79,
      armLengthCm: 60,
      torsoLengthCm: 57,
      shoulderWidthCm: 41,
      flexibility: "excellent",
      coreStability: 5,
      injuryHistory: ["No injuries reported"],
    },
    bikes: [
      {
        id: "bike_celine_1",
        name: "Bike shop demo road",
        category: "road",
        size: "53",
        geometryLinked: true,
      },
      {
        id: "bike_celine_2",
        name: "Demo gravel",
        category: "gravel",
        size: "S",
        geometryLinked: true,
      },
    ],
    fitHistory: [
      {
        id: "fit_celine_1",
        bike: "Bike shop demo road",
        engineVersion: "v2.4.1",
        completedAt: "2026-03-19T09:15:00.000Z",
        confidence: "High",
      },
    ],
    integrations: [
      {
        provider: "Strava",
        status: "active",
        lastSync: "2026-03-22T08:20:00.000Z",
        notes: "Shop demo account",
      },
    ],
    license: {
      currentPlan: "free",
      assignedAt: "2025-01-13T07:30:00.000Z",
      history: sharedLicenseHistory,
    },
    feedback: [
      {
        id: "fb_2",
        title: "Geometry import missing brand slug",
        type: "bug",
        status: "planned",
        linkedRelease: "Geometry import hotfix",
      },
    ],
    messages: [],
    auditTrail: sharedAuditTrail,
  },
  user_daan: {
    row: adminUsers[3],
    riderProfile: {
      heightCm: 188,
      inseamCm: 90,
      armLengthCm: 67,
      torsoLengthCm: 64,
      shoulderWidthCm: 45,
      flexibility: "good",
      coreStability: 4,
      injuryHistory: ["No active injuries"],
    },
    bikes: [],
    fitHistory: [],
    integrations: [],
    license: {
      currentPlan: "premium",
      assignedAt: "2023-11-04T16:10:00.000Z",
      history: sharedLicenseHistory,
    },
    feedback: [],
    messages: [],
    auditTrail: sharedAuditTrail,
  },
  user_elsa: {
    row: adminUsers[4],
    riderProfile: {
      heightCm: 165,
      inseamCm: 76,
      armLengthCm: 59,
      torsoLengthCm: 55,
      shoulderWidthCm: 39,
      flexibility: "limited",
      coreStability: 2,
      injuryHistory: ["Recurring saddle pressure sensitivity"],
    },
    bikes: [
      {
        id: "bike_elsa_1",
        name: "Commuter",
        category: "hybrid",
        size: "M",
        geometryLinked: false,
      },
    ],
    fitHistory: [
      {
        id: "fit_elsa_1",
        bike: "Commuter",
        engineVersion: "v2.3.9",
        completedAt: "2026-03-16T12:00:00.000Z",
        confidence: "Medium",
      },
    ],
    integrations: [],
    license: {
      currentPlan: "pro",
      assignedAt: "2024-08-22T12:15:00.000Z",
      history: sharedLicenseHistory,
    },
    feedback: [],
    messages: [],
    auditTrail: sharedAuditTrail,
  },
};
