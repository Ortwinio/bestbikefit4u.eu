"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Component, type ErrorInfo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  AccessibleDialog,
  Button,
  EmptyState,
  ErrorState,
  FieldLabel,
  Input,
  LoadingState,
  NumberInput,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  AdminMetricCard,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { formatAdminDateTime } from "@/components/admin/shared/admin-format";
import {
  BILLING_MANAGEMENT_ROLES,
  billingPlanTone,
  billingSubscriptionTone,
  canManageBilling,
  formatBillingInterval,
  formatBillingMoney,
  formatBillingProviderKind,
  formatBillingPlanStatus,
  formatBillingSubscriptionSubject,
  formatBillingTier,
  getBillingEventStripeSummary,
  getBillingPlanStripePriceId,
  getStripeBillingSnapshot,
  summarizeBillingEventPayload,
  type BillingEvent,
  type BillingPlan,
  type BillingSubscription,
  type StripeBillingSnapshot,
} from "./billing-live-data";

type BillingTier = BillingPlan["tier"];
type BillingInterval = NonNullable<BillingPlan["billingInterval"]>;
type SubscriptionStatus = BillingSubscription["status"];

const planTierOptions: Array<{ value: BillingTier; label: string }> = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
  { value: "bike_shop", label: "Bike shop" },
  { value: "enterprise", label: "Enterprise" },
];

const billingIntervalOptions: Array<{ value: BillingInterval; label: string }> = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const subscriptionStatusOptions: Array<{ value: "all" | SubscriptionStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "trialing", label: "Trialing" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past due" },
  { value: "canceled", label: "Canceled" },
  { value: "expired", label: "Expired" },
];

const billingEventTypes = [
  "all",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "subscription_plan_changed",
  "subscription_canceled",
  "subscription_resumed",
  "trial_started",
] as const;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function BillingReadOnlyNotice({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_86%,var(--background)_14%)] p-4">
      <div className="flex items-start gap-3">
        <AdminStatusPill tone="warning">Read only</AdminStatusPill>
        <div className="min-w-0 space-y-2">
          <div>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">{title}</p>
            <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">{description}</p>
          </div>
          {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

function BillingLoadingShell({ label }: { label: string }) {
  return <LoadingState label={label} />;
}

class BillingErrorBoundary extends Component<
  {
    title: string;
    description: string;
    children: ReactNode;
  },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Billing view failed to render:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title={this.props.title}
          description={`${this.props.description} ${this.state.error.message}`}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

function BillingField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} />
      {children}
    </div>
  );
}

function BillingSupportField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-[color:var(--foreground)]">{value || "—"}</p>
    </div>
  );
}

function BillingProviderPill({ snapshot }: { snapshot: StripeBillingSnapshot }) {
  return (
    <AdminStatusPill tone={snapshot.providerKind === "stripe" ? "info" : "neutral"}>
      {formatBillingProviderKind(snapshot.providerKind)}
    </AdminStatusPill>
  );
}

function formatStripePeriod(snapshot: StripeBillingSnapshot) {
  if (!snapshot.currentPeriodStart && !snapshot.currentPeriodEnd) {
    return "—";
  }

  return `${formatAdminDateTime(snapshot.currentPeriodStart)} - ${formatAdminDateTime(snapshot.currentPeriodEnd)}`;
}

