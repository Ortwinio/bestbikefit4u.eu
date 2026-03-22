export type AdminOrganizationType =
  | "bike_shop"
  | "enterprise"
  | "fitter_studio"
  | "brand";

export type AdminOrganizationRow = {
  id: string;
  name: string;
  type: AdminOrganizationType;
  ownerEmail: string;
  seatsUsed: number;
  maxSeats: number;
  suspended: boolean;
  billingEmail: string;
  createdAt: string;
};

export type AdminOrganizationDetail = {
  row: AdminOrganizationRow;
  overview: {
    ownerName: string;
    plan: string;
    notes: string;
    suspension?: {
      reason: string;
      at: string;
    };
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: "owner" | "staff" | "fitter" | "viewer";
    joinedAt: string;
  }>;
  billing: Array<{
    item: string;
    value: string;
  }>;
  auditTrail: Array<{
    time: string;
    action: string;
    target: string;
    admin: string;
    reason: string;
  }>;
};

export const adminOrganizations: AdminOrganizationRow[] = [
  {
    id: "org_velo_labs",
    name: "Velo Labs",
    type: "bike_shop",
    ownerEmail: "ops@velolabs.eu",
    seatsUsed: 8,
    maxSeats: 12,
    suspended: false,
    billingEmail: "billing@velolabs.eu",
    createdAt: "2024-03-14T09:00:00.000Z",
  },
  {
    id: "org_granite",
    name: "Granite Cycling",
    type: "enterprise",
    ownerEmail: "admin@granite.example",
    seatsUsed: 42,
    maxSeats: 50,
    suspended: false,
    billingEmail: "finance@granite.example",
    createdAt: "2024-09-02T11:30:00.000Z",
  },
  {
    id: "org_northwind",
    name: "Northwind Studio",
    type: "fitter_studio",
    ownerEmail: "hello@northwind.studio",
    seatsUsed: 4,
    maxSeats: 6,
    suspended: true,
    billingEmail: "accounts@northwind.studio",
    createdAt: "2025-02-11T14:20:00.000Z",
  },
];

const sharedAuditTrail = [
  {
    time: "2026-03-20T13:00:00.000Z",
    action: "organization.update",
    target: "Seat count",
    admin: "Ops Team",
    reason: "Adjusted after contract renewal",
  },
  {
    time: "2026-03-18T09:30:00.000Z",
    action: "organization.member_add",
    target: "New fitter",
    admin: "Support Team",
    reason: "Added additional support seat",
  },
];

export const adminOrganizationDetails: Record<string, AdminOrganizationDetail> = {
  org_velo_labs: {
    row: adminOrganizations[0],
    overview: {
      ownerName: "Mila Janssen",
      plan: "Enterprise Ops",
      notes: "Primary shop partner in Belgium",
    },
    members: [
      {
        id: "org_velo_member_1",
        name: "Mila Janssen",
        email: "ops@velolabs.eu",
        role: "owner",
        joinedAt: "2024-03-14T09:00:00.000Z",
      },
      {
        id: "org_velo_member_2",
        name: "Pim de Bruin",
        email: "pim@velolabs.eu",
        role: "staff",
        joinedAt: "2024-06-01T10:00:00.000Z",
      },
    ],
    billing: [
      { item: "Plan", value: "Bike shop partner" },
      { item: "Current seats", value: "8 / 12" },
      { item: "Billing email", value: "billing@velolabs.eu" },
    ],
    auditTrail: sharedAuditTrail,
  },
  org_granite: {
    row: adminOrganizations[1],
    overview: {
      ownerName: "Ruben Hart",
      plan: "Enterprise Max",
      notes: "Corporate wellness pilot with 42 active seats",
    },
    members: [
      {
        id: "org_granite_member_1",
        name: "Ruben Hart",
        email: "admin@granite.example",
        role: "owner",
        joinedAt: "2024-09-02T11:30:00.000Z",
      },
      {
        id: "org_granite_member_2",
        name: "Laura Klein",
        email: "laura@granite.example",
        role: "fitter",
        joinedAt: "2024-10-18T15:00:00.000Z",
      },
    ],
    billing: [
      { item: "Plan", value: "Enterprise" },
      { item: "Current seats", value: "42 / 50" },
      { item: "Billing email", value: "finance@granite.example" },
    ],
    auditTrail: sharedAuditTrail,
  },
  org_northwind: {
    row: adminOrganizations[2],
    overview: {
      ownerName: "Nina Verhoeven",
      plan: "Studio",
      notes: "Suspended pending billing review",
      suspension: {
        reason: "Outstanding invoice",
        at: "2026-03-12T10:45:00.000Z",
      },
    },
    members: [
      {
        id: "org_northwind_member_1",
        name: "Nina Verhoeven",
        email: "hello@northwind.studio",
        role: "owner",
        joinedAt: "2025-02-11T14:20:00.000Z",
      },
      {
        id: "org_northwind_member_2",
        name: "Timo Smit",
        email: "timo@northwind.studio",
        role: "viewer",
        joinedAt: "2025-07-05T09:10:00.000Z",
      },
    ],
    billing: [
      { item: "Plan", value: "Studio" },
      { item: "Current seats", value: "4 / 6" },
      { item: "Billing email", value: "accounts@northwind.studio" },
    ],
    auditTrail: [
      ...sharedAuditTrail,
      {
        time: "2026-03-12T10:45:00.000Z",
        action: "organization.suspend",
        target: "Account",
        admin: "Billing Team",
        reason: "Outstanding invoice",
      },
    ],
  },
};

