import { beforeEach, describe, expect, it, vi } from "vitest";

type FakeDoc = Record<string, unknown> & { _id: string };
type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import {
  changeSlug,
  createGuide,
  publishGuide,
  updateGuide,
} from "../mutations";
import { getGuideAuditLog, getPublishedGuide } from "../queries";

function createGuideArgs() {
  return {
    slug: "test-slug-a",
    cluster: "Pain & Discomfort",
    pageTitle: { en: "Test guide", nl: "Testgids" },
    h1: { en: "Test guide", nl: "Testgids" },
    metaTitle: { en: "Test title", nl: "Testtitel" },
    metaDescription: { en: "Test description", nl: "Testbeschrijving" },
    pageBrief: { en: "Brief", nl: "Kort" },
    body: {
      en: [{ title: "Intro", type: "prose", items: ["One"] }],
      nl: [{ title: "Intro", type: "prose", items: ["Een"] }],
    },
    robotsIndex: true,
    tableOfContents: false,
  };
}

function makeCtx(options?: {
  authUserId?: string | null;
  adminRole?: string | null;
}) {
  const guidePages = new Map<string, FakeDoc>();
  const redirects = new Map<string, FakeDoc>();
  const revisions = new Map<string, FakeDoc>();
  const audits = new Map<string, FakeDoc>();
  const guideAudits = new Map<string, FakeDoc>();
  const users = new Map<string, FakeDoc>();
  const counters = new Map<string, number>();

  const nextId = (table: string) => {
    const value = (counters.get(table) ?? 0) + 1;
    counters.set(table, value);
    return `${table}_${value}`;
  };

  users.set("admin_1", {
    _id: "admin_1",
    email: "admin@example.com",
    adminRole: options?.adminRole ?? "ops_admin",
  });
  users.set("user_1", {
    _id: "user_1",
    email: "user@example.com",
    adminRole: undefined,
  });
  users.set("editor_1", {
    _id: "editor_1",
    email: "editor@example.com",
    adminRole: "support_admin",
  });

  getAuthUserIdMock.mockResolvedValue(
    options && "authUserId" in options ? options.authUserId : "admin_1"
  );

  const db = {
    get: vi.fn(async (id: string) => {
      if (users.has(id)) return users.get(id) ?? null;
      if (guidePages.has(id)) return guidePages.get(id) ?? null;
      if (redirects.has(id)) return redirects.get(id) ?? null;
      if (revisions.has(id)) return revisions.get(id) ?? null;
      if (audits.has(id)) return audits.get(id) ?? null;
      if (guideAudits.has(id)) return guideAudits.get(id) ?? null;
      return null;
    }),
    insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
      const id = nextId(table);
      const doc = { _id: id, ...value };
      if (table === "guidePages") guidePages.set(id, doc);
      if (table === "redirects") redirects.set(id, doc);
      if (table === "guideRevisions") revisions.set(id, doc);
      if (table === "admin_audit_logs") audits.set(id, doc);
      if (table === "guideAuditLog") guideAudits.set(id, doc);
      return id;
    }),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const current = guidePages.get(id);
      if (current) {
        guidePages.set(id, { ...current, ...patch });
      }
    }),
    query: vi.fn((table: string) => {
      const records =
        table === "guidePages"
          ? [...guidePages.values()]
          : table === "redirects"
            ? [...redirects.values()]
            : table === "guideRevisions"
              ? [...revisions.values()]
              : table === "guideAuditLog"
                ? [...guideAudits.values()]
              : table === "users"
                ? [...users.values()]
                : [];

      return {
        withIndex: vi.fn(
          (
            _indexName: string,
            build?: (q: { eq: (field: string, value: unknown) => unknown }) => unknown
          ) => {
            const filters: Array<[string, unknown]> = [];
            const builder = {
              eq(field: string, value: unknown) {
                filters.push([field, value]);
                return builder;
              },
            };
            build?.(builder);
            const filtered = records.filter((record) =>
              filters.every(([field, value]) => record[field] === value)
            );
            return {
              unique: vi.fn(async () => filtered[0] ?? null),
              first: vi.fn(async () => filtered[0] ?? null),
              collect: vi.fn(async () => filtered),
            };
          }
        ),
        collect: vi.fn(async () => records),
      };
    }),
  };

  return {
    db,
    tables: {
      guidePages,
      redirects,
      revisions,
      audits,
      guideAudits,
    },
  };
}

