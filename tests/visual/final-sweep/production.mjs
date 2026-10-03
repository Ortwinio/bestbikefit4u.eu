import { createPreviewCertificate, createPreviewFetch } from "./tls.mjs";
import { cp, mkdir, readFile, writeFile, symlink, readdir, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const inputs = ["src", "convex", "shared", "data", "docs", "public", "tests/fixtures",
  "scripts/lib", "scripts/import-guide-rewrites.mjs",
  "next.config.ts", "tsconfig.json",
  "postcss.config.mjs", "package.json", "package-lock.json", "instrumentation.ts", "instrumentation-client.ts"];

export async function fingerprint(root, env) {
  const hash = createHash("sha256");
  async function visit(relative) {
    const path = resolve(root, relative);
    const info = await stat(path).catch(() => null);
    if (!info) return;
    if (info.isDirectory()) {
      for (const name of (await readdir(path)).sort()) await visit(join(relative, name));
    } else {
      hash.update(relative);
      hash.update(await readFile(path));
    }
  }
  for (const input of inputs) await visit(input);
  const publicEnvironment = Object.entries(env).filter(([name]) => name.startsWith("NEXT_PUBLIC_")
    || ["STRIPE_BILLING_ENABLED", "NODE_ENV"].includes(name)).sort(([a], [b]) => a.localeCompare(b));
  hash.update(JSON.stringify(publicEnvironment));
  hash.update("final-sweep-production-v2-billing-off");
  return hash.digest("hex");
}

// Keep copying and hashing on the same input list, including fixtures imported by source tests.
export async function copyBuildInputs(root, snapshot) {
  for (const input of inputs) {
    if (await stat(resolve(root, input)).catch(() => null)) {
      await cp(resolve(root, input), resolve(snapshot, input), { recursive: true });
    }
  }
}

async function run(command, args, options, logPath) {
  const log = createWriteStream(logPath);
  const child = spawn(command, args, { ...options, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  await new Promise((done, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? done() : reject(new Error(`Build exited ${code}; see ${logPath}`)));
  }).finally(() => log.end());
}

/** Builds a copied source tree; never writes .next, env files or generated types in the working repository. */
export async function prepareProduction({ root = process.cwd(), outputDir, port = 4321 } = {}) {
  require("@next/env").loadEnvConfig(root);
  const env = { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1",
    STRIPE_BILLING_ENABLED: "false", NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "false" };
  const sourceHash = await fingerprint(root, env);
  const snapshot = resolve(tmpdir(), `bbf-final-sweep-${sourceHash.slice(0, 16)}`);
  await mkdir(snapshot, { recursive: true });
  await mkdir(outputDir, { recursive: true });
  const buildId = resolve(snapshot, ".next-final-sweep/BUILD_ID");
  const reused = await stat(buildId).then(() => true, () => false);
  if (!reused) {
    console.log(`Building isolated production snapshot ${snapshot}`);
    await copyBuildInputs(root, snapshot);
    await symlink(resolve(root, "node_modules"), resolve(snapshot, "node_modules"), "dir")
      .catch((error) => { if (error.code !== "EEXIST") throw error; });
    const configPath = resolve(snapshot, "next.config.ts");
    const config = await readFile(configPath, "utf8");
    if (!config.includes("const nextConfig: NextConfig = {")) throw new Error("Next config shape changed");
    await writeFile(configPath, config.replace("const nextConfig: NextConfig = {",
      'const nextConfig: NextConfig = {\n  distDir: ".next-final-sweep",'));
    await run(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
      { cwd: snapshot, env }, resolve(outputDir, "build.log"));
  }
  // Fixtures must import this snapshot's app source, even if other agents change the working tree.
  // Tooling is refreshed on reuse; it does not affect the production source fingerprint.
  await cp(resolve(root, "tests/visual"), resolve(snapshot, "tests/visual"), { recursive: true });
  // Match earlier visual batches: the same build returned repeated self-307s under CLI start,
  // but 200s with correct locale/CSP under this custom server. The internal cause is unconfirmed.
  const certificate = await createPreviewCertificate();
  const origin = `https://127.0.0.1:${port}`;
  const previewFetch = createPreviewFetch(origin, certificate.cert);
  const log = createWriteStream(resolve(outputDir, "server.log"));
  const child = spawn(process.execPath,
    [fileURLToPath(new URL("./server.mjs", import.meta.url)), snapshot, String(port),
      certificate.keyPath, certificate.certPath],
    { cwd: snapshot, env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  let stopped = false;
  const close = async () => {
    if (stopped) return;
    stopped = true;
    if (child.exitCode === null && child.signalCode === null) {
      await new Promise((done) => {
        child.once("close", done);
        child.kill("SIGTERM");
      });
    }
    log.end();
    await certificate.close();
  };
  try {
    let ready = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      if (child.exitCode !== null) throw new Error(`Production server exited; see ${outputDir}/server.log`);
      // A response from our child is required; an occupied port makes the child exit and fails below.
      if (attempt > 1) {
        ready = await previewFetch(`${origin}/illustrations/06-meetset.webp`, { signal: AbortSignal.timeout(3000) })
          .then((response) => response.status === 200, () => false);
      }
      if (ready) break;
      await new Promise((done) => setTimeout(done, 500));
    }
    if (!ready || child.exitCode !== null) throw new Error("Production server did not become ready");
    return { origin, close, fetch: previewFetch, sourceHash, snapshot, reused,
      buildId: (await readFile(buildId, "utf8")).trim() };
  } catch (error) {
    await close();
    throw error;
  }
}
