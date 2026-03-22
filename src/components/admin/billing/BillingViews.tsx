"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Select,
  Textarea,
  NumberInput,
  SegmentedControl,
  SegmentedControlItem,
  AccessibleDialog,
  Progress,
  Tooltip,
  FieldLabel,
} from "@/components/ui";
import { cn } from "@/utils/cn";

export type PlanEntitlementKey =
  | "can_connect_strava"
  | "can_create_multiple_bikes"
  | "can_export_advanced_report"
  | "can_receive_manual_fit_review"
  | "can_manage_clients"
  | "can_use_shop_team_seats"
  | "can_access_enterprise_reporting";

export type PlanRecord = {
  id: string;
  name: string;
  slug: string;
  tier: "free" | "premium" | "pro" | "bike_shop" | "enterprise";
  description: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  maxBikes: number | null;
  maxSeats: number | null;
  entitlements: Record<PlanEntitlementKey, boolean>;
  isActive: boolean;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  name: string;
  email: string;
  tier: PlanRecord["tier"];
  trialEndsAt?: string;
  joinedAt: string;
  lastLoginAt: string;
  suspended?: boolean;
};

export type BillingEventRecord = {
  id: string;
  subjectType: "user" | "organization";
  subjectName: string;
  eventType: string;
  fromTier?: string;
  toTier?: string;
  reason?: string;
  adminName: string;
  occurredAt: string;
};

const ENTITLEMENT_LABELS: Record<PlanEntitlementKey, string> = {
  can_connect_strava: "Connect Strava",
  can_create_multiple_bikes: "Multiple bikes",
  can_export_advanced_report: "Advanced report export",
  can_receive_manual_fit_review: "Manual fit review",
  can_manage_clients: "Manage clients",
  can_use_shop_team_seats: "Shop team seats",
  can_access_enterprise_reporting: "Enterprise reporting",
};

const plans: PlanRecord[] = [
  {
    id: "plan-free",
    name: "Free",
    slug: "free",
    tier: "free",
    description: "Entry-level rider access with one bike and core fit tools.",
    priceMonthly: 0,
    priceYearly: 0,
    maxBikes: 1,
    maxSeats: 1,
    entitlements: {
      can_connect_strava: false,
      can_create_multiple_bikes: false,
      can_export_advanced_report: false,
      can_receive_manual_fit_review: false,
      can_manage_clients: false,
      can_use_shop_team_seats: false,
      can_access_enterprise_reporting: false,
    },
    isActive: true,
  },
  {
    id: "plan-pro",
    name: "Pro",
    slug: "pro",
    tier: "pro",
    description: "For frequent riders who want deeper analysis and exports.",
    priceMonthly: 1900,
    priceYearly: 19000,
    maxBikes: 6,
    maxSeats: 1,
    entitlements: {
      can_connect_strava: true,
      can_create_multiple_bikes: true,
      can_export_advanced_report: true,
      can_receive_manual_fit_review: true,
      can_manage_clients: false,
      can_use_shop_team_seats: false,
      can_access_enterprise_reporting: false,
    },
    isActive: true,
  },
  {
    id: "plan-premium",
    name: "Premium",
    slug: "premium",
    tier: "premium",
    description: "Best for serious riders and multi-bike owners.",
    priceMonthly: 2900,
    priceYearly: 29000,
    maxBikes: 10,
    maxSeats: 1,
    entitlements: {
      can_connect_strava: true,
      can_create_multiple_bikes: true,
      can_export_advanced_report: true,
      can_receive_manual_fit_review: true,
      can_manage_clients: false,
      can_use_shop_team_seats: false,
      can_access_enterprise_reporting: false,
    },
    isActive: true,
  },
  {
    id: "plan-shop",
    name: "Bike Shop",
    slug: "bike-shop",
    tier: "bike_shop",
    description: "Team plan for fit studios and commercial bike shops.",
    priceMonthly: 7900,
    priceYearly: 79000,
    maxBikes: 50,
    maxSeats: 8,
    entitlements: {
      can_connect_strava: true,
      can_create_multiple_bikes: true,
      can_export_advanced_report: true,
      can_receive_manual_fit_review: true,
      can_manage_clients: true,
      can_use_shop_team_seats: true,
      can_access_enterprise_reporting: false,
    },
    isActive: true,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    slug: "enterprise",
    tier: "enterprise",
    description: "Custom deployments with reporting and service-level support.",
    priceMonthly: null,
    priceYearly: null,
    maxBikes: null,
    maxSeats: null,
    entitlements: {
      can_connect_strava: true,
      can_create_multiple_bikes: true,
      can_export_advanced_report: true,
      can_receive_manual_fit_review: true,
      can_manage_clients: true,
      can_use_shop_team_seats: true,
      can_access_enterprise_reporting: true,
    },
    isActive: false,
  },
];

