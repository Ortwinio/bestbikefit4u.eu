import { readFile, readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export function hasLegacyBrandCopy(value) {
  const allowed = value
    .replaceAll("bestbikefit4u_guides_cms_backlog_v1_", "")
    .replace(/(?:[a-z0-9._%+-]+@)?(?:[a-z0-9-]+\.)*bestbikefit4u\.eu\b/gi, "")
    .replace(/\/(?:[a-z0-9_.-]+\/)*bestbikefit4u[a-z0-9_.-]*\.(?:png|webp|jpg|svg|mp4|webm)\b/gi, "");
  return /bestbikefit4u/i.test(allowed);
}

export async function findLegacyBrandCopy(root = process.cwd()) {
  const findings = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "_generated") await visit(path);
        continue;
      }
      if (/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.name)) continue;
      if (!/\.(?:tsx?|json)$/.test(entry.name)) continue;
      const source = await readFile(path, "utf8");
      const file = relative(root, path);
      if (entry.name.endsWith(".json")) {
        if (hasLegacyBrandCopy(source)) findings.push({ file, line: 1 });
        continue;
      }
      const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
      function inspect(node) {
        if ((ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node)
          || ts.isTemplateTail(node) || ts.isJsxText(node)) && hasLegacyBrandCopy(node.text)) {
          findings.push({ file, line: parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1 });
        }
        ts.forEachChild(node, inspect);
      }
      inspect(parsed);
    }
  }
  for (const directory of ["src", "convex", "shared", "docs/cms-import"]) await visit(resolve(root, directory));
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = await findLegacyBrandCopy();
  for (const finding of findings) console.error(`${finding.file}:${finding.line}: legacy brand copy`);
  console.log(`Brand copy guard: ${findings.length === 0 ? "PASS" : "FAIL"} (${findings.length} findings)`);
  process.exitCode = findings.length === 0 ? 0 : 1;
}
