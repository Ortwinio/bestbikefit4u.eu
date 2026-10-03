import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const configPath = path.resolve("convex/tsconfig.json");
const source = ts.readConfigFile(configPath, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(
  source.config,
  ts.sys,
  path.dirname(configPath)
);

describe("Convex TypeScript configuration", () => {
  it("keeps strict checking and backend contract tests included", () => {
    expect(source.error).toBeUndefined();
    expect(config.errors).toEqual([]);
    expect(config.options.strict).toBe(true);
    expect(config.options.noEmit).toBe(true);
    expect(config.fileNames).toContain(
      path.resolve("convex/guides/__tests__/mutations.contract.test.ts")
    );
    expect(config.fileNames).toContain(
      path.resolve("convex/calculatorStates/state.test.ts")
    );
  });

  it("resolves frontend aliases used by shared calculator and guide modules", () => {
    for (const moduleName of ["@/i18n/config", "@/lib/public-calculators/performance"]) {
      const resolved = ts.resolveModuleName(
        moduleName,
        path.resolve("src/lib/calculators/accountState.ts"),
        config.options,
        ts.sys
      ).resolvedModule;
      expect(resolved?.resolvedFileName).toBe(
        path.resolve(`src/${moduleName.slice(2)}.ts`)
      );
    }
  });

  it("provides current runtime APIs and Next's real CSS module declarations", () => {
    expect(config.options.lib).toContain("lib.es2022.d.ts");
    expect(config.fileNames).toContain(
      path.resolve("node_modules/next/types/global.d.ts")
    );
  });
});
