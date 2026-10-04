import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateLlmsDocument } from "@/lib/seo/llms";
import * as ConciseRoute from "@/app/llms.txt/route";
import * as FullRoute from "@/app/llms-full.txt/route";

vi.mock("@/lib/seo/llms", () => ({ generateLlmsDocument: vi.fn() }));

beforeEach(() => {
  vi.mocked(generateLlmsDocument).mockReset().mockImplementation(async (full) => full
    ? "# Full fixture\n\nExisting answer: één meting.\n"
    : "# Concise fixture\n\nhttps://bikefitboost.com/nl\n");
});

describe("LLM text route HTTP contracts", () => {
  it.each([
    ["/llms.txt", ConciseRoute, false],
    ["/llms-full.txt", FullRoute, true],
  ] as const)("serves %s from its exact generator mode with plaintext headers", async (_path, route, full) => {
    const response = await route.GET();
    expect(response.status).toBe(200);
    expect(generateLlmsDocument).toHaveBeenCalledExactlyOnceWith(full);
    expect(await response.text()).toBe(full ? "# Full fixture\n\nExisting answer: één meting.\n" : "# Concise fixture\n\nhttps://bikefitboost.com/nl\n");
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=3600, stale-while-revalidate=86400");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.has("content-length")).toBe(false);
    expect(response.headers.has("etag")).toBe(false);
    expect(route.runtime).toBe("nodejs");
    expect(route.dynamic).toBe("force-dynamic");
    expect(route.revalidate).toBe(3600);
  });

  it.each([["/llms.txt", ConciseRoute], ["/llms-full.txt", FullRoute]] as const)(
    "serves bodyless HEAD at %s without invoking generation or CMS reads", async (_path, route) => {
      const head = route.HEAD();
      expect(head.status).toBe(200);
      expect(await head.text()).toBe("");
      expect(generateLlmsDocument).not.toHaveBeenCalled();
      const get = await route.GET();
      expect([...head.headers]).toEqual([...get.headers]);
    },
  );

  it("has no stale public-directory text file shadowing either dynamic route", () => {
    expect(existsSync(resolve("public/llms.txt"))).toBe(false);
    expect(existsSync(resolve("public/llms-full.txt"))).toBe(false);
  });
});
