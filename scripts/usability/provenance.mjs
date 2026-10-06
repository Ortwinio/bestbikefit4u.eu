import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const sourceExtensions = /\.(?:[cm]?[jt]sx?|css|scss|sass|less|graphql|gql|mdx|html)$/i;
const inputExtensions = /\.(?:json|jsonl|csv|tsv|ya?ml|svg|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|mp4|webm)$/i;
const excludedDirectories = new Set(["node_modules", ".next", ".git", "renders", "screenshots", "artifacts", "coverage", "dist", "build", "_generated"]);
const applicationFolders = ["src", "shared", "convex"];
const harnessFolders = ["scripts/usability", "tests/visual"];
const rootBuildInput = /^(?:(?:next|postcss|tailwind|sentry\.[a-z-]+)\.config\.[cm]?[jt]s|instrumentation(?:-client)?\.[cm]?[jt]s|tsconfig(?:\.[\w-]+)?\.json|package(?:-lock)?\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|vercel\.json|\.nvmrc|\.npmrc)$/;
const testFile = /\.(?:test|spec)\.[cm]?[jt]sx?$/i;
const guideInputs = ["docs/bestbikefit4u_guides_cms_backlog_v1_nl.csv", "docs/bestbikefit4u_guides_cms_backlog_v1_en.csv"];

async function sourceFiles(root, folders, { inputs = false, ignoreTests = false, allFiles = false } = {}) {
  const files = [];
  async function walk(directory) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); }
    catch (error) { if (error.code === "ENOENT") return; throw error; }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if ((allFiles || !excludedDirectories.has(entry.name)) && !(ignoreTests && ["__tests__", "tests"].includes(entry.name))) await walk(path);
      } else if (entry.isFile() && !(ignoreTests && testFile.test(entry.name))
        && entry.name !== ".DS_Store" && (allFiles || sourceExtensions.test(entry.name) || inputs && inputExtensions.test(entry.name))
        && (allFiles || !/(?:\.tsbuildinfo|\.log|\.map|\.min\.[cm]?js)$/i.test(entry.name))) {
        files.push(path);
      }
    }
  }
  for (const folder of folders) await walk(resolve(root, folder));
  return files.sort((first, second) => first < second ? -1 : first > second ? 1 : 0);
}

async function appendExistingFile(files, filename) {
  try { if ((await stat(filename)).isFile()) files.push(filename); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}

async function buildInputFiles(root) {
  const files = await sourceFiles(root, [...applicationFolders, "data"], { inputs: true, ignoreTests: true });
  files.push(...await sourceFiles(root, ["public"], { allFiles: true }));
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isFile() && rootBuildInput.test(entry.name)) files.push(resolve(root, entry.name));
  }
  for (const name of guideInputs) await appendExistingFile(files, resolve(root, name));
  return [...new Set(files)].sort();
}

async function hashFiles(root, files) {
  const hash = createHash("sha256");
  for (const filename of [...new Set(files)].sort()) {
    const name = relative(root, filename).split(sep).join("/");
    const contentHash = createHash("sha256").update(await readFile(filename)).digest("hex");
    hash.update(`${name}\0${contentHash}\n`);
  }
  return hash.digest("hex");
}

export async function applicationFingerprint(root) {
  return hashFiles(root, await buildInputFiles(root));
}

export async function sourceFingerprint(root) {
  const files = [...await buildInputFiles(root), ...await sourceFiles(root, applicationFolders), ...await sourceFiles(root, harnessFolders)];
  await appendExistingFile(files, resolve(root, "scripts/usability-check.mjs"));
  return hashFiles(root, files);
}

export async function findSourcesNewerThanBuild(root, buildFile = resolve(root, ".next/BUILD_ID")) {
  const build = await stat(buildFile);
  const files = await buildInputFiles(root);
  const newer = [];
  for (const filename of files) {
    if ((await stat(filename)).mtimeMs > build.mtimeMs) newer.push(relative(root, filename).split(sep).join("/"));
  }
  return newer;
}

const nonblank = value => typeof value === "string" && value.trim().length > 0;
const sha256 = value => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const timestamp = value => typeof value === "string" && Number.isFinite(Date.parse(value));

export async function startBuildProvenance(root) {
  return { version: 1, startedAt: new Date().toISOString(), applicationHash: await applicationFingerprint(root) };
}

export async function finishBuildProvenance(root, start, buildFile = resolve(root, ".next/BUILD_ID")) {
  if (start?.version !== 1 || !sha256(start.applicationHash) || !timestamp(start.startedAt)) throw new Error("Invalid build-start provenance");
  if (await applicationFingerprint(root) !== start.applicationHash) throw new Error("Application inputs changed during build");
  const build = await stat(buildFile);
  if (build.mtimeMs < Date.parse(start.startedAt)) throw new Error("BUILD_ID predates build-start provenance");
  const buildId = (await readFile(buildFile, "utf8")).trim();
  if (!buildId) throw new Error("Build ID is empty");
  return { ...start, buildId, completedAt: new Date().toISOString() };
}

export async function verifyBuildProvenance(root, stamp, buildFile = resolve(root, ".next/BUILD_ID")) {
  if (stamp?.version !== 1 || !sha256(stamp.applicationHash) || !nonblank(stamp.buildId)
    || !timestamp(stamp.startedAt) || !timestamp(stamp.completedAt)
    || Date.parse(stamp.completedAt) < Date.parse(stamp.startedAt)) return { valid: false, reason: "Missing or invalid build provenance" };
  let buildId;
  try { buildId = (await readFile(buildFile, "utf8")).trim(); }
  catch (error) { if (error.code === "ENOENT") return { valid: false, reason: "Build ID is missing" }; throw error; }
  if (buildId !== stamp.buildId) return { valid: false, reason: "Build ID does not match provenance" };
  if (await applicationFingerprint(root) !== stamp.applicationHash) return { valid: false, reason: "Application inputs do not match the build" };
  return { valid: true, reason: null };
}

export function verifyManualDecision(review, record, required, { buildId, sourceHash, evidenceHash }) {
  if (!review || !nonblank(buildId) || !sha256(sourceHash) || !sha256(evidenceHash)
    || review.buildId !== buildId || review.sourceHash !== sourceHash
    || !sha256(record.screenshotHash) || !Array.isArray(review.checks)) return null;
  const matches = review.checks.filter(check => check && check.id === record.id
    && check.locale === record.locale && check.width === record.width && check.rule === required.rule);
  if (matches.length !== 1) return null;
  const check = matches[0];
  return ["pass", "fail"].includes(check.status) && nonblank(check.reviewer) && nonblank(check.note)
    && check.screenshotHash === record.screenshotHash && check.evidenceHash === evidenceHash
    ? check : null;
}

export function verifyManualApproval(review, record, required, provenance) {
  const decision = verifyManualDecision(review, record, required, provenance);
  return decision?.status === "pass" ? decision : null;
}
