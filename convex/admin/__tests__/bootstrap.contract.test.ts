import { describe, expect, it, vi } from "vitest";
import { bootstrapFirstAdmin, getBootstrapStatus } from "../bootstrap";

type FakeRecord = Record<string, unknown>;
type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

function makeUsersQuery(rows: FakeRecord[]) {
  return {
    filter: vi.fn((build: (q: { field: (field: string) => string; neq: (field: string, value: unknown) => unknown }) => unknown) => {
      const neqFilters: Array<[string, unknown]> = [];
      const builder = {
        field(field: string) {
          return field;
        },
        neq(field: string, value: unknown) {
          neqFilters.push([field, value]);
          return builder;
        },
      };
      build(builder);
      const filtered = rows.filter((row) => neqFilters.every(([field, value]) => row[field] !== value));
      return {
        collect: vi.fn(async () => filtered),
      };
    }),
    withIndex: vi.fn((_indexName: string, build?: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
      const eqFilters: Array<[string, unknown]> = [];
      const builder = {
        eq(field: string, value: unknown) {
          eqFilters.push([field, value]);
          return builder;
        },
      };
      build?.(builder);
      const filtered = rows.filter((row) => eqFilters.every(([field, value]) => row[field] === value));
      return {
        unique: vi.fn(async () => filtered[0] ?? null),
      };
    }),
  };
}

function makeCtx(users: FakeRecord[]) {
  const patchCalls: Array<[string, FakeRecord]> = [];
  const insertCalls: Array<[string, FakeRecord]> = [];
  return {
    db: {
      query: vi.fn((table: string) => {
        if (table !== "users") {
          throw new Error(`Unhandled table ${table}`);
        }
        return makeUsersQuery(users);
      }),
      patch: vi.fn(async (id: string, patch: FakeRecord) => {
        patchCalls.push([id, patch]);
      }),
      insert: vi.fn(async (table: string, doc: FakeRecord) => {
        insertCalls.push([table, doc]);
        return `${table}_1`;
      }),
    },
    patchCalls,
    insertCalls,
  };
}

describe("admin bootstrap", () => {
  it("reports bootstrap availability when no admins exist and the secret is configured", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_SECRET", "secret");
    const ctx = makeCtx([{ _id: "user_1", email: "admin@example.com" }]);
    const handler = (getBootstrapStatus as unknown as { _handler: TestHandler })._handler;

    await expect(handler(ctx, {})).resolves.toEqual({
      hasBootstrapSecret: true,
      adminCount: 0,
      canBootstrap: true,
    });

    vi.unstubAllEnvs();
  });

  it("assigns the first super admin when the secret matches and no admins exist", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_SECRET", "secret");
    const ctx = makeCtx([{ _id: "user_1", email: "owner@example.com" }]);
    const handler = (bootstrapFirstAdmin as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(ctx, { email: " Owner@Example.com ", secret: "secret" })
    ).resolves.toEqual({
      userId: "user_1",
      email: "owner@example.com",
      adminRole: "super_admin",
    });

    expect(ctx.patchCalls).toEqual([["user_1", { adminRole: "super_admin" }]]);
    expect(ctx.insertCalls).toContainEqual([
      "admin_audit_logs",
      expect.objectContaining({
        adminUserId: "user_1",
        action: "admin.bootstrap_first_admin",
      }),
    ]);

    vi.unstubAllEnvs();
  });

  it("rejects bootstrap once any admin already exists", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_SECRET", "secret");
    const ctx = makeCtx([
      { _id: "user_1", email: "owner@example.com" },
      { _id: "user_2", email: "admin@example.com", adminRole: "super_admin" },
    ]);
    const handler = (bootstrapFirstAdmin as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(ctx, { email: "owner@example.com", secret: "secret" })
    ).rejects.toThrow("Admin bootstrap is no longer available.");

    vi.unstubAllEnvs();
  });
});
