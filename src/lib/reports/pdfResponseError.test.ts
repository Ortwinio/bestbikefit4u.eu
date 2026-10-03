import { describe, expect, it } from "vitest";
import { getPdfResponseError } from "./pdfResponseError";

describe("localized PDF errors", () => {
  it.each(["nl", "en"] as const)("has distinct actionable %s messages", (locale) => {
    const statuses = [401, 403, 404, 409, 429, 500];
    const messages = statuses.map((status) => getPdfResponseError(status, locale));
    expect(new Set(messages).size).toBe(statuses.length);
    expect(getPdfResponseError(403, locale)).toContain(locale === "nl" ? "laatste rapport" : "latest report");
    expect(getPdfResponseError(403, locale)).toContain(locale === "nl" ? "jaarabonnement" : "annual plan");
    expect(getPdfResponseError(403, locale)).not.toContain("Pro");
    expect(getPdfResponseError(429, locale)).toContain("30");
    expect(getPdfResponseError(502, locale)).toBe(getPdfResponseError(500, locale));
  });
});
