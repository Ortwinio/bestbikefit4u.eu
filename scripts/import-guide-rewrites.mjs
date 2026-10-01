import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

export function validateDocument(value, schema, path = "document") {
  const fail = () => { throw new Error(`Invalid ${path}: expected ${schema.type}`); };
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail();
    for (const key of Object.keys(value)) if (!(key in schema.value)) {
      throw new Error(`Unknown ${path}.${key}`);
    }
    for (const [key, field] of Object.entries(schema.value)) {
      if (value[key] === undefined && field.optional) continue;
      validateDocument(value[key], field.fieldType, `${path}.${key}`);
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) fail();
    value.forEach((item, index) => validateDocument(item, schema.value, `${path}[${index}]`));
  } else if (schema.type === "union") {
    if (!schema.value.some((option) => {
      try { validateDocument(value, option, path); return true; } catch { return false; }
    })) fail();
  } else if (schema.type === "literal") {
    if (value !== schema.value) fail();
  } else if (schema.type === "id") {
    if (typeof value !== "string" || !value) fail();
  } else if (schema.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) fail();
  } else if (["string", "boolean"].includes(schema.type)) {
    if (typeof value !== schema.type) fail();
  } else {
    throw new Error(`Unsupported validator ${schema.type}`);
  }
}

export function changedFields(document, existing) {
  const ignored = new Set(["createdAt", "createdBy", "updatedAt", "updatedBy", "version", "publishedAt",
    "lastUpdatedAt", "status", "importStatus"]);
  const next = { ...Object.fromEntries(Object.entries(document).filter(([key]) => !ignored.has(key))),
    status: "published", importStatus: "44b" };
  return Object.keys(next).filter((key) => JSON.stringify(next[key]) !== JSON.stringify(existing?.[key])).sort();
}

export async function importDocuments(documents, run, log, save, actorId) {
  for (const document of documents) {
    const existing = run("guides/queries:getGuideImportRecord", { slug: document.slug });
    const entry = { slug: document.slug, action: existing ? "update" : "create",
      changedFields: changedFields(document, existing), requiresOverwrite: Boolean(existing && !log.overwrite),
      outcome: log.dryRun ? "preview" : "pending" };
    log.entries.push(entry);
    console.log(`${entry.slug}: ${entry.action}; changed: ${entry.changedFields.join(", ")}`);
    if (!log.dryRun) {
      try {
        if (entry.requiresOverwrite) throw new Error(`${document.slug}: existing guide requires --overwrite`);
        const result = run("guides/mutations:importGuideRewrite", {
          ...document, overwrite: log.overwrite, actorId,
        });
        entry.outcome = result.outcome;
      } catch (error) {
        entry.outcome = "failed";
        throw error;
      }
    }
    await save();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(["--dry-run", "--offline", "--overwrite", "--prod", "--confirm-production", "--actor-id"]);
  let actorId;
  for (let index = 0; index < args.length; index += 1) {
    if (!allowed.has(args[index])) throw new Error(`Unknown option: ${args[index]}`);
    if (args[index] === "--actor-id") {
      actorId = args[++index];
      if (!actorId || actorId.startsWith("--")) throw new Error("Missing actor ID");
    }
  }
  const dryRun = args.includes("--dry-run");
  const production = args.includes("--prod");
  const overwrite = args.includes("--overwrite");
  const offline = args.includes("--offline");
  if (offline && (!dryRun || production)) throw new Error("--offline requires --dry-run and cannot target production");
  if (production && !dryRun && !args.includes("--confirm-production")) {
    throw new Error("Production requires separate release approval and --confirm-production");
  }
  if (!dryRun && !actorId) throw new Error("Real imports require --actor-id for revision attribution");
  if (!offline && (process.env.CONVEX_DEPLOY_KEY || process.env.CONVEX_SELF_HOSTED_ADMIN_KEY)) {
    throw new Error("Use Convex CLI login, not deployment/admin keys");
  }
  const envFile = offline ? "" : await readFile(".env.local", "utf8").catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  if (/^(?:CONVEX_DEPLOY_KEY|CONVEX_SELF_HOSTED_ADMIN_KEY)=.+/m.test(envFile)) {
    throw new Error("Remove deployment/admin keys from the CLI env file before importing");
  }
  const deployment = process.env.CONVEX_DEPLOYMENT
    ?? envFile.match(/^CONVEX_DEPLOYMENT=["']?([^\s"'#]+)/m)?.[1];
  if (!offline && !production && !/^(local|dev):[a-zA-Z0-9_-]+$/.test(deployment ?? "")) {
    throw new Error("Dry-run/dev import requires an explicit local: or dev: CONVEX_DEPLOYMENT");
  }
  const targetArgs = offline ? [] : production ? ["--prod"]
    : ["--deployment", deployment.startsWith("local:") ? "local" : deployment.slice(4)];
  const run = (name, payload) => {
    if (offline || (dryRun && name !== "guides/queries:getGuideImportRecord")) {
      throw new Error("Read-only guard rejected the Convex call");
    }
    try {
      return JSON.parse(execFileSync("npx", ["convex", "run", name, JSON.stringify(payload),
        ...targetArgs, "--codegen", "disable"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"], timeout: 120000 }));
    } catch {
      throw new Error(`Convex CLI call failed: ${name}; stopped without logging credentials or document text`);
    }
  };
  const logPath = "plans/redesign-canvas/audit/49-import-log.json";
  const log = { startedAt: new Date().toISOString(), dryRun, production, offline,
    target: offline ? "offline" : production ? "production" : deployment,
    overwrite, entries: [], status: "running" };
  await mkdir("plans/redesign-canvas/audit", { recursive: true });
  const save = () => writeFile(logPath, `${JSON.stringify(log, null, 2)}\n`);
  try {
    const bundled = await build({ entryPoints: ["convex/guides/rewriteImport.ts"],
      bundle: true, platform: "node", format: "esm", write: false });
    const { guideRewriteDocumentValidator, assertRewriteIdentity } = await import(
      `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
    const directory = "plans/redesign-canvas/guides-import";
    const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
    if (files.length !== 48) throw new Error("Expected exactly 48 review documents");
    const documents = [];
    for (const file of files) {
      const document = JSON.parse(await readFile(`${directory}/${file}`, "utf8"));
      validateDocument(document, guideRewriteDocumentValidator.json);
      assertRewriteIdentity(document);
      if (file !== `${document.slug}.json`) throw new Error(`Filename/slug mismatch: ${file}`);
      documents.push(document);
    }
    if (offline) {
      for (const document of documents) {
        log.entries.push({ slug: document.slug, outcome: "validated", action: "unknown-offline" });
        console.log(`${document.slug}: valid; create/update and changed fields require a deployment query`);
      }
    } else {
      await importDocuments(documents, run, log, save, actorId);
    }
    log.status = "complete";
  } catch (error) {
    log.status = "failed";
    log.error = error.message;
    throw error;
  } finally {
    log.finishedAt = new Date().toISOString();
    await save();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
