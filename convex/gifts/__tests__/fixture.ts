import { vi } from "vitest";

export const NOW = Date.UTC(2026, 9, 4, 12);
type Row = Record<string, unknown> & { _id: string };
type Handler = { _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown> };
export const invoke = (definition: unknown, ctx: unknown, args: Record<string, unknown> = {}) => (definition as Handler)._handler(ctx, args);
export const requestKey = (sequence: number) => `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`;

export function fixture() {
  const tables = new Map<string, Row[]>([
    ["users", [{ _id: "giver", email: "giver@example.com", emailVerificationTime: NOW }, { _id: "recipient", email: "recipient@example.com", emailVerificationTime: NOW }]],
    ["bikes", [{ _id: "bike", userId: "recipient" }, { _id: "otherBike", userId: "giver" }]],
    ["pricingEntitlements", [{ _id: "annual", userId: "giver", productId: "annual", source: "purchase", status: "active", startsAt: NOW - 100, expiresAt: NOW + 365 * 86400000 }]],
  ]);
  let sequence = 0;
  const stored = (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const db = {
    get: vi.fn(async (id: string) => structuredClone(stored(id))),
    patch: vi.fn(async (id: string, values: Record<string, unknown>) => {
      const row = stored(id)!;
      for (const [key, value] of Object.entries(values)) {
        if (value === undefined) delete row[key]; else row[key] = structuredClone(value);
      }
    }),
    insert: vi.fn(async (table: string, values: Record<string, unknown>) => {
      const row = { ...structuredClone(values), _id: `${table}_${++sequence}` };
      tables.set(table, [...(tables.get(table) ?? []), row]);
      return row._id;
    }),
    query: vi.fn((table: string) => {
      const conditions: ((row: Row) => boolean)[] = [];
      const index = {
        eq: (field: string, value: unknown) => { conditions.push((row) => row[field] === value); return index; },
        lte: (field: string, value: number) => { conditions.push((row) => Number(row[field]) <= value); return index; },
      };
      const rows = () => structuredClone((tables.get(table) ?? []).filter((row) => conditions.every((condition) => condition(row))));
      const cursor = {
        withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
        collect: async () => rows(), unique: async () => rows()[0] ?? null, take: async (limit: number) => rows().slice(0, limit),
      };
      return cursor;
    }),
  };
  const ctx = { db, scheduler: {
    runAfter: vi.fn(async (_delay: number, _reference: unknown, _args: Record<string, unknown>) => "scheduled"),
    runAt: vi.fn(async (_time: number, _reference: unknown, _args: Record<string, unknown>) => "scheduled"),
  } };
  const token = () => ctx.scheduler.runAfter.mock.calls[0][2].token as string;
  let transactionQueue = Promise.resolve();
  const transaction = (definition: unknown, args: Record<string, unknown>) => {
    const result = transactionQueue.then(() => invoke(definition, ctx, args));
    transactionQueue = result.then(() => undefined, () => undefined);
    return result;
  };
  return { ctx, tables, token, stored, transaction };
}
