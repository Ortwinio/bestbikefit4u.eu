import { afterEach, describe, expect, it, vi } from "vitest";
import { processWebhookEvent } from "../mutations";

type Row = Record<string, unknown> & { _id: string };
type Tables = Record<string, Row[]>;

function makeCtx(initial: Tables) {
  const tables: Tables = Object.fromEntries(
    Object.entries(initial).map(([table, rows]) => [table, rows.map((row) => ({ ...row }))])
  );
  let nextId = 1;

  const matches = (row: Row, predicate?: { field: string; value: unknown }) =>
    !predicate || row[predicate.field] === predicate.value;

  const db = {
    get: vi.fn(async (id: string) => {
      for (const rows of Object.values(tables)) {
        const found = rows.find((row) => row._id === id);
        if (found) return found;
      }
      return null;
    }),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      for (const rows of Object.values(tables)) {
        const found = rows.find((row) => row._id === id);
        if (found) {
          Object.assign(found, patch);
          return;
        }
      }
    }),
    insert: vi.fn(async (table: string, row: Record<string, unknown>) => {
      const id = `${table}_${nextId++}`;
      tables[table] ??= [];
      tables[table].push({ _id: id, ...row });
      return id;
    }),
    query: vi.fn((table: string) => {
      let predicate: { field: string; value: unknown } | undefined;
      return {
        withIndex: (_name: string, cb: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
          cb({
            eq: (field: string, value: unknown) => {
              predicate = { field, value };
              return predicate;
            },
          });
          return {
            first: async () => tables[table]?.find((row) => matches(row, predicate)) ?? null,
            collect: async () => (tables[table] ?? []).filter((row) => matches(row, predicate)),
          };
        },
        first: async () => tables[table]?.[0] ?? null,
        collect: async () => tables[table] ?? [],
      };
    }),
  };

  return { ctx: { db }, tables };
}

function baseTables(): Tables {
  return {
    users: [{ _id: "user_1", tier: "free", email: "rider@example.com" }],
    plans: [
      {
        _id: "plan_pro",
        key: "pro",
        name: "Pro",
        tier: "pro",
        stripePriceId: "price_pro",
        isActive: true,
      },
    ],
    subscriptions: [],
    billing_events: [],
    stripe_events: [],
  };
}

async function runEvent(ctx: unknown, event: Record<string, unknown>) {
  const handler = (processWebhookEvent as unknown as {
    _handler: (ctx: unknown, args: { payloadJson: string }) => Promise<Record<string, unknown>>;
  })._handler;
  return await handler(ctx, { payloadJson: JSON.stringify(event) });
}

