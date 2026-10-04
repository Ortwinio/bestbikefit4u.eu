import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const worktree = "/Users/ortwinverreck/Developer/bestbikefit4u-migratie";
const protectedPath = (path) => path === "plans/README.md"
  || path.startsWith("plans/cleanup/") || path.startsWith("plans/migratie/")
  || path.startsWith("plans/riderprofile-baseline/");
const historicalPath = (path) => path.startsWith("plans/")
  || path === "BestBikeFit4U_Redesign_Plan.docx";
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizePath(value) {
  if (typeof value !== "string" || value.startsWith("/") || value.includes("\\")) {
    throw new Error("Manifest paths must be repository-relative POSIX paths");
  }
  const normalized = posix.normalize(value);
  if (normalized === ".." || normalized.startsWith("../")) throw new Error("Path escapes repository");
  return normalized.replace(/\/$/, "");
}

export function auditReferences({ files, tracked, manifest }) {
  if (!manifest || !Array.isArray(manifest.keep) || !Array.isArray(manifest.outputParents)) {
    throw new Error("Manifest requires keep and outputParents arrays");
  }
  const seeds = manifest.keep.map((entry) => {
    if (!entry.reason || typeof entry.reason !== "string") throw new Error("Every keep entry needs a reason");
    return { path: normalizePath(entry.path), reason: entry.reason };
  });
  const outputParents = manifest.outputParents.map(normalizePath);
  const existing = new Set(files.keys());
  const candidates = [...new Set(tracked)].filter((path) => existing.has(path)
    && historicalPath(path) && !path.startsWith("plans/cleanup/")
    && !path.startsWith("plans/migratie/")).sort();
  const targets = new Set(candidates);
  const missingSeeds = seeds.filter((entry) => !existing.has(entry.path));
  if (missingSeeds.length) throw new Error(`Keep paths missing or ignored: ${missingSeeds.map((entry) => entry.path).join(", ")}`);
  const basenamePaths = new Map();
  for (const path of existing) {
    const basename = posix.basename(path);
    basenamePaths.set(basename, [...(basenamePaths.get(basename) ?? []), path]);
  }
  const patterns = candidates.map((path) => ({
    path,
    name: posix.basename(path),
    full: new RegExp(`(?<![A-Za-z0-9_.-])${escapePattern(path)}(?![A-Za-z0-9_.-])`),
    basename: basenamePaths.get(posix.basename(path)).length === 1
      ? new RegExp(`(?<![A-Za-z0-9_.-])${escapePattern(posix.basename(path))}(?![A-Za-z0-9_.-])`)
      : null,
  }));
  const incoming = new Map(candidates.map((path) => [path, []]));
  const outgoing = new Map();
  const roots = new Set();
  const reasons = new Map();
  const seed = (path, reason) => {
    roots.add(path);
    reasons.set(path, [...(reasons.get(path) ?? []), reason]);
  };
  for (const path of existing) {
    if (path.startsWith("plans/cleanup/")) continue;
    if (!historicalPath(path)) roots.add(path);
    if (protectedPath(path)) seed(path, "Protected plan path");
  }
  for (const entry of seeds) seed(entry.path, entry.reason);
  for (const [source, contents] of files) {
    if (source.startsWith("plans/cleanup/") || contents === null) continue;
    const lines = contents.split(/\r?\n/);
    const filePatterns = patterns.filter((pattern) => contents.includes(pattern.name));
    const edges = [];
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const relativeTargets = new Set();
      for (const match of line.matchAll(/(?:\.\.\/|\.\/)[^\s"'`<>()[\]{};,?#]+/g)) {
        relativeTargets.add(posix.normalize(posix.join(posix.dirname(source), match[0])));
      }
      for (const pattern of filePatterns) {
        if (source === pattern.path) continue;
        const methods = [];
        if (pattern.full.test(line)) methods.push("literal-path");
        if (relativeTargets.has(pattern.path)) methods.push("relative-path");
        if (pattern.basename?.test(line)) methods.push("unique-basename");
        if (!methods.length) continue;
        const edge = { source, target: pattern.path, line: lineIndex + 1, methods };
        incoming.get(pattern.path).push(edge);
        edges.push(edge);
      }
    }
    outgoing.set(source, edges);
  }
  const reached = new Set(roots);
  const queue = [...roots];
  for (let index = 0; index < queue.length; index += 1) {
    for (const edge of outgoing.get(queue[index]) ?? []) {
      if (reached.has(edge.target)) continue;
      reached.add(edge.target);
      queue.push(edge.target);
    }
  }
  const records = candidates.map((path) => {
    const references = incoming.get(path);
    const live = references.filter((edge) => reached.has(edge.source));
    const inactive = references.filter((edge) => !reached.has(edge.source));
    return {
      path,
      decision: reached.has(path) ? "keep" : "remove-candidate",
      reasons: reasons.get(path) ?? (live.length ? ["Referenced from a live root or retained plan"] : ["No live incoming reference found by static scan"]),
      referrers: live,
      removedOnlyIncomingRefs: inactive.length,
      inactiveReferrers: inactive,
    };
  });
  return {
    scope: "Existing tracked plan files; cleanup/migratie excluded from deletion candidates",
    limitations: ["Static text graph is evidence for review, not deletion authorization.",
      "Dynamic paths/globs require explicit keep entries expanded to individual existing files.",
      "Output parents preserve directory contracts only; they do not automatically retain old contents.",
      "Ignored, missing and binary content are not scanned. Binary candidate files require independent review.",
      "Unique-basename matches intentionally favor false-positive retention."],
    outputParents: outputParents.map((path) => ({ path,
      existingFiles: [...existing].filter((file) => file.startsWith(`${path}/`)).length })),
    scannedFiles: files.size,
    binaryFiles: [...files].filter(([, contents]) => contents === null).map(([path]) => path),
    protectedFiles: [...existing].filter(protectedPath).sort(),
    candidateCount: targets.size,
    keptCount: records.filter((record) => record.decision === "keep").length,
    removalCandidateCount: records.filter((record) => record.decision === "remove-candidate").length,
    records,
  };
}

function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error("Usage: node plans/cleanup/C1-reference-audit.mjs <manifest.json>");
  const manifestFile = resolve(worktree, manifestPath);
  if (!manifestFile.startsWith(`${worktree}/`)) throw new Error("Manifest must be inside migration worktree");
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  const list = (args) => execFileSync("git", ["-C", worktree, "ls-files", "-z", ...args],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }).split("\0").filter(Boolean);
  const tracked = list(["--cached", "--exclude-standard"]);
  const paths = [...new Set([...tracked, ...list(["--others", "--exclude-standard"])])];
  const files = new Map();
  for (const path of paths) {
    const absolute = resolve(worktree, path);
    if (!absolute.startsWith(`${worktree}/`)) throw new Error("Git path escapes migration worktree");
    let contents;
    try {
      const info = lstatSync(absolute);
      if (info.isSymbolicLink()) {
        files.set(path, null);
        continue;
      }
      if (!info.isFile()) continue;
      contents = readFileSync(absolute);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    files.set(path, contents.includes(0) ? null : contents.toString("utf8"));
  }
  process.stdout.write(`${JSON.stringify(auditReferences({ files, tracked, manifest }), null, 2)}\n`);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
