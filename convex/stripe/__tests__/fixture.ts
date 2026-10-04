import { vi } from "vitest";
export const now = Date.UTC(2026, 9, 5);
export type Row = Record<string, unknown> & { _id: string; _creationTime: number };
export const row = (_id: string, data: object = {}): Row => ({ _id, _creationTime: now, ...data });
export function fixture(productId = "single") {
  const rows: Row[] = [row("users:owner", { email: "test@example.test" }),
    row("bikes:bike", { userId: "users:owner" }),
    row("stripeCheckouts:checkout", { userId: "users:owner", productId, locale: "nl", status: "pending",
      ...(productId === "single" ? { bikeId: "bikes:bike" } : {}), createdAt: now - 1000 })];
  const db = {
    normalizeId: (table: string, id: string) => id.startsWith(`${table}:`) ? id : null,
    get: async (id: string) => rows.find(entry => entry._id === id) ?? null,
    insert: vi.fn(async (table: string, data: object) => { const id = `${table}:${rows.length}`; rows.push(row(id, data)); return id; }),
    patch: vi.fn(async (id: string, data: object) => Object.assign(rows.find(entry => entry._id === id)!, data)),
    query: (table: string) => {
      let selected = rows.filter(entry => entry._id.startsWith(`${table}:`));
      const chain = {
        withIndex: (_name: string, callback: (index: unknown) => unknown) => {
          const index = {
            eq: (field: string, value: unknown) => { selected = selected.filter(entry => entry[field] === value); return index; },
            lte: (field: string, value: number) => { selected = selected.filter(entry => Number(entry[field]) <= value); return index; },
            gt: (field: string, value: number) => { selected = selected.filter(entry => Number(entry[field]) > value); return index; },
          };
          callback(index); return chain;
        },
        collect: async () => selected, unique: async () => selected[0] ?? null, first: async () => selected[0] ?? null,
        order: () => { selected.reverse(); return chain; }, take: async (count: number) => selected.slice(0, count),
      };
      return chain;
    },
  };
  return { rows, ctx: { db, scheduler: { runAfter: vi.fn() } } };
}
export function session(extra: Record<string, unknown> = {}) {
  return { id: "cs_1", object: "checkout.session", mode: "payment", customer: "cus_1", payment_intent: "pi_1",
    payment_status: "paid", currency: "eur", amount_total: 1350, created: now / 1000,
    metadata: { reservationId: "stripeCheckouts:checkout", userId: "users:owner", productId: "single", bikeId: "bikes:bike" }, ...extra };
}
export function invoice(extra: Record<string, unknown> = {}) {
  return { id: "in_1", paid: true, status: "paid", currency: "eur", amount_paid: 2150, customer: "cus_1",
    billing_reason: "subscription_create", payment_intent: "pi_1",
    parent: { subscription_details: { subscription: "sub_1", metadata: { reservationId: "stripeCheckouts:checkout",
      userId: "users:owner", productId: "annual", annualPriceId: "price_annual" } } },
    lines: { data: [{ parent: { type: "subscription_item_details", subscription_item_details: { proration: false } },
      pricing: { price_details: { price: "price_annual" } }, period: { start: now / 1000, end: (now + 365 * 86400_000) / 1000 } }] }, ...extra };
}
export const event = (type: string, data: object, id = "evt_1", time = now) => JSON.stringify({
  id, type, created: time / 1000, livemode: false, api_version: "2026-06-24.dahlia", data: { object: data },
});
