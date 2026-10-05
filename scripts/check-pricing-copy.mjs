import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const obsolete = /€\s*(?:24[,.]50|19[,.]50)|€\s*5\s*(?:korting|off)|\bannual_entry\b|\bPro\s+(?:monthly|maandelijks)\b|€\s*9\s*\/\s*(?:month|maand)/i;

export async function checkPricingCopy(directory = root) {
  const findings = [];
  async function visit(path) {
    const info = await stat(path).catch(() => null);
    if (!info) return;
    if (info.isDirectory()) {
      for (const name of await readdir(path)) await visit(join(path, name));
      return;
    }
    if (!/\.(?:tsx?|mjs|json)$/.test(path) || /\.(?:test|spec)\./.test(path)) return;
    const lines = (await readFile(path, "utf8")).split("\n");
    for (const [index, line] of lines.entries()) {
      if (obsolete.test(line)) findings.push(`${relative(directory, path)}:${index + 1}: obsolete pricing`);
    }
  }
  for (const scope of ["src", "convex/emails", "shared/pricing/products.ts"]) {
    await visit(join(directory, scope));
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = await checkPricingCopy();
  console.log(`Pricing copy guard: ${findings.length ? "FAIL" : "PASS"} (${findings.length} findings)`);
  for (const finding of findings) console.error(finding);
  if (findings.length) process.exitCode = 1;
}
