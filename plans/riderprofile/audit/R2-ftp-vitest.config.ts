import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts", "src/**/*.test.tsx"] },
  resolve: {
    alias: [
      ...["PersonalizeAdviceBlock", "HandoffPrefillNotice"]
        .filter((name) => !existsSync(resolve(`src/components/calculators/${name}.tsx`)))
        .map((name) => ({ find: `@/components/calculators/${name}`, replacement: resolve("plans/riderprofile/audit/R2-ftp-public-only.ts") })),
      { find: "@", replacement: resolve("src") },
    ],
  },
});