describe("guide mutations and queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces auth on createGuide", async () => {
    const ctx = makeCtx({ authUserId: null });
    const handler = (createGuide as unknown as { _handler: TestHandler })._handler;

    await expect(handler(ctx, createGuideArgs())).rejects.toThrow("Not authenticated");
    expect(ctx.tables.guidePages.size).toBe(0);
  });

  it("blocks publishGuide for non-admin users", async () => {
    const ctx = makeCtx();
    const createHandler = (createGuide as unknown as { _handler: TestHandler })._handler;
    const publishHandler = (publishGuide as unknown as { _handler: TestHandler })._handler;
    const guideId = (await createHandler(ctx, createGuideArgs())) as string;
    getAuthUserIdMock.mockResolvedValue("editor_1");

    await expect(publishHandler(ctx, { id: guideId })).rejects.toThrow(
      "Not authorized: requires one of [super_admin, ops_admin, fit_specialist, qa_manager]"
    );
  });

  it("increments version on each update and returns null until published", async () => {
    const ctx = makeCtx();
    const createHandler = (createGuide as unknown as { _handler: TestHandler })._handler;
    const updateHandler = (updateGuide as unknown as { _handler: TestHandler })._handler;
    const publishHandler = (publishGuide as unknown as { _handler: TestHandler })._handler;
    const publishedHandler = (getPublishedGuide as unknown as { _handler: TestHandler })._handler;

    const guideId = (await createHandler(ctx, createGuideArgs())) as string;
    await updateHandler(ctx, {
      id: guideId,
      pageBrief: { en: "Updated once", nl: "Een keer bijgewerkt" },
    });
    await updateHandler(ctx, {
      id: guideId,
      metaDescription: { en: "Updated twice", nl: "Twee keer bijgewerkt" },
    });

    const guide = ctx.tables.guidePages.get(guideId);
    expect(guide?.version).toBe(3);
    expect(await publishedHandler(ctx, { slug: "test-slug-a" })).toBeNull();

    await publishHandler(ctx, { id: guideId });
    const publishedGuide = await publishedHandler(ctx, { slug: "test-slug-a" });
    expect(publishedGuide).toMatchObject({
      _id: guideId,
      status: "published",
      slug: "test-slug-a",
    });
  });

  it("creates a redirect record when a published slug changes", async () => {
    const ctx = makeCtx();
    const createHandler = (createGuide as unknown as { _handler: TestHandler })._handler;
    const publishHandler = (publishGuide as unknown as { _handler: TestHandler })._handler;
    const changeSlugHandler = (changeSlug as unknown as { _handler: TestHandler })._handler;

    const guideId = (await createHandler(ctx, createGuideArgs())) as string;
    await publishHandler(ctx, { id: guideId });
    await changeSlugHandler(ctx, {
      id: guideId,
      slug: "test-slug-b",
    });

    const redirect = [...ctx.tables.redirects.values()][0];
    expect(redirect).toMatchObject({
      from: "/guides/test-slug-a",
      to: "/guides/test-slug-b",
      statusCode: 301,
    });
    expect(ctx.tables.guidePages.get(guideId)?.slug).toBe("test-slug-b");
  });

  it("records publish events with user email in the guide audit log", async () => {
    const ctx = makeCtx();
    const createHandler = (createGuide as unknown as { _handler: TestHandler })._handler;
    const publishHandler = (publishGuide as unknown as { _handler: TestHandler })._handler;
    const auditHandler = (getGuideAuditLog as unknown as { _handler: TestHandler })._handler;

    const guideId = (await createHandler(ctx, createGuideArgs())) as string;
    await publishHandler(ctx, { id: guideId });

    const entries = (await auditHandler(ctx, { guideId })) as FakeDoc[];
    const publishEntry = entries.find((entry) => entry.action === "publish");
    expect(publishEntry).toMatchObject({
      action: "publish",
      guideId,
      userEmail: "admin@example.com",
      resourceType: "guide",
      resourceId: guideId,
    });
  });

  it("records field-level changes for updates", async () => {
    const ctx = makeCtx();
    const createHandler = (createGuide as unknown as { _handler: TestHandler })._handler;
    const updateHandler = (updateGuide as unknown as { _handler: TestHandler })._handler;
    const auditHandler = (getGuideAuditLog as unknown as { _handler: TestHandler })._handler;

    const guideId = (await createHandler(ctx, createGuideArgs())) as string;
    await updateHandler(ctx, {
      id: guideId,
      h1: { en: "Updated heading", nl: "Testgids" },
    });

    const entries = (await auditHandler(ctx, { guideId })) as FakeDoc[];
    const updateEntry = entries.find((entry) => entry.action === "update");
    expect(updateEntry).toBeDefined();
    expect(updateEntry?.fieldChanges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "h1.en",
          oldValue: "Test guide",
          newValue: "Updated heading",
        }),
      ])
    );
  });

  it("rejects slug changes on published guides for editor tokens", async () => {
    const ctx = makeCtx();
    const createHandler = (createGuide as unknown as { _handler: TestHandler })._handler;
    const publishHandler = (publishGuide as unknown as { _handler: TestHandler })._handler;
    const changeSlugHandler = (changeSlug as unknown as { _handler: TestHandler })._handler;

    const guideId = (await createHandler(ctx, createGuideArgs())) as string;
    await publishHandler(ctx, { id: guideId });
    getAuthUserIdMock.mockResolvedValue("editor_1");

    await expect(
      changeSlugHandler(ctx, {
        id: guideId,
        slug: "editor-cannot-change-this",
      })
    ).rejects.toThrow(
      "Not authorized: requires one of [super_admin, ops_admin, fit_specialist, qa_manager]"
    );
  });
});
