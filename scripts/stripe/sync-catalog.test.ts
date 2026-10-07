import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

// Keep the directly runnable Node harness in the standard unit-test gate as well.
test("Stripe catalogue CLI and mock-client contract", () => {
  const output = execFileSync(process.execPath, ["--test",
    fileURLToPath(new URL("./sync-catalog.test.mjs", import.meta.url)),
  ], {
    cwd: fileURLToPath(new URL("../../", import.meta.url)),
    encoding: "utf8",
    timeout: 30_000,
  });
  expect(output).toContain("fail 0");
}, 35_000);