const subscriptions: SubscriptionRecord[] = [
  {
    id: "sub-1",
    userId: "user-1",
    name: "Alex Morgan",
    email: "alex@example.com",
    tier: "pro",
    trialEndsAt: "2026-04-08",
    joinedAt: "2025-10-12",
    lastLoginAt: "2026-03-20",
  },
  {
    id: "sub-2",
    userId: "user-2",
    name: "Jules Vermeer",
    email: "jules@example.com",
    tier: "premium",
    joinedAt: "2025-12-06",
    lastLoginAt: "2026-03-21",
  },
  {
    id: "sub-3",
    userId: "user-3",
    name: "Northwind Cycles",
    email: "ops@northwindcycles.com",
    tier: "bike_shop",
    joinedAt: "2025-07-21",
    lastLoginAt: "2026-03-20",
  },
  {
    id: "sub-4",
    userId: "user-4",
    name: "Orla Jensen",
    email: "orla@example.com",
    tier: "free",
    suspended: true,
    joinedAt: "2025-03-03",
    lastLoginAt: "2026-03-10",
  },
];

const billingEvents: BillingEventRecord[] = [
  {
    id: "event-1",
    subjectType: "user",
    subjectName: "Alex Morgan",
    eventType: "trial_start",
    toTier: "pro",
    reason: "Promotional onboarding trial",
    adminName: "Morgan Reed",
    occurredAt: "2026-03-18 09:42",
  },
  {
    id: "event-2",
    subjectType: "organization",
    subjectName: "Northwind Cycles",
    eventType: "seat_change",
    fromTier: "6",
    toTier: "8",
    reason: "Seasonal hiring",
    adminName: "Morgan Reed",
    occurredAt: "2026-03-17 16:15",
  },
  {
    id: "event-3",
    subjectType: "user",
    subjectName: "Orla Jensen",
    eventType: "plan_change",
    fromTier: "premium",
    toTier: "free",
    reason: "Expired promotional period",
    adminName: "Tess Novak",
    occurredAt: "2026-03-16 12:05",
  },
];

function money(amount: number | null) {
  if (amount === null) {
    return "Custom";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function tierLabel(tier: PlanRecord["tier"]) {
  return tier.replace("_", " ");
}

function toneClass(isActive: boolean) {
  return isActive
    ? "border-[color:var(--success)]/30 bg-[color:color-mix(in_oklch,var(--success)_12%,var(--card)_88%)] text-[color:var(--foreground)]"
    : "border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]";
}

function Pill({
  children,
  active = true,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
        toneClass(active)
      )}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <FieldLabel label={label} />
      {children}
    </div>
  );
}