function BillingCatalogContent() {
  const currentAdmin = useQuery(api.admin.queries.getCurrentAdminUser);
  const plans = useQuery(api.admin.queries.listPlans);
  const canManage = canManageBilling(currentAdmin?.adminRole);

  if (currentAdmin === undefined || plans === undefined) {
    return <BillingLoadingShell label="Loading billing plans..." />;
  }

  const roleName = currentAdmin?.adminRole ?? "unknown";
  const activePlans = plans.filter((plan: BillingPlan) => plan.isActive);

  return (
    <div className="space-y-6">
      {!canManage ? (
        <BillingReadOnlyNotice
          title="Billing is read only for this role"
          description={`Your current admin role (${roleName}) can inspect live billing data, but edits are restricted to ${Array.from(BILLING_MANAGEMENT_ROLES).join(" and ")}.`}
          action={
            <Button render={<Link href="/admin/subscriptions" />} variant="outline">
              Open subscriptions
            </Button>
          }
        />
      ) : null}

      {plans.length === 0 ? (
        <EmptyState
          title="No billing plans yet"
          description="Create the first live billing plan in Convex."
          action={
            canManage ? (
              <Button render={<Link href="/admin/licenses/plans/new" />}>Create plan</Button>
            ) : null
          }
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <AdminMetricCard label="Total plans" value={plans.length} description="Live plan records in Convex." />
            <AdminMetricCard label="Active plans" value={activePlans.length} description="Currently assignable plans." />
            <AdminMetricCard
              label="Custom-priced plans"
              value={plans.filter((plan: BillingPlan) => plan.billingInterval === "custom" || plan.priceCents === undefined).length}
              description="Manual pricing or contract-driven plans."
            />
          </section>

          <AdminSectionCard
            title="Plan catalog"
            description="Live plan definitions and pricing contracts."
            actions={
              canManage ? (
                <Button render={<Link href="/admin/licenses/plans/new" />}>Create plan</Button>
              ) : (
                <AdminStatusPill tone="warning">Read only</AdminStatusPill>
              )
            }
          >
            <AdminTable>
              <AdminTableHead columns={["Name", "Tier", "Price", "Stripe price", "Seats", "Status", "Updated", "Action"]} />
              <tbody>
                {plans.map((plan: BillingPlan) => {
                  const stripePriceId = getBillingPlanStripePriceId(plan);
                  return (
                    <AdminTableRow key={String(plan._id)}>
                      <AdminTableCell className="font-medium">{plan.name}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={billingPlanTone(plan.tier)}>{formatBillingTier(plan.tier)}</AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>
                        {formatBillingMoney(plan.priceCents)}
                        {formatBillingInterval(plan.billingInterval)}
                      </AdminTableCell>
                      <AdminTableCell className="max-w-[14rem] break-words">{stripePriceId ?? "Manual / not linked"}</AdminTableCell>
                      <AdminTableCell>{plan.seatLimit ?? "—"}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={plan.isActive ? "success" : "neutral"}>
                          {formatBillingPlanStatus(plan.isActive)}
                        </AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>{formatAdminDateTime(plan.updatedAt ?? plan.createdAt)}</AdminTableCell>
                      <AdminTableCell>
                        <Button
                          render={<Link href={`/admin/licenses/plans/${String(plan._id)}/edit`} />}
                          size="sm"
                          variant="outline"
                        >
                          {canManage ? "Edit" : "View"}
                        </Button>
                      </AdminTableCell>
                    </AdminTableRow>
                  );
                })}
              </tbody>
            </AdminTable>
          </AdminSectionCard>
        </>
      )}
    </div>
  );
}

