import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bike,
  Building2,
  CalendarDays,
  FlaskConical,
  LayoutDashboard,
  MessageSquare,
  ReceiptText,
  Rocket,
  Ruler,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export type AdminNavigationItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

export const adminNavigationGroups: AdminNavigationGroup[] = [
  {
    label: "Command center",
    items: [
      {
        label: "Overview",
        href: "/admin/overview",
        description: "Operational summary and queue health",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        description: "Admin accounts and rider profiles",
        icon: Users,
      },
      {
        label: "Organizations",
        href: "/admin/organizations",
        description: "Accounts and staff relationships",
        icon: Building2,
      },
    ],
  },
  {
    label: "Rider data",
    items: [
      {
        label: "Rider Data",
        href: "/admin/rider-data",
        description: "Measurement review and risk flags",
        icon: Users,
      },
      {
        label: "Bikes",
        href: "/admin/bikes",
        description: "Owned bikes and geometry links",
        icon: Bike,
      },
    ],
  },
  {
    label: "Technical",
    items: [
      {
        label: "Geometry",
        href: "/admin/geometry",
        description: "Brands, models, and record imports",
        icon: Ruler,
      },
      {
        label: "Fit Engine",
        href: "/admin/fit-engine",
        description: "Version governance and rule sets",
        icon: FlaskConical,
      },
      {
        label: "Fit Runs",
        href: "/admin/fit-runs",
        description: "Trace review queue and session history",
        icon: Activity,
      },
    ],
  },
  {
    label: "Product",
    items: [
      {
        label: "Feedback",
        href: "/admin/feedback",
        description: "Support requests and feature ideas",
        icon: MessageSquare,
      },
      {
        label: "Feature Requests",
        href: "/admin/feedback/feature-requests",
        description: "Product ideas and pipeline requests",
        icon: MessageSquare,
      },
      {
        label: "Releases",
        href: "/admin/releases",
        description: "Ship, annotate, and roll back",
        icon: Rocket,
      },
      {
        label: "Release Calendar",
        href: "/admin/releases/calendar",
        description: "Upcoming rollout schedule",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Licenses",
        href: "/admin/licenses",
        description: "Plan catalog and entitlements",
        icon: ReceiptText,
      },
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        description: "Trials, tiers, and billing state",
        icon: SlidersHorizontal,
      },
      {
        label: "Messages",
        href: "/admin/messages",
        description: "Dashboard announcements and targeting",
        icon: MessageSquare,
      },
      {
        label: "Audit",
        href: "/admin/audit",
        description: "Sensitive change history and exports",
        icon: ShieldCheck,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        description: "Roles, feature flags, and system state",
        icon: Settings,
      },
    ],
  },
];

export function isAdminNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminNavigationItem(pathname: string) {
  for (const group of adminNavigationGroups) {
    for (const item of group.items) {
      if (isAdminNavigationActive(pathname, item.href)) {
        return item;
      }
    }
  }

  return adminNavigationGroups[0]?.items[0] ?? null;
}
