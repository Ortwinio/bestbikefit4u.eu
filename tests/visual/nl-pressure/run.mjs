import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { prepareProduction } from "../final-sweep/production.mjs";

const { values } = parseArgs({
  options: {
    output: { type: "string", default: "plans/redesign-canvas/audit/40b-local-scan.json" },
    "output-dir": { type: "string", default: "plans/redesign-canvas/code-renders/40b-nl-scan" },
    port: { type: "string", default: "4340" },
    baseline: { type: "string" },
    "skip-en": { type: "boolean", default: false },
  },
});

const root = fileURLToPath(new URL("../../../", import.meta.url));
const outputDir = resolve(root, values["output-dir"]);
const output = resolve(root, values.output);
await mkdir(outputDir, { recursive: true });
const production = await prepareProduction({ root, outputDir, port: Number(values.port) });
const context = {
  origin: production.origin,
  sourceHash: production.sourceHash,
  buildId: production.buildId,
  snapshot: production.snapshot,
  reused: production.reused,
};

try {
  await writeFile(resolve(outputDir, "run-context.json"), `${JSON.stringify(context, null, 2)}\n`);
  const args = [resolve(root, "tests/visual/nl-pressure/scan.py"),
    "--base-url", production.origin, "--insecure", "--output", output];
  if (values.baseline) args.push("--baseline", resolve(root, values.baseline));
  if (values["skip-en"]) args.push("--skip-en");
  const status = await new Promise((done, reject) => {
    const child = spawn("python3", args, { cwd: root, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => done(code ?? 1));
  });
  const report = JSON.parse(await readFile(output, "utf8"));
  report.production = context;
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = status;
} finally {
  await production.close();
}