describe("stripe webhook processing", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("stores events idempotently and grants access for active subscriptions", async () => {
    const { ctx, tables } = makeCtx(baseTables());
    const event = {
      id: "evt_active",
      type: "customer.subscription.created",
      livemode: false,
      created: 1760000000,
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "active",
          metadata: { userId: "user_1" },
          current_period_start: 1760000000,
          current_period_end: 1762592000,
          items: { data: [{ price: { id: "price_pro" } }] },
        },
      },
    };

    const first = await runEvent(ctx, event);
    const replay = await runEvent(ctx, event);

    expect(first).toMatchObject({ status: "processed", welcomeUserId: "user_1" });
    expect(replay).toEqual({ status: "duplicate" });
    expect(tables.stripe_events).toHaveLength(1);
    expect(tables.subscriptions).toHaveLength(1);
    expect(tables.billing_events).toHaveLength(1);
    expect(tables.users[0]).toMatchObject({
      tier: "pro",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
    });
  });

  it("degrades access after failed invoice payment", async () => {
    const { ctx, tables } = makeCtx({
      ...baseTables(),
      users: [{
        _id: "user_1",
        tier: "pro",
        proSince: 100,
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
      }],
      subscriptions: [{
        _id: "subscription_1",
        userId: "user_1",
        planId: "plan_pro",
        status: "active",
        provider: "stripe",
        externalId: "sub_1",
        stripeCustomerId: "cus_1",
      }],
    });

    await runEvent(ctx, {
      id: "evt_failed",
      type: "invoice.payment_failed",
      livemode: false,
      created: 1760000000,
      data: {
        object: {
          id: "in_1",
          customer: "cus_1",
          subscription: "sub_1",
          status: "open",
          lines: { data: [{ price: { id: "price_pro" } }] },
        },
      },
    });

    expect(tables.subscriptions[0]).toMatchObject({
      status: "past_due",
      latestInvoiceId: "in_1",
      lastPaymentStatus: "open",
    });
    expect(tables.users[0]).toMatchObject({
      tier: "free",
      proSince: 100,
      stripeSubscriptionId: undefined,
    });
  });

  it("revokes access after subscription cancellation", async () => {
    const { ctx, tables } = makeCtx({
      ...baseTables(),
      users: [{
        _id: "user_1",
        tier: "pro",
        proSince: 100,
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_1",
      }],
      subscriptions: [{
        _id: "subscription_1",
        userId: "user_1",
        planId: "plan_pro",
        status: "active",
        provider: "stripe",
        externalId: "sub_1",
        stripeCustomerId: "cus_1",
      }],
    });

    await runEvent(ctx, {
      id: "evt_deleted",
      type: "customer.subscription.deleted",
      livemode: false,
      created: 1760000000,
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "canceled",
          canceled_at: 1760000000,
          items: { data: [{ price: { id: "price_pro" } }] },
        },
      },
    });

    expect(tables.subscriptions[0]).toMatchObject({
      status: "canceled",
      canceledAt: 1760000000000,
    });
    expect(tables.users[0]).toMatchObject({
      tier: "free",
      stripeSubscriptionId: undefined,
    });
  });

  it("does not grant Pro access for an unrelated Stripe price", async () => {
    const { ctx, tables } = makeCtx(baseTables());
    await runEvent(ctx, {
      id: "evt_unrelated", type: "customer.subscription.created", created: 1760000000,
      data: { object: {
        id: "sub_unrelated", customer: "cus_1", status: "active",
        metadata: { userId: "user_1" },
        items: { data: [{ price: { id: "price_unrelated" } }] },
      } },
    });
    expect(tables.users[0].tier).toBe("free");
    expect(tables.subscriptions).toHaveLength(0);
    expect(tables.billing_events[0].eventType).toBe("stripe_subscription_unmapped_plan");
  });


  it.each(["checkout_first", "subscription_first"])("binds a first purchase with %s event ordering", async (order) => {
    const { ctx, tables } = makeCtx(baseTables());
    const checkout = {
      id: "evt_checkout", type: "checkout.session.completed", created: 1760000000,
      data: { object: { id: "cs_new", customer: "cus_new", subscription: "sub_new", metadata: { userId: "user_1" } } },
    };
    const subscription = {
      id: "evt_subscription", type: "customer.subscription.created", created: 1760000000,
      data: { object: {
        id: "sub_new", customer: "cus_new", status: "active", metadata: { userId: "user_1" },
        items: { data: [{ price: { id: "price_pro" }, current_period_start: 1760000000, current_period_end: 1762592000 }] },
      } },
    };
    for (const event of order === "checkout_first" ? [checkout, subscription] : [subscription, checkout]) {
      await runEvent(ctx, event);
    }
    expect(tables.users[0]).toMatchObject({ tier: "pro", stripeCustomerId: "cus_new", stripeSubscriptionId: "sub_new" });
    expect(tables.subscriptions[0]).toMatchObject({ userId: "user_1", currentPeriodStart: 1760000000000, currentPeriodEnd: 1762592000000 });
  });

  it("maps current Stripe invoice metadata and pricing before any customer binding exists", async () => {
    const { ctx, tables } = makeCtx(baseTables());
    await runEvent(ctx, {
      id: "evt_invoice_first", type: "invoice.paid", created: 1760000000,
      data: { object: {
        id: "in_new", customer: "cus_new", status: "paid",
        parent: { subscription_details: { subscription: "sub_new", metadata: { userId: "user_1" } } },
        lines: { data: [{ pricing: { price_details: { price: "price_pro", product: "prod_pro" } } }] },
      } },
    });
    expect(tables.users[0]).toMatchObject({ tier: "pro", stripeCustomerId: "cus_new", stripeSubscriptionId: "sub_new" });
    expect(tables.subscriptions[0]).toMatchObject({ externalId: "sub_new", stripePriceId: "price_pro", latestInvoiceId: "in_new" });
  });

  it("revokes access from a current-format failed renewal invoice", async () => {
    const { ctx, tables } = makeCtx({ ...baseTables(),
      users: [{ _id: "user_1", tier: "pro", stripeCustomerId: "cus_1", stripeSubscriptionId: "sub_1" }],
      subscriptions: [{ _id: "subscription_1", planId: "plan_pro", externalId: "sub_1", userId: "user_1", status: "active" }],
    });
    await runEvent(ctx, {
      id: "evt_modern_failed", type: "invoice.payment_failed", created: 1760000000,
      data: { object: { id: "in_failed", customer: "cus_1", status: "open",
        parent: { subscription_details: { subscription: "sub_1" } },
      } },
    });
    expect(tables.users[0].tier).toBe("free");
    expect(tables.subscriptions[0].status).toBe("past_due");
  });

  it.each(["pro_monthly", "pro_yearly", "pro"])("maps explicitly configured prices to %s catalog plans", async (key) => {
    vi.stubEnv("STRIPE_PRO_MONTHLY_PRICE_ID", "price_configured_monthly");
    vi.stubEnv("STRIPE_PRO_YEARLY_PRICE_ID", "price_configured_yearly");
    const { ctx, tables } = makeCtx({ ...baseTables(), plans: [{ _id: "plan_configured", key, tier: "pro", isActive: true }] });
    await runEvent(ctx, {
      id: "evt_configured", type: "customer.subscription.created", created: 1760000000,
      data: { object: {
        id: "sub_new", customer: "cus_new", status: "active", metadata: { userId: "user_1" },
        items: { data: [{ price: { id: key === "pro_yearly" ? "price_configured_yearly" : "price_configured_monthly" } }] },
      } },
    });
    expect(tables.users[0].tier).toBe("pro");
    expect(tables.subscriptions[0].planId).toBe("plan_configured");
  });

  it("does not overwrite a paid customer's binding when an abandoned checkout expires", async () => {
    const { ctx, tables } = makeCtx({ ...baseTables(), users: [{
      _id: "user_1", tier: "pro", stripeCustomerId: "cus_current", stripeSubscriptionId: "sub_current",
    }] });
    await runEvent(ctx, {
      id: "evt_expired", type: "checkout.session.expired", created: 1760000000,
      data: { object: { id: "cs_abandoned", customer: "cus_old", metadata: { userId: "user_1" } } },
    });
    expect(tables.users[0]).toMatchObject({ stripeCustomerId: "cus_current", stripeSubscriptionId: "sub_current", tier: "pro" });
    expect(tables.billing_events[0].eventType).toBe("checkout.session.expired");
  });

  it("does not grant subscription entitlements from a one-off invoice", async () => {
    const { ctx, tables } = makeCtx(baseTables());
    await runEvent(ctx, {
      id: "evt_one_off", type: "invoice.paid", created: 1760000000,
      data: { object: { id: "in_one_off", customer: "cus_new", metadata: { userId: "user_1" },
        lines: { data: [{ price: { id: "price_pro" } }] },
      } },
    });
    expect(tables.users[0].tier).toBe("free");
    expect(tables.subscriptions).toHaveLength(0);
  });

});