function PlanFormContent({ mode, planId }: { mode: "new" | "edit"; planId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const currentAdmin = useQuery(api.admin.queries.getCurrentAdminUser);
  const canManage = canManageBilling(currentAdmin?.adminRole);
  const detail = useQuery(
    api.admin.queries.getPlanDetail,
    mode === "edit" && planId ? { planId: planId as Id<"plans"> } : "skip"
  );
  const createPlan = useMutation(api.admin.mutations.createPlan);
  const updatePlan = useMutation(api.admin.mutations.updatePlan);

  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [tier, setTier] = useState<BillingTier>("free");
  const [priceCents, setPriceCents] = useState<number | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("month");
  const [seatLimit, setSeatLimit] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !detail?.plan) {
      return;
    }

    setKey(detail.plan.key);
    setName(detail.plan.name);
    setTier(detail.plan.tier);
    setPriceCents(detail.plan.priceCents ?? null);
    setBillingInterval(detail.plan.billingInterval ?? "custom");
    setSeatLimit(detail.plan.seatLimit ?? null);
    setIsActive(detail.plan.isActive);
  }, [detail?.plan, mode]);

  if (currentAdmin === undefined || (mode === "edit" && detail === undefined)) {
    return <BillingLoadingShell label={mode === "new" ? "Loading plan form..." : "Loading plan..."} />;
  }

  if (mode === "edit" && !detail?.plan) {
    return (
      <EmptyState
        title="Plan not found"
        description="Convex returned no live plan for this route."
        action={
          <Button render={<Link href="/admin/licenses" />} variant="outline">
            Back to license catalog
          </Button>
        }
      />
    );
  }

  const roleName = currentAdmin?.adminRole ?? "unknown";
  if (!canManage) {
    return (
      <BillingReadOnlyNotice
        title={mode === "new" ? "Plan creation is restricted" : "Plan editing is restricted"}
        description={`The current admin role (${roleName}) can view live plan data, but only super_admin and billing_admin can create or update billing plans.`}
        action={
          <>
            <Button render={<Link href="/admin/licenses" />} variant="outline">
              Back to license catalog
            </Button>
            {mode === "edit" ? (
              <Button render={<Link href="/admin/subscriptions" />} variant="secondary">
                Review subscriptions
              </Button>
            ) : null}
          </>
        }
      />
    );
  }

  const preview = {
    key: key.trim(),
    name: name.trim(),
    tier,
    priceCents: priceCents ?? undefined,
    billingInterval,
    seatLimit: seatLimit ?? undefined,
    isActive,
  };

  const relatedSubscriptions = detail?.subscriptions.length ?? 0;
  const relatedEvents = detail?.billingEvents.length ?? 0;

  const handleSubmit = async () => {
    if (!key.trim() || !name.trim()) {
      toast.error({ description: "Key and name are required." });
      return;
    }

    setIsSaving(true);
    try {
      if (mode === "new") {
        await createPlan({
          key: key.trim(),
          name: name.trim(),
          tier,
          priceCents: priceCents ?? undefined,
          billingInterval,
          seatLimit: seatLimit ?? undefined,
          isActive,
        });
        toast.success({ description: "Billing plan created." });
      } else if (planId) {
        await updatePlan({
          planId: planId as Id<"plans">,
          name: name.trim(),
          tier,
          priceCents: priceCents ?? undefined,
          billingInterval,
          seatLimit: seatLimit ?? undefined,
          isActive,
        });
        toast.success({ description: "Billing plan updated." });
      }

      router.push("/admin/licenses");
      router.refresh();
    } catch (error) {
      toast.error({ description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminSectionCard
      title={mode === "new" ? "Create plan" : "Edit plan"}
      description="Persisted to live Convex billing plans."
      actions={<AdminStatusPill tone={isActive ? "success" : "neutral"}>{formatBillingPlanStatus(isActive)}</AdminStatusPill>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <BillingField label="Key">
            <Input
              value={key}
              onChange={(event) => setKey(event.currentTarget.value)}
              disabled={mode === "edit"}
              placeholder="pro-monthly"
            />
          </BillingField>
          <BillingField label="Name">
            <Input value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder="Pro" />
          </BillingField>
          <Select
            label="Tier"
            value={tier}
            onChange={(event) => setTier(event.currentTarget.value as BillingTier)}
            options={planTierOptions.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Select
            label="Billing interval"
            value={billingInterval}
            onChange={(event) => setBillingInterval(event.currentTarget.value as BillingInterval)}
            options={billingIntervalOptions.map((option) => ({ value: option.value, label: option.label }))}
          />
          <NumberInput
            label="Price cents"
            value={priceCents}
            onChange={setPriceCents}
            min={0}
            helperText="Leave empty for custom pricing."
          />
          <NumberInput
            label="Seat limit"
            value={seatLimit}
            onChange={setSeatLimit}
            min={0}
            helperText="Leave empty for unlimited seats."
          />
          <div className="space-y-1.5 md:col-span-2">
            <FieldLabel label="Plan active" />
            <SegmentedControl value={isActive ? "active" : "inactive"} onValueChange={(value) => setIsActive(value === "active")}>
              <SegmentedControlItem value="active">Active</SegmentedControlItem>
              <SegmentedControlItem value="inactive">Inactive</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button isLoading={isSaving} onClick={() => void handleSubmit()}>
              {mode === "new" ? "Create plan" : "Save changes"}
            </Button>
            <Button render={<Link href="/admin/licenses" />} variant="outline">
              Cancel
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <AdminMetricCard label="Related subscriptions" value={relatedSubscriptions} description="Loaded from the live plan detail query." />
          <AdminMetricCard label="Related events" value={relatedEvents} description="Loaded from the live plan detail query." />
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">Payload preview</p>
              <AdminStatusPill tone={billingPlanTone(tier)}>{formatBillingTier(tier)}</AdminStatusPill>
            </div>
            <pre className="overflow-auto rounded-[var(--radius-md)] bg-[color:var(--secondary)] p-3 text-xs leading-6">
{JSON.stringify(preview, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </AdminSectionCard>
  );
}

function SubscriptionsContent() {
  const router = useRouter();
  const toast = useToast();
  const currentAdmin = useQuery(api.admin.queries.getCurrentAdminUser);
  const plans = useQuery(api.admin.queries.listPlans);
  const canManage = canManageBilling(currentAdmin?.adminRole);
  const [status, setStatus] = useState<"all" | SubscriptionStatus>("all");
  const [planFilter, setPlanFilter] = useState<"all" | string>("all");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState<"change" | "cancel" | "resume" | null>(null);
  const changeSubscriptionPlan = useMutation(api.admin.mutations.changeSubscriptionPlan);
  const cancelSubscription = useMutation(api.admin.mutations.cancelSubscription);
  const resumeSubscription = useMutation(api.admin.mutations.resumeSubscription);
  const subscriptionResult = usePaginatedQuery(
    api.admin.queries.listSubscriptions,
    { status: status === "all" ? undefined : status },
    { initialNumItems: 20 }
  );
  const selectedSubscriptionDetail = useQuery(
    api.admin.queries.getSubscriptionDetail,
    selectedSubscriptionId ? { subscriptionId: selectedSubscriptionId as Id<"subscriptions"> } : "skip"
  );

  const planMap = useMemo(
    () => new Map((plans ?? []).map((plan: BillingPlan) => [String(plan._id), plan] as const)),
    [plans]
  );
  const subscriptions = subscriptionResult.results as BillingSubscription[];
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription: BillingSubscription) => {
      return planFilter === "all" || String(subscription.planId) === planFilter;
    });
  }, [planFilter, subscriptions]);
  const selectedSubscription =
    filteredSubscriptions.find((subscription: BillingSubscription) => String(subscription._id) === selectedSubscriptionId) ?? null;

  useEffect(() => {
    const currentPlanId = selectedSubscriptionDetail?.subscription?.planId ?? selectedSubscription?.planId;
    if (!currentPlanId) {
      return;
    }

    setSelectedPlanId(String(currentPlanId));
  }, [selectedSubscription?._id, selectedSubscription?.planId, selectedSubscriptionDetail?.subscription?.planId]);

  if (currentAdmin === undefined || plans === undefined || subscriptionResult.status === "LoadingFirstPage") {
    return <BillingLoadingShell label="Loading subscriptions..." />;
  }

  const roleName = currentAdmin?.adminRole ?? "unknown";
  const handleMutation = async (action: "change" | "cancel" | "resume", handler: () => Promise<void>) => {
    setPendingAction(action);
    try {
      await handler();
      toast.success({ description: "Subscription updated." });
      router.refresh();
      setSelectedSubscriptionId(null);
      setReason("");
    } catch (error) {
      toast.error({ description: getErrorMessage(error) });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {!canManage ? (
        <BillingReadOnlyNotice
          title="Subscription lifecycle actions are restricted"
          description={`The current admin role (${roleName}) can inspect live subscription data, but only super_admin and billing_admin can change plans or cancel subscriptions.`}
        />
      ) : null}

      <AdminSectionCard title="Subscription filters" description="Live subscriptions from Convex billing records.">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.currentTarget.value as "all" | SubscriptionStatus)}
            options={subscriptionStatusOptions.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Select
            label="Plan"
            value={planFilter}
            onChange={(event) => setPlanFilter(event.currentTarget.value)}
            options={[
              { value: "all", label: "All plans" },
              ...plans.map((plan: BillingPlan) => ({
                value: String(plan._id),
                label: `${plan.name} (${formatBillingTier(plan.tier)})`,
              })),
            ]}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--muted-foreground)]">
          <span>
            Showing {filteredSubscriptions.length} loaded subscription{filteredSubscriptions.length === 1 ? "" : "s"}
            {subscriptionResult.status === "LoadingMore" ? " while fetching more..." : ""}
          </span>
          <button
            type="button"
            className="font-medium text-[color:var(--foreground)] hover:underline"
            onClick={() => {
              setStatus("all");
              setPlanFilter("all");
            }}
          >
            Clear filters
          </button>
        </div>
      </AdminSectionCard>

      {filteredSubscriptions.length === 0 ? (
        <EmptyState
          title="No subscriptions found"
          description="No live subscription rows matched the current filters."
        />
      ) : (
        <AdminSectionCard title="Subscriptions" description="Plan assignments and lifecycle management.">
          <AdminTable>
            <AdminTableHead columns={["Subject", "Plan", "Status", "Provider", "Stripe subscription", "Period", "Canceling", "Action"]} />
            <tbody>
              {filteredSubscriptions.map((subscription: BillingSubscription) => {
                const plan = planMap.get(String(subscription.planId));
                const snapshot = getStripeBillingSnapshot(subscription);
                return (
                  <AdminTableRow key={String(subscription._id)}>
                    <AdminTableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{formatBillingSubscriptionSubject(subscription)}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">ID {String(subscription._id)}</div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{plan?.name ?? String(subscription.planId)}</AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={billingSubscriptionTone(subscription.status)}>
                        {subscription.status}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell><BillingProviderPill snapshot={snapshot} /></AdminTableCell>
                    <AdminTableCell className="max-w-[13rem] break-words">{snapshot.subscriptionId ?? "—"}</AdminTableCell>
                    <AdminTableCell>{formatStripePeriod(snapshot)}</AdminTableCell>
                    <AdminTableCell>{snapshot.cancelAtPeriodEnd === undefined ? "—" : snapshot.cancelAtPeriodEnd ? "Yes" : "No"}</AdminTableCell>
                    <AdminTableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSubscriptionId(String(subscription._id))}
                      >
                        {canManage ? "Manage" : "View"}
                      </Button>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })}
            </tbody>
          </AdminTable>

          {subscriptionResult.status === "CanLoadMore" ? (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => subscriptionResult.loadMore(20)}>
                Load more
              </Button>
            </div>
          ) : null}
        </AdminSectionCard>
      )}

      <AccessibleDialog
        open={Boolean(selectedSubscription)}
        onClose={() => {
          setSelectedSubscriptionId(null);
          setReason("");
        }}
        title={
          selectedSubscriptionDetail
            ? `Manage ${formatBillingSubscriptionSubject(selectedSubscriptionDetail.subscription)}`
            : "Manage subscription"
        }
        description="Apply a plan change or lifecycle update to the selected live subscription."
      >
        {selectedSubscription && selectedSubscriptionDetail === undefined ? (
          <BillingLoadingShell label="Loading subscription detail..." />
        ) : selectedSubscription && selectedSubscriptionDetail === null ? (
          <EmptyState
            title="Subscription not found"
            description="Convex returned no live subscription detail for the selected row."
          />
        ) : selectedSubscription && selectedSubscriptionDetail ? (
          (() => {
            const snapshot = getStripeBillingSnapshot(
              selectedSubscriptionDetail.subscription,
              selectedSubscriptionDetail.user
            );
            const isStripeBacked = snapshot.providerKind === "stripe";

            return (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Current subject</p>
                <p className="mt-1 text-sm font-medium">{formatBillingSubscriptionSubject(selectedSubscriptionDetail.subscription)}</p>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                  Plan ID {String(selectedSubscriptionDetail.subscription.planId)}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Lifecycle</p>
                <p className="mt-1 text-sm font-medium">{selectedSubscriptionDetail.subscription.status}</p>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                  Starts {formatAdminDateTime(selectedSubscriptionDetail.subscription.startsAt)} · Ends {formatAdminDateTime(selectedSubscriptionDetail.subscription.endsAt)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <BillingSupportField label="Billing source" value={<BillingProviderPill snapshot={snapshot} />} />
              <BillingSupportField label="Stripe customer ID" value={snapshot.customerId} />
              <BillingSupportField label="Stripe subscription ID" value={snapshot.subscriptionId} />
              <BillingSupportField label="Stripe price ID" value={snapshot.priceId} />
              <BillingSupportField label="Current period" value={formatStripePeriod(snapshot)} />
              <BillingSupportField
                label="Cancel at period end"
                value={snapshot.cancelAtPeriodEnd === undefined ? "—" : snapshot.cancelAtPeriodEnd ? "Yes" : "No"}
              />
              <BillingSupportField label="Latest invoice" value={snapshot.latestInvoiceId} />
            </div>

            {selectedSubscriptionDetail.user || selectedSubscriptionDetail.organization ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">User</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedSubscriptionDetail.user
                      ? selectedSubscriptionDetail.user.displayName ?? selectedSubscriptionDetail.user.name ?? selectedSubscriptionDetail.user.email ?? "Unknown"
                      : "—"}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Organization</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedSubscriptionDetail.organization ? selectedSubscriptionDetail.organization.name : "—"}
                  </p>
                </div>
              </div>
            ) : null}

            {!canManage ? (
              <BillingReadOnlyNotice
                title="This subscription can only be inspected"
                description="The selected subscription is live, but plan changes and lifecycle mutations are restricted to super_admin and billing_admin."
              />
            ) : isStripeBacked ? (
              <BillingReadOnlyNotice
                title="Stripe-backed subscription"
                description="Use Stripe Customer Portal or Stripe Dashboard for payment method, cancellation, invoice, and subscription changes. The Convex row should update from verified Stripe webhooks, not manual lifecycle buttons."
              />
            ) : (
              <div className="space-y-4">
                <BillingReadOnlyNotice
                  title="Manual subscription controls"
                  description="These actions only update Convex manual billing records and write admin audit logs. They do not call Stripe."
                />
                <Select
                  label="New plan"
                  value={selectedPlanId}
                  onChange={(event) => setSelectedPlanId(event.currentTarget.value)}
                  options={plans.map((plan: BillingPlan) => ({
                    value: String(plan._id),
                    label: `${plan.name} (${formatBillingTier(plan.tier)})`,
                  }))}
                />
                <Textarea
                  label="Reason"
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.currentTarget.value)}
                  placeholder="Why is this change being made?"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    isLoading={pendingAction === "change"}
                    onClick={() =>
                      void handleMutation("change", async () => {
                        await changeSubscriptionPlan({
                          subscriptionId: selectedSubscriptionDetail.subscription._id as Id<"subscriptions">,
                          planId: selectedPlanId as Id<"plans">,
                          reason: reason.trim() || "Admin subscription plan change",
                        });
                      })
                    }
                  >
                    Change plan
                  </Button>
                  {selectedSubscriptionDetail.subscription.status === "canceled" ? (
                    <Button
                      variant="outline"
                      isLoading={pendingAction === "resume"}
                      onClick={() =>
                        void handleMutation("resume", async () => {
                          await resumeSubscription({
                            subscriptionId: selectedSubscriptionDetail.subscription._id as Id<"subscriptions">,
                            reason: reason.trim() || "Admin subscription resume",
                          });
                        })
                      }
                    >
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      isLoading={pendingAction === "cancel"}
                      onClick={() =>
                        void handleMutation("cancel", async () => {
                          await cancelSubscription({
                            subscriptionId: selectedSubscriptionDetail.subscription._id as Id<"subscriptions">,
                            reason: reason.trim() || "Admin subscription cancel",
                          });
                        })
                      }
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}

            {selectedSubscriptionDetail.events.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Live billing events</p>
                <div className="space-y-2">
                  {selectedSubscriptionDetail.events.map((event: BillingEvent) => (
                    <div
                      key={String(event._id)}
                      className="rounded-[var(--radius-md)] border border-[color:var(--border)] p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminStatusPill tone="neutral">{event.eventType.replaceAll("_", " ")}</AdminStatusPill>
                        <span className="text-[color:var(--muted-foreground)]">{formatAdminDateTime(event.occurredAt)}</span>
                      </div>
                      <p className="mt-2 text-[color:var(--muted-foreground)]">{summarizeBillingEventPayload(event.payloadJson)}</p>
                      {getBillingEventStripeSummary(event) ? (
                        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                          {getBillingEventStripeSummary(event)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
            );
          })()
        ) : null}
      </AccessibleDialog>
    </div>
  );
}

function BillingEventsContent() {
  const [eventFilter, setEventFilter] = useState<(typeof billingEventTypes)[number]>("all");
  const result = usePaginatedQuery(api.admin.queries.listBillingEvents, {}, { initialNumItems: 30 });

  if (result.status === "LoadingFirstPage") {
    return <BillingLoadingShell label="Loading billing events..." />;
  }

  const rows = result.results.filter((event: BillingEvent) => eventFilter === "all" || event.eventType === eventFilter);

  if (rows.length === 0) {
    return <EmptyState title="No billing events" description="No live billing events matched the current filter." />;
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Billing event feed"
        description="Chronological live billing changes and lifecycle events."
        actions={
          <Select
            aria-label="Billing event filter"
            value={eventFilter}
            onChange={(event) => setEventFilter(event.currentTarget.value as (typeof billingEventTypes)[number])}
            options={billingEventTypes.map((value) => ({
              value,
              label: value === "all" ? "All events" : value.replaceAll("_", " "),
            }))}
          />
        }
      >
        <AdminTable>
          <AdminTableHead columns={["Time", "Event", "Subscription", "User", "Organization", "Payload"]} />
          <tbody>
            {rows.map((event: BillingEvent) => {
              const stripeSummary = getBillingEventStripeSummary(event);
              return (
                <AdminTableRow key={String(event._id)}>
                  <AdminTableCell className="font-medium">{formatAdminDateTime(event.occurredAt)}</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone="neutral">{event.eventType.replaceAll("_", " ")}</AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{event.subscriptionId ? String(event.subscriptionId) : "—"}</AdminTableCell>
                  <AdminTableCell>
                    {event.userId ? <Link href={`/admin/users/${String(event.userId)}`}>{String(event.userId)}</Link> : "—"}
                  </AdminTableCell>
                  <AdminTableCell>
                    {event.organizationId ? (
                      <Link href={`/admin/organizations/${String(event.organizationId)}`}>{String(event.organizationId)}</Link>
                    ) : (
                      "—"
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="max-w-[28rem] break-words text-[color:var(--muted-foreground)]">
                    <div>{summarizeBillingEventPayload(event.payloadJson)}</div>
                    {stripeSummary ? <div className="mt-1 text-xs">{stripeSummary}</div> : null}
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </tbody>
        </AdminTable>

        {result.status === "CanLoadMore" ? (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => result.loadMore(30)}>
              Load more
            </Button>
          </div>
        ) : null}
      </AdminSectionCard>
    </div>
  );
}

export function BillingCatalogView() {
  return (
    <BillingErrorBoundary
      title="Could not load billing plans"
      description="Convex returned an unexpected error while loading the live billing catalog."
    >
      <BillingCatalogContent />
    </BillingErrorBoundary>
  );
}

export function PlanFormView({
  mode,
  planId,
}: {
  mode: "new" | "edit";
  planId?: string;
}) {
  return (
    <BillingErrorBoundary
      title={mode === "new" ? "Could not open plan form" : "Could not load billing plan"}
      description="Convex returned an unexpected error while loading the live billing plan form."
    >
      <PlanFormContent mode={mode} planId={planId} />
    </BillingErrorBoundary>
  );
}

export function SubscriptionsView() {
  return (
    <BillingErrorBoundary
      title="Could not load billing subscriptions"
      description="Convex returned an unexpected error while loading the live subscription list."
    >
      <SubscriptionsContent />
    </BillingErrorBoundary>
  );
}

export function BillingEventsView() {
  return (
    <BillingErrorBoundary
      title="Could not load billing events"
      description="Convex returned an unexpected error while loading the live billing event feed."
    >
      <BillingEventsContent />
    </BillingErrorBoundary>
  );
}
