import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "@/lib/csp";

describe("shared pressure stylesheet delivery", () => {
  it("delivers the shared stylesheet once in the nonce-protected root head", () => {
    const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
    expect(layout).toContain('import { pressureDisplayStyles } from "../../shared/pressure/display"');
    expect(layout).toMatch(/<head>[\s\S]*<style id="pressure-display-styles" nonce=\{nonce\}>\{pressureDisplayStyles\}<\/style>[\s\S]*<\/head>/);
    expect(layout.match(/\{pressureDisplayStyles\}<\/style>/g)).toHaveLength(1);
    const stylePolicy = buildContentSecurityPolicy("pressure-test", false).split("; ")
      .find((directive) => directive.startsWith("style-src "));
    expect(stylePolicy).toContain("'nonce-pressure-test'");
    expect(stylePolicy).not.toContain("'unsafe-inline'");
  });
});
