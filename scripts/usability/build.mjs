import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startBuildProvenance, finishBuildProvenance } from "./provenance.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const started = await startBuildProvenance(root);
const child = spawn("npm", ["--prefix", root, "run", "build"], {
  cwd: root, stdio: "inherit", env: { ...process.env,
    NEXT_PUBLIC_SITE_URL: "https://bikefitboost.com", NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:9",
    NEXT_PUBLIC_CONVEX_SITE_URL: "http://127.0.0.1:9", CONVEX_SITE_URL: "http://127.0.0.1:9",
    STRIPE_BILLING_ENABLED: "false", NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "false", NEXT_TELEMETRY_DISABLED: "1" },
});
const code = await new Promise((done, reject) => { child.once("error", reject); child.once("exit", done); });
if (code !== 0) throw new Error(`Production build failed (${code})`);
const stamp = await finishBuildProvenance(root, started);
await writeFile(resolve(root, ".next/usability-provenance.json"), JSON.stringify(stamp, null, 2));
console.log(`Verified unchanged application sources for ${stamp.buildId}`);