export function BillingCatalogView() {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Plan Catalog"
        description="Manual plan definitions that mirror the planned admin contracts."
        actions={
          <Button render={<Link href="/admin/licenses/plans/new" />}>New plan</Button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-[color:var(--border)]/70">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Pill active={plan.isActive}>{tierLabel(plan.tier)}</Pill>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                      Monthly
                    </p>
                    <p className="mt-1 text-lg font-semibold">{money(plan.priceMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                      Yearly
                    </p>
                    <p className="mt-1 text-lg font-semibold">{money(plan.priceYearly)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                      Max bikes
                    </p>
                    <p className="mt-1 text-base font-semibold">{plan.maxBikes ?? "Unlimited"}</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                      Max seats
                    </p>
                    <p className="mt-1 text-base font-semibold">{plan.maxSeats ?? "Unlimited"}</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(plan.entitlements).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-[color:var(--border)] px-3 py-2 text-sm"
                    >
                      <span>{ENTITLEMENT_LABELS[key as PlanEntitlementKey]}</span>
                      <span className={value ? "text-[color:var(--success)]" : "text-[color:var(--muted-foreground)]"}>
                        {value ? "Yes" : "No"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-sm text-[color:var(--muted-foreground)]">
                  Slug: <code>{plan.slug}</code>
                </span>
                <Button variant="outline" render={<Link href={`/admin/licenses/plans/${plan.id}/edit`} />}>
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function PlanFormView({
  mode,
  planId,
}: {
  mode: "new" | "edit";
  planId?: string;
}) {
  const existingPlan = plans.find((plan) => plan.id === planId) ?? plans[1];
  const [name, setName] = useState(existingPlan.name);
  const [slug, setSlug] = useState(existingPlan.slug);
  const [description, setDescription] = useState(existingPlan.description);
  const [tier, setTier] = useState(existingPlan.tier);
  const [priceMonthly, setPriceMonthly] = useState(existingPlan.priceMonthly ?? 0);
  const [priceYearly, setPriceYearly] = useState(existingPlan.priceYearly ?? 0);
  const [maxBikes, setMaxBikes] = useState<number | null>(existingPlan.maxBikes);
  const [maxSeats, setMaxSeats] = useState<number | null>(existingPlan.maxSeats);
  const [isActive, setIsActive] = useState(existingPlan.isActive);
  const [submitted, setSubmitted] = useState(false);
  const [entitlements, setEntitlements] = useState(existingPlan.entitlements);

  const summary = useMemo(
    () => ({
      name,
      slug,
      tier,
      isActive,
      maxBikes: maxBikes ?? "Unlimited",
      maxSeats: maxSeats ?? "Unlimited",
    }),
    [name, slug, tier, isActive, maxBikes, maxSeats]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionCard
        title={mode === "new" ? "Create plan" : `Edit plan: ${existingPlan.name}`}
        description="Plan catalog contract, expressed with the shared Prototyper UI layer."
        actions={<Pill active={isActive}>{isActive ? "Active" : "Inactive"}</Pill>}
      >
        <form
          className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldBlock label="Name">
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </FieldBlock>
              <FieldBlock label="Slug">
                <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
              </FieldBlock>
            </div>
            <Textarea
              label="Description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tier"
                value={tier}
                onChange={(event) => setTier(event.target.value as PlanRecord["tier"])}
                options={[
                  { value: "free", label: "Free" },
                  { value: "premium", label: "Premium" },
                  { value: "pro", label: "Pro" },
                  { value: "bike_shop", label: "Bike Shop" },
                  { value: "enterprise", label: "Enterprise" },
                ]}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberInput
                  label="Monthly price"
                  value={priceMonthly}
                  onChange={(next) => setPriceMonthly(next ?? 0)}
                  unit="cents"
                />
                <NumberInput
                  label="Yearly price"
                  value={priceYearly}
                  onChange={(next) => setPriceYearly(next ?? 0)}
                  unit="cents"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Max bikes"
                value={maxBikes ?? 0}
                onChange={(next) => setMaxBikes(next)}
                allowOutOfRange
              />
              <NumberInput
                label="Max seats"
                value={maxSeats ?? 0}
                onChange={(next) => setMaxSeats(next)}
                allowOutOfRange
              />
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Entitlements</h3>
                <Tooltip content="Toggle the availability flags the plan exposes." />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(entitlements).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setEntitlements((current) => ({
                        ...current,
                        [key]: !value,
                      }))
                    }
                    className={cn(
                      "flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition-colors",
                      value
                        ? "border-[color:var(--primary)] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)]"
                        : "border-[color:var(--border)] bg-[color:var(--secondary)]"
                    )}
                  >
                    <span>{ENTITLEMENT_LABELS[key as PlanEntitlementKey]}</span>
                    <span className="font-medium">{value ? "On" : "Off"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Shape of the payload the backend contract expects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)] p-3 text-sm">
                  <pre className="overflow-auto text-xs leading-6">
{JSON.stringify(summary, null, 2)}
                  </pre>
                </div>
                <Progress value={submitted ? 100 : 62} label="Form completion" />
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button type="submit">Save plan</Button>
              </CardFooter>
            </Card>
            {submitted ? (
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--success)]/30 bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)] p-4 text-sm">
                Plan saved locally. Wire this to the planned `createPlan` / `updatePlan` mutation.
              </div>
            ) : null}
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export function SubscriptionsView() {
  const [planFilter, setPlanFilter] = useState<"all" | PlanRecord["tier"]>("all");
  const [trialFilter, setTrialFilter] = useState<"all" | "active">("all");
  const [suspensionFilter, setSuspensionFilter] = useState<"all" | "suspended">("all");
  const [selectedUser, setSelectedUser] = useState<SubscriptionRecord | null>(null);

  const filtered = subscriptions.filter((subscription) => {
    const planMatches = planFilter === "all" || subscription.tier === planFilter;
    const trialMatches =
      trialFilter === "all" || Boolean(subscription.trialEndsAt) === true;
    const suspensionMatches =
      suspensionFilter === "all" || Boolean(subscription.suspended) === true;
    return planMatches && trialMatches && suspensionMatches;
  });

  return (
    <div className="space-y-6">
      <SectionCard
        title="Subscriptions"
        description="Manual view over the current account tier and trial state."
        actions={
          <SegmentedControl value={planFilter} onValueChange={(value) => setPlanFilter(value as typeof planFilter)} size="sm">
            <SegmentedControlItem value="all" size="sm">All</SegmentedControlItem>
            <SegmentedControlItem value="free" size="sm">Free</SegmentedControlItem>
            <SegmentedControlItem value="pro" size="sm">Pro</SegmentedControlItem>
            <SegmentedControlItem value="premium" size="sm">Premium</SegmentedControlItem>
          </SegmentedControl>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Select
            value={trialFilter}
            onChange={(event) => setTrialFilter(event.target.value as typeof trialFilter)}
            options={[
              { value: "all", label: "All trials" },
              { value: "active", label: "Trial active" },
            ]}
          />
          <Select
            value={suspensionFilter}
            onChange={(event) => setSuspensionFilter(event.target.value as typeof suspensionFilter)}
            options={[
              { value: "all", label: "All accounts" },
              { value: "suspended", label: "Suspended only" },
            ]}
          />
        </div>
        <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Trial end</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((subscription) => (
                <tr key={subscription.id} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-3">{subscription.name}</td>
                  <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{subscription.email}</td>
                  <td className="px-4 py-3">
                    <Pill active>{tierLabel(subscription.tier)}</Pill>
                  </td>
                  <td className="px-4 py-3">{subscription.trialEndsAt ?? "—"}</td>
                  <td className="px-4 py-3">{subscription.joinedAt}</td>
                  <td className="px-4 py-3">{subscription.lastLoginAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedUser(subscription)}>
                        Change plan
                      </Button>
                      <Button size="sm" variant="ghost" render={<Link href={`/admin/users/${subscription.userId}`} />}>
                        View user
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard
        title="Billing events"
        description="Chronological state changes that feed the audit trail."
        actions={
          <Button variant="outline" render={<Link href="/admin/subscriptions/events" />}>
            Open feed
          </Button>
        }
      >
        <div className="space-y-3">
          {billingEvents.map((event) => (
            <div key={event.id} className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[color:var(--border)] p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{event.eventType}</Pill>
                  <span className="font-medium">{event.subjectName}</span>
                  <span className="text-[color:var(--muted-foreground)]">{event.occurredAt}</span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                  {event.fromTier ? `${event.fromTier} → ` : ""}
                  {event.toTier ?? "—"} {event.reason ? `• ${event.reason}` : ""}
                </p>
              </div>
              <span className="text-sm text-[color:var(--muted-foreground)]">{event.adminName}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <AccessibleDialog
        open={selectedUser !== null}
        title={selectedUser ? `Change plan for ${selectedUser.name}` : "Change plan"}
        description="This mirrors the planned admin mutation flow without hitting the backend yet."
        onClose={() => setSelectedUser(null)}
      >
        <div className="space-y-4">
          <Select
            label="New plan"
            value={selectedUser?.tier ?? "pro"}
            onChange={() => undefined}
            options={plans.map((plan) => ({ value: plan.tier, label: plan.name }))}
          />
          <Textarea label="Reason" rows={3} placeholder="Why is this change being made?" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => setSelectedUser(null)}>Apply change</Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}

export function BillingEventsView() {
  const [eventFilter, setEventFilter] = useState<"all" | "plan_change" | "trial_start" | "trial_end" | "seat_change">("all");

  const rows = billingEvents.filter((event) => eventFilter === "all" || event.eventType === eventFilter);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Billing events"
        description="Read-only state changes for plans, trials, seats, and manual billing adjustments."
        actions={
          <Select
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value as typeof eventFilter)}
            options={[
              { value: "all", label: "All events" },
              { value: "plan_change", label: "Plan changes" },
              { value: "trial_start", label: "Trial starts" },
              { value: "trial_end", label: "Trial ends" },
              { value: "seat_change", label: "Seat changes" },
            ]}
          />
        }
      >
        <div className="space-y-3">
          {rows.map((event) => (
            <div key={event.id} className="grid gap-2 rounded-[var(--radius-md)] border border-[color:var(--border)] p-4 md:grid-cols-[1.5fr_1fr_1fr] md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Pill>{event.eventType}</Pill>
                  <span className="font-medium">{event.subjectName}</span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                  {event.reason ?? "No reason provided"}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-[color:var(--muted-foreground)]">Change</p>
                <p>{event.fromTier ? `${event.fromTier} → ` : ""}{event.toTier ?? "—"}</p>
              </div>
              <div className="text-sm text-[color:var(--muted-foreground)]">
                <p>{event.adminName}</p>
                <p>{event.occurredAt}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function TrialManagementView() {
  const trialActive = true;
  const [trialPlan, setTrialPlan] = useState("pro");
  const [days, setDays] = useState(14);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trial management</CardTitle>
        <CardDescription>Local prototype of the planned trial workflow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {trialActive ? (
          <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] p-4">
            <p className="text-sm font-medium">Active trial expires on 2026-04-08</p>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              Extend or end the trial in the planned billing mutation layer.
            </p>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Plan for trial"
            value={trialPlan}
            onChange={(event) => setTrialPlan(event.target.value)}
            options={plans.filter((plan) => plan.tier === "pro" || plan.tier === "premium").map((plan) => ({
              value: plan.tier,
              label: plan.name,
            }))}
          />
          <NumberInput label="Duration in days" value={days} onChange={(next) => setDays(next ?? 0)} />
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">End trial now</Button>
        <Button>Start / extend trial</Button>
      </CardFooter>
    </Card>
  );
}
