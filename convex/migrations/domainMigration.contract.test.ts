import { describe, expect, it, vi } from "vitest";
import { migratedGuideImageUrl, rewriteGuideImageUrls } from "./domainMigration";

type Table = "guidePages" | "guideRevisions";
type Row = { _id: string; [field: string]: unknown };
type Args = { table: Table; cursor: string | null; numItems?: number; dryRun?: boolean };
type Result = {
  table: Table; dryRun: boolean; continueCursor: string; isDone: boolean;
  counts: { scanned: number; eligible: number; updated: number; skipped: number; invalidSnapshots: number };
};
const handler = (rewriteGuideImageUrls as unknown as {
  _handler: (ctx: unknown, args: Args) => Promise<Result>;
})._handler;
const oldUrl = "https://bestbikefit4u.eu/og/illustrations/guides/example.jpg";
const newUrl = "https://bikefitboost.com/og/illustrations/guides/example.jpg";

function fixture(rows: Row[]) {
  const documents = structuredClone(rows);
  const paginate = vi.fn(async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
    const start = Number(cursor ?? 0);
    const page = documents.slice(start, start + numItems);
    return { page, continueCursor: String(start + page.length), isDone: start + page.length >= documents.length };
  });
  const db = {
    query: vi.fn(() => ({ paginate })),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      Object.assign(documents.find(row => row._id === id)!, patch);
    }),
    insert: vi.fn(), delete: vi.fn(),
  };
  return { db, documents, paginate };
}

describe("domain migration URL boundary (historical database fixtures)", () => {
  it.each(["https://bestbikefit4u.eu", "https://www.bestbikefit4u.eu"])("rewrites only %s", origin => {
    const suffix = "/og/a%20b.jpg?next=https://bestbikefit4u.eu/a&x=1#old";
    expect(migratedGuideImageUrl(origin + suffix)).toBe("https://bikefitboost.com" + suffix);
    expect(migratedGuideImageUrl(origin)).toBe("https://bikefitboost.com");
    expect(migratedGuideImageUrl(origin + "?x=1")).toBe("https://bikefitboost.com?x=1");
  });
  it.each([
    undefined, null, 4, {}, "", "/og/a.jpg", "//bestbikefit4u.eu/a", "not a URL",
    "http://bestbikefit4u.eu/a", "https://bikefitboost.com/a", "https://other.test/?url=https://bestbikefit4u.eu/a",
    "https://bestbikefit4u.eu.evil.test/a", "https://foo.bestbikefit4u.eu/a", "https://bestbikefit4u.eu@evil.test/a",
    "https://user@bestbikefit4u.eu/a", "https://bestbikefit4u.eu:444/a", "https://bestbikefit4u.eu./a",
    " https://bestbikefit4u.eu/a", "https://bestbikefit4u.eu/\n/a", "https://bestbikefit4u.eu\\@evil.test/a",
  ])("preserves unsupported or malformed value %s", value => {
    expect(migratedGuideImageUrl(value)).toBeNull();
  });
});

describe("guide domain migration internal mutation", () => {
  it.each<Table>(["guidePages", "guideRevisions"])("defaults to dry run and changes only %s image field", async table => {
    expect((rewriteGuideImageUrls as unknown as { isInternal: boolean }).isInternal).toBe(true);
    const content = { ogImageUrl: oldUrl, title: "BestBikeFit4U", body: { nl: [oldUrl] }, updatedAt: 123 };
    const row = table === "guidePages" ? { _id: "id1", ...content }
      : { _id: "id1", snapshot: content, savedAt: 123, savedBy: "owner" };
    const ctx = fixture([row]);
    const args: Args = { table, cursor: null };
    const dry = await handler(ctx, args);
    expect(dry).toMatchObject({ dryRun: true, isDone: true, counts: { scanned: 1, eligible: 1, updated: 0 } });
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.documents).toEqual([row]);
    expect(ctx.db.query).toHaveBeenCalledWith(table);
    const applied = await handler(ctx, { ...args, dryRun: false });
    expect(applied.counts.updated).toBe(1);
    const expected = table === "guidePages" ? { ...row, ogImageUrl: newUrl }
      : { ...row, snapshot: { ...content, ogImageUrl: newUrl } };
    expect(ctx.documents).toEqual([expected]);
    const again = await handler(ctx, { ...args, dryRun: false });
    expect(again.counts).toMatchObject({ eligible: 0, updated: 0, skipped: 1 });
    expect(ctx.db.patch).toHaveBeenCalledTimes(1);
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });

  it("rejects invalid snapshots and never recursively searches unrelated values", async () => {
    const values = [null, [], "old", 8, false, {}, { ogImageUrl: 42 }, { body: { ogImageUrl: oldUrl } }];
    const rows = values.map((snapshot, i) => ({ _id: String(i), snapshot }));
    const ctx = fixture(rows);
    const result = await handler(ctx, { table: "guideRevisions", cursor: null, dryRun: false });
    expect(result.counts).toEqual({ scanned: 8, eligible: 0, updated: 0, skipped: 8, invalidSnapshots: 5 });
    expect(ctx.documents).toEqual(rows);
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("walks bounded pages with a continuation cursor", async () => {
    const ctx = fixture([0, 1, 2].map(i => ({ _id: String(i), ogImageUrl: oldUrl })));
    const first = await handler(ctx, { table: "guidePages", cursor: null, numItems: 2, dryRun: false });
    expect(first).toMatchObject({ continueCursor: "2", isDone: false, counts: { updated: 2 } });
    const second = await handler(ctx, {
      table: "guidePages", cursor: first.continueCursor, numItems: 2, dryRun: false,
    });
    expect(second).toMatchObject({ isDone: true, counts: { updated: 1 } });
    expect(ctx.paginate).toHaveBeenLastCalledWith({
      cursor: "2", numItems: 2, maximumRowsRead: 100, maximumBytesRead: 1_000_000,
    });
  });

  it.each([0, -1, 101, 1.5, Infinity, NaN])("rejects invalid page size %s", async numItems => {
    const ctx = fixture([]);
    await expect(handler(ctx, { table: "guidePages", cursor: null, numItems })).rejects.toThrow("page size");
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
