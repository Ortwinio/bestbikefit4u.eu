import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { build } from "esbuild";
import { prepareProduction } from "../final-sweep/production.mjs";
import { runGuideAudit } from "./audit.mjs";

const output = "plans/redesign-canvas/audit/44b-registered";
const production = await prepareProduction({
  outputDir: resolve("plans/redesign-canvas/code-renders/44b-registered"), port: 4373,
});
try {
  const bundle = resolve(production.snapshot, "registered-guides.cjs");
  await build({
    bundle: true, platform: "node", format: "cjs", outfile: bundle,
    absWorkingDir: production.snapshot,
    stdin: { loader: "ts", resolveDir: production.snapshot,
      contents: 'export { listGuideRewrites } from "./src/lib/guides/rewrites";' },
  });
  const guides = createRequire(import.meta.url)(bundle).listGuideRewrites();
  const report = await runGuideAudit({
    base: production.origin, fetchImpl: production.fetch,
    filter: guides.map((guide) => guide.slug), output,
  });
  const failures = report.rows.flatMap((row) => Object.entries(row.checks)
    .filter(([, passed]) => !passed).map(([check]) => `${row.locale}/${row.slug}: ${check}`));
  const proof = {
    sourceHash: production.sourceHash, buildId: production.buildId,
    snapshot: production.snapshot, slugs: guides.map((guide) => guide.slug),
    pages: report.rows.length, failures,
  };
  await writeFile(`${output}-build.json`, `${JSON.stringify(proof, null, 2)}\n`);
  console.log(JSON.stringify(proof));
  if (failures.length) process.exitCode = 1;
} finally {
  await production.close();
}
