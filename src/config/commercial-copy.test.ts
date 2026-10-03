import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "_generated" ? [] : sourceFiles(file);
    if (/\.(?:test|spec)\.[^.]+$/.test(file) || !/\.(?:[cm]?js|tsx?|txt)$/.test(file)) return [];
    return [file];
  });
}

describe("retired commercial copy", () => {
  it("does not reintroduce old prices or monthly Pro offers into active source", () => {
    const retired = /(?:€|EUR)\s*(?:9(?:[.,]00)?|12[.,]50)(?![\d.,])|priceCents(?:Monthly)?\s*:\s*(?:900|1250)\b|pro[-_]monthly/i;
    const findings = [...sourceFiles("src"), ...sourceFiles("convex"), ...sourceFiles("shared"), ...sourceFiles("public")]
      .flatMap(file => readFileSync(file, "utf8").split("\n").flatMap((line, index) =>
        retired.test(line) ? [`${file}:${index + 1}: ${line.trim()}`] : []));
    expect(findings).toEqual([]);
  });
  it("keeps public commercial dictionaries free of a recurring monthly price suffix", () => {
    const files = ["src/config/commercial.ts", "src/i18n/marketing/fitPass.ts", "src/i18n/marketing/pricing.ts"];
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/\/\s*(?:month|maand)\b/i);
    }
  });
});
