import { readFile, readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export function hasLegacyBrandCopy(value) {
  const allowed = value
    .replaceAll("bestbikefit4u_guides_cms_backlog_v1_", "")
    .replace(/\/(?:[a-z0-9_.-]+\/)*bestbikefit4u[a-z0-9_.-]*\.(?:png|webp|jpg|svg|mp4|webm)\b/gi, "");
  return /bestbikefit4u/i.test(allowed);
}

const legacyDomainFixtures = new Set([
  "shared/brand.test.ts",
  "next.config.test.ts",
  "src/lib/contentBrand.test.ts",
  "src/lib/csp.test.ts",
  "src/lib/seo/siteUrl.test.ts",
  "src/lib/seo/social-image.test.ts",
  "src/app/(public)/blog/page.test.tsx",
  "src/app/(public)/guides/[slug]/page.test.tsx",
  "convex/feedback/__tests__/mutations.contract.test.ts",
  "convex/guides/__tests__/mutations.contract.test.ts",
  "convex/migrations/domainMigration.contract.test.ts",
  "scripts/domain-migration-check.test.ts",
  "scripts/check-rebrand-copy.test.ts",
]);

export function hasDisallowedLegacyDomain(value, file) {
  if (!/bestbikefit4u\.eu\b/i.test(value.replaceAll("\\", ""))) return false;
  if (legacyDomainFixtures.has(file)) return false;
  if (["convex/migrations/domainMigration.ts", "scripts/domain-migration-check.mjs"].includes(file)
    && /^(?:https:\/\/)?(?:www\.)?bestbikefit4u\.eu\/?$/.test(value)) return false;
  if (file === "shared/brand.ts" && /^(?:www\.)?bestbikefit4u\.eu$/.test(value)) return false;
  if (["shared/brand.ts", "scripts/check-rebrand-copy.mjs"].includes(file)
    && value === "(?:[a-zA-Z0-9-]+\\.)*bestbikefit4u\\.eu") return false;
  return true;
}

export async function findLegacyBrandCopy(root = process.cwd()) {
  const findings = [];
  async function visit(directory, rootFilesOnly = false) {
    const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (!rootFilesOnly && entry.name !== "_generated") await visit(path);
        continue;
      }
      if (!/\.(?:[cm]?[jt]sx?|json)$/.test(entry.name)) continue;
      const source = await readFile(path, "utf8");
      const file = relative(root, path);
      const checkBrand = /^(?:src|convex|shared|docs\/cms-import)\//.test(file)
        && !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.name);
      function hasForbiddenCopy(value) {
        if (hasDisallowedLegacyDomain(value, file)) return true;
        if (file === "src/lib/contentBrand.ts"
          && value === "(?:\\/[^\\s<>\"']*)?|\\bBestBikeFit4U\\b") return false;
        const brandValue = value.replaceAll("\\", "")
          .replace(/(?:[a-z0-9._%+-]+@)?(?:[a-z0-9-]+\.)*bestbikefit4u\.eu\b/gi, "");
        return checkBrand && hasLegacyBrandCopy(brandValue);
      }
      if (entry.name.endsWith(".json")) {
        if (hasForbiddenCopy(source)) findings.push({ file, line: 1 });
        continue;
      }
      const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
      function inspect(node) {
        if (ts.isRegularExpressionLiteral(node)) {
          if (file !== "scripts/check-rebrand-copy.mjs" && hasDisallowedLegacyDomain(node.text, file)) {
            findings.push({ file, line: parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1 });
          }
          return;
        }
        if ((ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node)
          || ts.isTemplateTail(node) || ts.isJsxText(node))
          && hasForbiddenCopy(node.rawText ?? node.text)) {
          findings.push({ file, line: parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1 });
        }
        ts.forEachChild(node, inspect);
      }
      inspect(parsed);
    }
  }
  for (const directory of ["src", "convex", "shared", "scripts", "tests", "docs/cms-import"]) {
    await visit(resolve(root, directory));
  }
  await visit(root, true);
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = await findLegacyBrandCopy();
  for (const finding of findings) console.error(`${finding.file}:${finding.line}: legacy brand copy`);
  console.log(`Brand copy guard: ${findings.length === 0 ? "PASS" : "FAIL"} (${findings.length} findings)`);
  process.exitCode = findings.length === 0 ? 0 : 1;
}
