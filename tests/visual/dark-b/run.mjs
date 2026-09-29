import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("plans/redesign-canvas/code-renders");
await mkdir(output, { recursive: true });
const results = [];
async function capture(script, theme) {
  const name = script.split("/").at(-2) + "-" + theme;
  const logs = await new Promise((done, reject) => {
    const child = spawn(process.execPath, [script], {
      env: {
        ...process.env, VISUAL_THEME: theme, VISUAL_PREFIX: "b-dark-" + theme + "-",
        VISUAL_OUTPUT: output, VISUAL_LOCALES: "nl",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => done({ code, stdout, stderr }));
  });
  await writeFile(resolve(output, "b-dark-" + name + ".log"), logs.stdout + logs.stderr);
  const summaries = logs.stdout.split("\n").filter((line) => line.startsWith("{")).map((line) => JSON.parse(line));
  const summary = summaries.findLast((item) => item.summary || item.cases);
  const failed = summaries.filter((item) => item.error || item.errors?.length || item.overflow);
  const result = { name, code: logs.code, summary, failed: failed.map((item) => item.name) };
  results.push(result);
  console.log(JSON.stringify(result));
  if (logs.code || summary?.failed?.length || summary?.overflows?.length || failed.length) {
    throw new Error("Capture failed: " + name);
  }
}
await Promise.all([
  ...["account-batch1", "account-batch2", "marketing-batch3"].map(async (batch) => {
    for (const theme of ["light", "dark"]) await capture("tests/visual/" + batch + "/capture.mjs", theme);
  }),
  capture("tests/visual/dark-b/public.mjs", "both"),
]);
await writeFile(resolve(output, "b-dark-suite.json"), JSON.stringify(results, null, 2) + "\n");
