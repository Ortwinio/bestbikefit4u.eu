import { readdirSync, readFileSync, lstatSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";

const root = "/Users/ortwinverreck/Developer/bestbikefit4u-migratie";
const exact = new Map([
  ["plans/README.md", "Owner-required folder convention"],
  ["plans/tmux-ide-minimal-operating-convention.md", "Live policy linked by root README"],
  ["plans/rebrand/canvas/bikefitboost-merkblad.md", "Brand documentation dependency"],
  ["plans/rebrand/canvas/project/mail/N14Dag14.dc.html", "Email asset documentation dependency"],
  ["plans/redesign-canvas/audit/route-map.md", "Sweep route test input"],
  ["plans/redesign-canvas/audit/47-optimized.json", "Image comparison input"],
  ["plans/redesign-canvas/audit/44a-guides-audit.json", "Guide review input"],
  ["plans/seo-semrush/audit/S9-internal-links.json", "SEO discovery input"],
  ["plans/seo-semrush/audit/S10-before/summary.json", "Performance comparison input"],
  ["plans/seo-semrush/audit/S10-after/summary.json", "Performance comparison input"],
  ["plans/redesign-canvas/final-sweep/40a-nl/report.json", "NL reanalysis input"],
  ["plans/redesign-canvas/final-sweep/40a-nl/cases.jsonl", "NL reanalysis input"],
]);
const outputParents = [
  "plans/seo-crawl-fixes/audit", "plans/riderprofile-baseline", "plans/migratie/audit",
  "plans/rebrand/renders", "plans/rebrand/renders/emails", "plans/rebrand/audit",
  "plans/seo-semrush/audit", "plans/seo-semrush/renders", "plans/redesign-canvas/guides-import",
  "plans/redesign-canvas/illustration-sources/originals", "plans/redesign-canvas/illustration-sources/guides",
  "plans/redesign-canvas/audit", "plans/redesign-canvas/code-renders", "plans/redesign-canvas/final-sweep",
];
function keepReason(path) {
  if (exact.has(path)) return exact.get(path);
  if (/^plans\/(cleanup|migratie)\//.test(path)) return "Owner-protected active task/runbooks";
  if (path.startsWith("plans/riderprofile-baseline/")) return "18 October baseline operational materials";
  if (/^plans\/redesign-canvas\/guides-import\/[^/]+\.json$/.test(path)) return "Dynamic guide fixture/import input";
  if (/^plans\/redesign-canvas\/canvas\/FitRapport[1-6]\.dc\.html$/.test(path)) return "Dynamic PDF board input";
  if (path.startsWith("plans/redesign-canvas/illustration-sources/originals/")) return "Conservative dynamic original-image/GIF archive input";
  if (/^plans\/redesign-canvas\/drafts\/_renders\/(Guides|GuideDetail|BlogIndex|BlogArticle|About|FAQ|Contact|CaseStudy)\.png$/.test(path)) return "Marketing board comparison input";
  if (/^plans\/redesign-canvas\/code-renders\/44b-A\/.*\.png$/.test(path)) return "Dynamic guide image/rider review input";
  if (/^plans\/redesign-canvas\/code-renders\/(26|26-full)-report-(nl|en)\.pdf$/.test(path)) return "PDF verification input";
  if (outputParents.some((parent) => path === `${parent}/README.md`)) return "Output directory marker";
  return null;
}
const files = [];
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) visit(absolute);
    else {
      const path = relative(root, absolute);
      const stat = lstatSync(absolute);
      if (!stat.isFile()) throw new Error(`Refuse non-regular file: ${path}`);
      const contents = readFileSync(absolute);
      const reason = keepReason(path);
      files.push({ path, absolute, bytes: contents.length,
        sha256: createHash("sha256").update(contents).digest("hex"),
        binary: contents.includes(0) || /\.(docx|pdf|png|jpe?g|webp|zip)$/i.test(path),
        decision: reason ? "keep" : "remove", reason: reason ?? "Owner-approved historical-plan deletion; no retained runtime input in audited dependency table" });
    }
  }
}
visit(join(root, "plans"));
console.log(JSON.stringify({ root, outputParents, files }, null, 2));
